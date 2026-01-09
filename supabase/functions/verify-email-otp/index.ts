import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

// Rate limiting constants
const VERIFY_ATTEMPT_LIMIT = 10; // Max 10 verification attempts per email per hour
const VERIFY_ATTEMPT_WINDOW_MS = 3600000; // 1 hour
const IP_VERIFY_LIMIT = 20; // Max 20 verification attempts per IP per hour

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp }: VerifyOTPRequest = await req.json();

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ error: "Email and OTP are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check email-based verification rate limit
    const { data: emailVerifyLimit } = await supabase
      .from("rate_limits")
      .select("request_count, window_start")
      .eq("identifier", `verify_${email}`)
      .eq("identifier_type", "email")
      .single();

    const emailWindowExpired = emailVerifyLimit?.window_start && 
      new Date().getTime() - new Date(emailVerifyLimit.window_start).getTime() > VERIFY_ATTEMPT_WINDOW_MS;

    if (emailVerifyLimit && !emailWindowExpired && emailVerifyLimit.request_count >= VERIFY_ATTEMPT_LIMIT) {
      return new Response(
        JSON.stringify({ error: "Too many verification attempts. Please request a new OTP." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check IP-based verification rate limit
    const { data: ipVerifyLimit } = await supabase
      .from("rate_limits")
      .select("request_count, window_start")
      .eq("identifier", `verify_${clientIP}`)
      .eq("identifier_type", "ip")
      .single();

    const ipWindowExpired = ipVerifyLimit?.window_start && 
      new Date().getTime() - new Date(ipVerifyLimit.window_start).getTime() > VERIFY_ATTEMPT_WINDOW_MS;

    if (ipVerifyLimit && !ipWindowExpired && ipVerifyLimit.request_count >= IP_VERIFY_LIMIT) {
      return new Response(
        JSON.stringify({ error: "Too many verification attempts from this location. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Increment rate limit counters immediately (before verification)
    const now = new Date().toISOString();
    
    await supabase
      .from("rate_limits")
      .upsert({
        identifier: `verify_${email}`,
        identifier_type: "email",
        request_count: emailWindowExpired || !emailVerifyLimit ? 1 : emailVerifyLimit.request_count + 1,
        window_start: emailWindowExpired || !emailVerifyLimit ? now : emailVerifyLimit.window_start
      }, { onConflict: "identifier,identifier_type" });

    await supabase
      .from("rate_limits")
      .upsert({
        identifier: `verify_${clientIP}`,
        identifier_type: "ip",
        request_count: ipWindowExpired || !ipVerifyLimit ? 1 : ipVerifyLimit.request_count + 1,
        window_start: ipWindowExpired || !ipVerifyLimit ? now : ipVerifyLimit.window_start
      }, { onConflict: "identifier,identifier_type" });

    // Get pending signup
    const { data: pending, error: fetchError } = await supabase
      .from("pending_signups")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError || !pending) {
      return new Response(
        JSON.stringify({ error: "No pending verification found. Please request a new OTP." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if already verified
    if (pending.verified) {
      return new Response(
        JSON.stringify({ success: true, message: "Email already verified" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check attempts (per-OTP limit - still useful for immediate feedback)
    if (pending.attempts >= 5) {
      return new Response(
        JSON.stringify({ error: "Too many attempts. Please request a new OTP." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check expiration (5 minutes)
    if (new Date(pending.otp_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "OTP has expired. Please request a new one." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify OTP
    if (pending.otp_code !== otp) {
      // Increment attempts in database
      await supabase
        .from("pending_signups")
        .update({ attempts: pending.attempts + 1 })
        .eq("email", email);

      return new Response(
        JSON.stringify({ error: "Invalid OTP. Please try again.", attemptsLeft: 4 - pending.attempts }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from("pending_signups")
      .update({ verified: true })
      .eq("email", email);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to verify. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email verified successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in verify-email-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

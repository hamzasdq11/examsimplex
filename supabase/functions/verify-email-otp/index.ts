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

    // Initialize Deno KV for rate limiting
    const kv = await Deno.openKv();

    // Check email-based verification rate limit
    const emailVerifyKey = ["otp_verify", "email", email];
    const emailVerifyLimit = await kv.get<number>(emailVerifyKey);
    
    if (emailVerifyLimit.value && emailVerifyLimit.value >= VERIFY_ATTEMPT_LIMIT) {
      await kv.close();
      return new Response(
        JSON.stringify({ error: "Too many verification attempts. Please request a new OTP." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check IP-based verification rate limit
    const ipVerifyKey = ["otp_verify", "ip", clientIP];
    const ipVerifyLimit = await kv.get<number>(ipVerifyKey);
    
    if (ipVerifyLimit.value && ipVerifyLimit.value >= IP_VERIFY_LIMIT) {
      await kv.close();
      return new Response(
        JSON.stringify({ error: "Too many verification attempts from this location. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Increment rate limit counters immediately (before verification)
    await kv.set(emailVerifyKey, (emailVerifyLimit.value || 0) + 1, { expireIn: VERIFY_ATTEMPT_WINDOW_MS });
    await kv.set(ipVerifyKey, (ipVerifyLimit.value || 0) + 1, { expireIn: VERIFY_ATTEMPT_WINDOW_MS });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get pending signup
    const { data: pending, error: fetchError } = await supabase
      .from("pending_signups")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError || !pending) {
      await kv.close();
      return new Response(
        JSON.stringify({ error: "No pending verification found. Please request a new OTP." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if already verified
    if (pending.verified) {
      await kv.close();
      return new Response(
        JSON.stringify({ success: true, message: "Email already verified" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check attempts (per-OTP limit - still useful for immediate feedback)
    if (pending.attempts >= 5) {
      await kv.close();
      return new Response(
        JSON.stringify({ error: "Too many attempts. Please request a new OTP." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check expiration (5 minutes)
    if (new Date(pending.otp_expires_at) < new Date()) {
      await kv.close();
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

      await kv.close();
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
      await kv.close();
      return new Response(
        JSON.stringify({ error: "Failed to verify. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    await kv.close();
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

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  email: string;
}

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Rate limiting constants
const OTP_REQUEST_LIMIT = 3; // Max 3 OTP requests per email
const OTP_REQUEST_WINDOW_MS = 600000; // 10 minutes
const IP_REQUEST_LIMIT = 5; // Max 5 requests per IP
const IP_REQUEST_WINDOW_MS = 3600000; // 1 hour

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SendOTPRequest = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
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

    // Check email-based rate limit
    const { data: emailLimit } = await supabase
      .from("rate_limits")
      .select("request_count, window_start")
      .eq("identifier", email)
      .eq("identifier_type", "email")
      .single();

    const emailWindowExpired = emailLimit?.window_start && 
      new Date().getTime() - new Date(emailLimit.window_start).getTime() > OTP_REQUEST_WINDOW_MS;

    if (emailLimit && !emailWindowExpired && emailLimit.request_count >= OTP_REQUEST_LIMIT) {
      return new Response(
        JSON.stringify({ error: "Too many OTP requests. Please wait 10 minutes before requesting again." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check IP-based rate limit
    const { data: ipLimit } = await supabase
      .from("rate_limits")
      .select("request_count, window_start")
      .eq("identifier", clientIP)
      .eq("identifier_type", "ip")
      .single();

    const ipWindowExpired = ipLimit?.window_start && 
      new Date().getTime() - new Date(ipLimit.window_start).getTime() > IP_REQUEST_WINDOW_MS;

    if (ipLimit && !ipWindowExpired && ipLimit.request_count >= IP_REQUEST_LIMIT) {
      return new Response(
        JSON.stringify({ error: "Too many requests from this location. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const existingUserData = existingUser?.users?.find(u => u.email === email);
    
    if (existingUserData) {
      // Check if user signed up via OAuth (Google)
      const isOAuthUser = existingUserData.app_metadata?.provider === 'google' ||
                          existingUserData.identities?.some(i => i.provider === 'google');
      
      if (isOAuthUser) {
        return new Response(
          JSON.stringify({ 
            error: "This email is registered via Google. Log in with Google, or use 'Forgot Password' to add a password.",
            errorType: "oauth_user"
          }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "This email is already registered. Please log in instead." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Upsert pending signup
    const { error: upsertError } = await supabase
      .from("pending_signups")
      .upsert(
        {
          email,
          otp_code: otp,
          otp_expires_at: expiresAt.toISOString(),
          attempts: 0,
          verified: false,
        },
        { onConflict: "email" }
      );

    if (upsertError) {
      console.error("Database error:", upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to create OTP. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "EXAM Simplex <noreply@examsimplex.com>",
      to: [email],
      subject: "Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Email Verification</h1>
          <p style="color: #666; font-size: 16px; text-align: center;">
            Your verification code is:
          </p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 14px; text-align: center;">
            This code will expire in 5 minutes.
          </p>
          <p style="color: #999; font-size: 12px; text-align: center;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
    });

    // Properly check for errors from Resend
    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      return new Response(
        JSON.stringify({ error: "Failed to send verification email. Please try again later." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update rate limit counters after successful send
    const now = new Date().toISOString();
    
    // Upsert email rate limit
    await supabase
      .from("rate_limits")
      .upsert({
        identifier: email,
        identifier_type: "email",
        request_count: emailWindowExpired || !emailLimit ? 1 : emailLimit.request_count + 1,
        window_start: emailWindowExpired || !emailLimit ? now : emailLimit.window_start
      }, { onConflict: "identifier,identifier_type" });

    // Upsert IP rate limit
    await supabase
      .from("rate_limits")
      .upsert({
        identifier: clientIP,
        identifier_type: "ip",
        request_count: ipWindowExpired || !ipLimit ? 1 : ipLimit.request_count + 1,
        window_start: ipWindowExpired || !ipLimit ? now : ipLimit.window_start
      }, { onConflict: "identifier,identifier_type" });

    console.log("Email sent successfully:", emailResponse.data);

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-email-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

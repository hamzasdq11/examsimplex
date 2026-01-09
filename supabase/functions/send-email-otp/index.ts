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

    // Initialize Deno KV for rate limiting
    const kv = await Deno.openKv();

    // Check email-based rate limit
    const emailRateLimitKey = ["otp_request", "email", email];
    const emailRateLimit = await kv.get<number>(emailRateLimitKey);
    
    if (emailRateLimit.value && emailRateLimit.value >= OTP_REQUEST_LIMIT) {
      await kv.close();
      return new Response(
        JSON.stringify({ error: "Too many OTP requests. Please wait 10 minutes before requesting again." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check IP-based rate limit
    const ipRateLimitKey = ["otp_request", "ip", clientIP];
    const ipRateLimit = await kv.get<number>(ipRateLimitKey);
    
    if (ipRateLimit.value && ipRateLimit.value >= IP_REQUEST_LIMIT) {
      await kv.close();
      return new Response(
        JSON.stringify({ error: "Too many requests from this location. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.email === email);
    
    if (userExists) {
      await kv.close();
      return new Response(
        JSON.stringify({ error: "This email is already registered. Please log in instead." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes (reduced from 10)

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
      await kv.close();
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
      await kv.close();
      return new Response(
        JSON.stringify({ error: "Failed to send verification email. Please try again later." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Increment rate limit counters after successful send
    await kv.set(emailRateLimitKey, (emailRateLimit.value || 0) + 1, { expireIn: OTP_REQUEST_WINDOW_MS });
    await kv.set(ipRateLimitKey, (ipRateLimit.value || 0) + 1, { expireIn: IP_REQUEST_WINDOW_MS });
    await kv.close();

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

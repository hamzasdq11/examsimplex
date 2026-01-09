-- Create table for pending password resets
CREATE TABLE public.pending_password_resets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  otp_code text NOT NULL,
  otp_expires_at timestamp with time zone NOT NULL,
  attempts integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_password_resets ENABLE ROW LEVEL SECURITY;

-- Only allow insert from edge functions (no direct access)
CREATE POLICY "Service role only" ON public.pending_password_resets
  FOR ALL USING (false);
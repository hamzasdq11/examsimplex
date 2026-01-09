-- Create pending_signups table for storing OTP verification data
CREATE TABLE public.pending_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  otp_code TEXT NOT NULL,
  otp_expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_signups ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts and updates for signup flow
CREATE POLICY "Anyone can insert pending signups"
ON public.pending_signups
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can select their pending signup by email"
ON public.pending_signups
FOR SELECT
USING (true);

CREATE POLICY "Anyone can update pending signups"
ON public.pending_signups
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete pending signups"
ON public.pending_signups
FOR DELETE
USING (true);

-- Add phone column to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
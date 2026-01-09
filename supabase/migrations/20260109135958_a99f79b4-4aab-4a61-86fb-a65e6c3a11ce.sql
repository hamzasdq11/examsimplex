-- Fix PUBLIC_DATA_EXPOSURE: pending_signups table has overly permissive RLS policies
-- The Edge Functions use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
-- So we only need to allow INSERT for initial signup requests

-- Drop the overly permissive SELECT policy (allows anyone to read all OTPs)
DROP POLICY IF EXISTS "Anyone can select their pending signup by email" ON public.pending_signups;

-- Drop the overly permissive UPDATE policy (allows anyone to modify any signup)
DROP POLICY IF EXISTS "Anyone can update pending signups" ON public.pending_signups;

-- Drop the overly permissive DELETE policy (allows anyone to delete any signup)
DROP POLICY IF EXISTS "Anyone can delete pending signups" ON public.pending_signups;

-- Keep the INSERT policy for initial signup (already exists, but recreate to be explicit)
DROP POLICY IF EXISTS "Anyone can insert pending signups" ON public.pending_signups;
CREATE POLICY "Anyone can insert pending signups" 
ON public.pending_signups 
FOR INSERT 
WITH CHECK (true);

-- Note: Edge Functions (send-email-otp, verify-email-otp, complete-signup) use 
-- SUPABASE_SERVICE_ROLE_KEY which bypasses RLS entirely, so they can still 
-- SELECT, UPDATE, and DELETE records as needed.
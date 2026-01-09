-- Clean up duplicate SELECT policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Keep only "Users can view own profile" which we created in the security fix
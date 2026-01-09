-- Drop the overly permissive "Anyone can view profiles" policy
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Admins can view all profiles (using existing has_role function)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'::app_role));
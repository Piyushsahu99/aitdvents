-- Drop the existing SELECT policy that exposes data to unauthenticated users
DROP POLICY IF EXISTS "Users can view allowed profiles" ON public.student_profiles;

-- Create a new policy that requires authentication to view other profiles
-- This prevents anonymous users from scraping phone numbers
CREATE POLICY "Users can view allowed profiles" 
ON public.student_profiles 
FOR SELECT 
USING (
  -- Users can always see their own profile
  (auth.uid() = user_id) 
  OR 
  -- Admins can see all profiles
  is_admin() 
  OR 
  -- Authenticated users can see public profiles (phone protected by share_phone_publicly flag via get_public_profile function)
  (is_public = true AND auth.uid() IS NOT NULL)
);

-- Add a comment explaining the security design
COMMENT ON POLICY "Users can view allowed profiles" ON public.student_profiles IS 
'Requires authentication to view public profiles. Phone visibility is further controlled by share_phone_publicly flag via the get_public_profile function.';
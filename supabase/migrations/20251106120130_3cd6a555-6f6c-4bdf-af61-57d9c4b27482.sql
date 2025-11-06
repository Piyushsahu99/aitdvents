-- Fix PUBLIC_DATA_EXPOSURE: Restrict student_profiles to authenticated users only
DROP POLICY IF EXISTS "Anyone can view student profiles" ON public.student_profiles;

CREATE POLICY "Authenticated users can view profiles" ON public.student_profiles
FOR SELECT 
USING (auth.uid() IS NOT NULL);
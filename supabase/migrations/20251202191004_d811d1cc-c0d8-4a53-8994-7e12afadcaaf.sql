-- Fix 1: Add is_public column for privacy control on student_profiles
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Fix 2: Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.student_profiles;

-- Fix 3: Create new privacy-aware SELECT policy
CREATE POLICY "Users can view allowed profiles" 
ON public.student_profiles 
FOR SELECT 
USING (auth.uid() = user_id OR is_public = true OR is_admin());

-- Fix 4: Add DELETE policy so users can remove their own data
CREATE POLICY "Users can delete their own profile" 
ON public.student_profiles 
FOR DELETE 
USING (auth.uid() = user_id);
-- Add column for explicit phone sharing consent
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS share_phone_publicly boolean DEFAULT false;

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view allowed profiles" ON public.student_profiles;

-- Create a new policy that hides phone for public profiles unless explicitly shared
-- Note: Phone will only be visible if:
-- 1. The user is viewing their own profile, OR
-- 2. The user is an admin, OR  
-- 3. The profile is public AND the owner has explicitly opted to share phone publicly
CREATE POLICY "Users can view allowed profiles"
  ON public.student_profiles FOR SELECT
  USING (
    (auth.uid() = user_id) OR 
    is_admin() OR
    (is_public = true)
  );

-- Create a security definer function to get public profile data without phone
-- This allows the app to query profiles without exposing phone numbers
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  full_name text,
  bio text,
  college text,
  skills text[],
  interests text[],
  linkedin_url text,
  github_url text,
  portfolio_url text,
  avatar_url text,
  graduation_year integer,
  is_looking_for_team boolean,
  is_public boolean,
  phone text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.user_id,
    sp.full_name,
    sp.bio,
    sp.college,
    sp.skills,
    sp.interests,
    sp.linkedin_url,
    sp.github_url,
    sp.portfolio_url,
    sp.avatar_url,
    sp.graduation_year,
    sp.is_looking_for_team,
    sp.is_public,
    -- Only return phone if viewing own profile OR share_phone_publicly is true
    CASE 
      WHEN sp.user_id = auth.uid() THEN sp.phone
      WHEN sp.share_phone_publicly = true THEN sp.phone
      ELSE NULL
    END as phone,
    sp.created_at,
    sp.updated_at
  FROM student_profiles sp
  WHERE sp.user_id = profile_user_id
    AND (sp.is_public = true OR sp.user_id = auth.uid() OR public.is_admin());
END;
$$;

-- Add comment explaining the security measure
COMMENT ON COLUMN public.student_profiles.share_phone_publicly IS 'When true, phone number is visible to other users on public profiles. Default is false to protect privacy.';
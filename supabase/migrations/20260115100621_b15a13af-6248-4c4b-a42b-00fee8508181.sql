-- Add unstop_referral_id column to student_profiles
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS unstop_referral_id TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.student_profiles.unstop_referral_id IS 'User Unstop referral ID for earning referral rewards when sharing events';
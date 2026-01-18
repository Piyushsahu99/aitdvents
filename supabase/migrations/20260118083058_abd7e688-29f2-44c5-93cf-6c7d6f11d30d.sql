-- Add new columns to issued_certificates table
ALTER TABLE public.issued_certificates 
ADD COLUMN IF NOT EXISTS certificate_type TEXT DEFAULT 'membership',
ADD COLUMN IF NOT EXISTS achievement_details JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS shared_to_linkedin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shared_to_twitter BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create monthly leaderboard winners table
CREATE TABLE IF NOT EXISTS public.monthly_leaderboard_winners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  user_id UUID NOT NULL,
  rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 3),
  points_earned INTEGER NOT NULL DEFAULT 0,
  certificate_id UUID REFERENCES public.issued_certificates(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(month, year, rank)
);

-- Enable RLS
ALTER TABLE public.monthly_leaderboard_winners ENABLE ROW LEVEL SECURITY;

-- RLS policies for monthly_leaderboard_winners
CREATE POLICY "Anyone can view leaderboard winners"
ON public.monthly_leaderboard_winners
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage leaderboard winners"
ON public.monthly_leaderboard_winners
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.student_profiles
    WHERE user_id = auth.uid()
    AND (full_name ILIKE '%admin%' OR email_verified = true)
  )
);

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_monthly_leaderboard_month_year ON public.monthly_leaderboard_winners(month, year);
CREATE INDEX IF NOT EXISTS idx_issued_certificates_type ON public.issued_certificates(certificate_type);
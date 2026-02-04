-- Quiz Templates table for reusable question banks
CREATE TABLE public.quiz_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  difficulty text DEFAULT 'medium',
  questions jsonb NOT NULL DEFAULT '[]',
  created_by uuid,
  is_public boolean DEFAULT false,
  use_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quiz Announcements for host-to-players messaging
CREATE TABLE public.quiz_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE,
  message text NOT NULL,
  sent_at timestamptz DEFAULT now()
);

-- Extend quizzes table with new features
ALTER TABLE public.quizzes
ADD COLUMN IF NOT EXISTS custom_code text,
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS theme_color text DEFAULT '#7c3aed',
ADD COLUMN IF NOT EXISTS require_registration boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS team_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS streak_bonus_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sound_effects boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS participant_approval boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS estimated_duration_minutes integer,
ADD COLUMN IF NOT EXISTS is_paused boolean DEFAULT false;

-- Create unique index for custom_code (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS quizzes_custom_code_unique ON public.quizzes(custom_code) WHERE custom_code IS NOT NULL;

-- Extend quiz_participants with avatars and streaks
ALTER TABLE public.quiz_participants
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS team_name text,
ADD COLUMN IF NOT EXISTS streak_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS reactions_sent text[] DEFAULT '{}';

-- Enable RLS on new tables
ALTER TABLE public.quiz_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_templates
CREATE POLICY "Anyone can view public templates"
ON public.quiz_templates FOR SELECT
USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create templates"
ON public.quiz_templates FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates"
ON public.quiz_templates FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own templates"
ON public.quiz_templates FOR DELETE
USING (auth.uid() = created_by);

-- RLS Policies for quiz_announcements
CREATE POLICY "Anyone can view announcements for their quiz"
ON public.quiz_announcements FOR SELECT
USING (true);

CREATE POLICY "Quiz hosts can create announcements"
ON public.quiz_announcements FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quizzes 
    WHERE id = quiz_id AND created_by = auth.uid()
  )
);

-- Enable realtime for announcements
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_announcements;

-- Add trigger for updated_at on quiz_templates
CREATE TRIGGER update_quiz_templates_updated_at
BEFORE UPDATE ON public.quiz_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Extend quizzes table with customization options
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS organizer_name text;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS banner_image text;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS category text DEFAULT 'general';
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'medium';
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS prizes jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS auto_advance boolean DEFAULT false;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS countdown_seconds integer DEFAULT 5;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS answer_reveal_seconds integer DEFAULT 3;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS shuffle_questions boolean DEFAULT false;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS shuffle_options boolean DEFAULT false;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS show_live_leaderboard boolean DEFAULT true;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS allow_late_join boolean DEFAULT false;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS scheduled_start timestamptz;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS registration_open boolean DEFAULT true;

-- Create quiz registrations table
CREATE TABLE IF NOT EXISTS public.quiz_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  registered_at timestamptz DEFAULT now(),
  reminder_sent boolean DEFAULT false,
  UNIQUE(quiz_id, user_id)
);

-- Enable RLS on quiz_registrations
ALTER TABLE public.quiz_registrations ENABLE ROW LEVEL SECURITY;

-- RLS policies for quiz_registrations
CREATE POLICY "Users can view their own registrations"
ON public.quiz_registrations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can register for quizzes"
ON public.quiz_registrations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unregister from quizzes"
ON public.quiz_registrations FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Quiz creators can view registrations"
ON public.quiz_registrations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes 
    WHERE quizzes.id = quiz_registrations.quiz_id 
    AND quizzes.created_by = auth.uid()
  )
);

-- Update quizzes RLS to allow authenticated users to create
DROP POLICY IF EXISTS "Authenticated users can create quizzes" ON public.quizzes;
CREATE POLICY "Authenticated users can create quizzes"
ON public.quizzes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Allow public quizzes to be viewed by anyone
DROP POLICY IF EXISTS "Public quizzes are viewable" ON public.quizzes;
CREATE POLICY "Public quizzes are viewable"
ON public.quizzes FOR SELECT
TO authenticated
USING (is_public = true OR created_by = auth.uid() OR public.is_admin());

-- Quiz creators can update their own quizzes
DROP POLICY IF EXISTS "Creators can update their quizzes" ON public.quizzes;
CREATE POLICY "Creators can update their quizzes"
ON public.quizzes FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR public.is_admin());

-- Enable realtime for registrations
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_registrations;
-- Create quiz status enum
CREATE TYPE quiz_status AS ENUM ('draft', 'waiting', 'active', 'question_active', 'question_ended', 'completed');

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  status quiz_status NOT NULL DEFAULT 'draft',
  quiz_code TEXT NOT NULL UNIQUE,
  max_participants INTEGER DEFAULT 100,
  current_question_idx INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_option_index INTEGER NOT NULL,
  time_limit_seconds INTEGER NOT NULL DEFAULT 30,
  points INTEGER NOT NULL DEFAULT 10,
  order_index INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_participants table
CREATE TABLE public.quiz_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  participant_name TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_score INTEGER NOT NULL DEFAULT 0,
  final_rank INTEGER,
  device_id TEXT,
  UNIQUE(quiz_id, device_id)
);

-- Create quiz_participant_answers table
CREATE TABLE public.quiz_participant_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.quiz_participants(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_option_index INTEGER NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_correct BOOLEAN NOT NULL DEFAULT false,
  time_taken_ms INTEGER NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE(participant_id, question_id)
);

-- Create indexes for performance
CREATE INDEX idx_quizzes_status ON public.quizzes(status);
CREATE INDEX idx_quizzes_quiz_code ON public.quizzes(quiz_code);
CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_participants_quiz_id ON public.quiz_participants(quiz_id);
CREATE INDEX idx_quiz_participant_answers_participant ON public.quiz_participant_answers(participant_id);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_participant_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quizzes
CREATE POLICY "Anyone can view active quizzes" ON public.quizzes
  FOR SELECT USING (status IN ('waiting', 'active', 'question_active', 'question_ended', 'completed') OR created_by = auth.uid() OR is_admin());

CREATE POLICY "Admins can manage all quizzes" ON public.quizzes
  FOR ALL USING (is_admin());

CREATE POLICY "Authenticated users can create quizzes" ON public.quizzes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Quiz creators can update their quizzes" ON public.quizzes
  FOR UPDATE USING (created_by = auth.uid() OR is_admin());

-- RLS Policies for quiz_questions
CREATE POLICY "Anyone can view questions of active quizzes" ON public.quiz_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q 
      WHERE q.id = quiz_questions.quiz_id 
      AND (q.status IN ('active', 'question_active', 'question_ended', 'completed') OR q.created_by = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Only quiz creators and admins can manage questions" ON public.quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q 
      WHERE q.id = quiz_questions.quiz_id 
      AND (q.created_by = auth.uid() OR is_admin())
    )
  );

-- RLS Policies for quiz_participants
CREATE POLICY "Anyone can view participants in active quizzes" ON public.quiz_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q 
      WHERE q.id = quiz_participants.quiz_id 
      AND (q.status != 'draft' OR q.created_by = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Anyone can join a waiting quiz" ON public.quiz_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quizzes q 
      WHERE q.id = quiz_participants.quiz_id 
      AND q.status = 'waiting'
    )
  );

CREATE POLICY "Admins and quiz creators can manage participants" ON public.quiz_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q 
      WHERE q.id = quiz_participants.quiz_id 
      AND (q.created_by = auth.uid() OR is_admin())
    )
  );

-- RLS Policies for quiz_participant_answers
CREATE POLICY "Participants can view their own answers" ON public.quiz_participant_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quiz_participants p 
      WHERE p.id = quiz_participant_answers.participant_id 
      AND (p.user_id = auth.uid() OR p.device_id IS NOT NULL)
    ) OR is_admin()
  );

CREATE POLICY "Participants can submit answers" ON public.quiz_participant_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_participants p 
      JOIN public.quizzes q ON q.id = p.quiz_id
      WHERE p.id = quiz_participant_answers.participant_id 
      AND q.status = 'question_active'
    )
  );

CREATE POLICY "Admins can manage all answers" ON public.quiz_participant_answers
  FOR ALL USING (is_admin());

-- Function to generate unique quiz code
CREATE OR REPLACE FUNCTION generate_quiz_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate quiz code
CREATE OR REPLACE FUNCTION set_quiz_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  IF NEW.quiz_code IS NULL OR NEW.quiz_code = '' THEN
    LOOP
      new_code := generate_quiz_code();
      SELECT EXISTS(SELECT 1 FROM public.quizzes WHERE quiz_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    NEW.quiz_code := new_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_quiz_code
  BEFORE INSERT ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION set_quiz_code();

-- Trigger to update updated_at
CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.quizzes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_participant_answers;
-- Create feedback table for collecting user reviews and suggestions
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  suggestion TEXT,
  issue TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can submit feedback (even anonymous users)
CREATE POLICY "Anyone can submit feedback"
ON public.feedback
FOR INSERT
WITH CHECK (true);

-- Users can view their own feedback, admins can view all
CREATE POLICY "Users can view own feedback"
ON public.feedback
FOR SELECT
USING ((user_id = auth.uid()) OR is_admin());

-- Only admins can delete feedback
CREATE POLICY "Only admins can delete feedback"
ON public.feedback
FOR DELETE
USING (is_admin());
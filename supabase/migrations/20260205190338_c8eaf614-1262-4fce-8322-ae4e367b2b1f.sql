-- Create learning_resources table for courses/playlists with student submissions
CREATE TABLE public.learning_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('course', 'playlist', 'tutorial')),
  platform TEXT NOT NULL,
  instructor_or_channel TEXT NOT NULL,
  thumbnail_url TEXT,
  link TEXT NOT NULL,
  language TEXT DEFAULT 'English',
  level TEXT DEFAULT 'Beginner',
  video_count TEXT,
  is_free BOOLEAN DEFAULT true,
  submitted_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;

-- Everyone can view approved resources
CREATE POLICY "Anyone can view approved learning resources"
ON public.learning_resources
FOR SELECT
USING (status = 'approved');

-- Authenticated users can view their own submissions
CREATE POLICY "Users can view their own submissions"
ON public.learning_resources
FOR SELECT
USING (auth.uid() = submitted_by);

-- Authenticated users can submit new resources
CREATE POLICY "Authenticated users can submit resources"
ON public.learning_resources
FOR INSERT
WITH CHECK (auth.uid() = submitted_by);

-- Admins can view all resources (using user_roles table)
CREATE POLICY "Admins can view all learning resources"
ON public.learning_resources
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update resources (approve/reject)
CREATE POLICY "Admins can update learning resources"
ON public.learning_resources
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admins can delete resources
CREATE POLICY "Admins can delete learning resources"
ON public.learning_resources
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_learning_resources_updated_at
BEFORE UPDATE ON public.learning_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
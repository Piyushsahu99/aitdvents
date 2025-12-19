-- Create campus ambassadors table
CREATE TABLE public.campus_ambassadors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  college TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  year_of_study TEXT NOT NULL,
  course TEXT NOT NULL,
  linkedin_url TEXT,
  instagram_url TEXT,
  why_ambassador TEXT NOT NULL,
  previous_experience TEXT,
  skills TEXT[],
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campus_ambassadors ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can apply as ambassador"
ON public.campus_ambassadors
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own applications"
ON public.campus_ambassadors
FOR SELECT
USING ((user_id = auth.uid()) OR is_admin());

CREATE POLICY "Admins can update applications"
ON public.campus_ambassadors
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete applications"
ON public.campus_ambassadors
FOR DELETE
USING (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_campus_ambassadors_updated_at
BEFORE UPDATE ON public.campus_ambassadors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
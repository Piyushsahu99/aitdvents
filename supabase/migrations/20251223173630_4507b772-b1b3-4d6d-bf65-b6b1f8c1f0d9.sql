-- Create study_materials table
CREATE TABLE public.study_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'notes', -- books, question_papers, notes, syllabus, other
  subject TEXT NOT NULL,
  course TEXT, -- e.g., B.Tech, BCA, MCA
  semester TEXT,
  year TEXT, -- for question papers (e.g., 2023, 2024)
  college TEXT,
  university TEXT,
  state TEXT,
  city TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT, -- pdf, doc, image
  file_size INTEGER,
  thumbnail_url TEXT,
  uploaded_by UUID NOT NULL,
  is_admin_upload BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  rejection_reason TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  downloads_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved materials
CREATE POLICY "Anyone can view approved materials"
ON public.study_materials
FOR SELECT
USING (status = 'approved' OR uploaded_by = auth.uid() OR is_admin());

-- Authenticated users can upload materials
CREATE POLICY "Authenticated users can upload materials"
ON public.study_materials
FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

-- Users can update their own pending materials
CREATE POLICY "Users can update their own materials"
ON public.study_materials
FOR UPDATE
USING (uploaded_by = auth.uid() OR is_admin());

-- Users can delete their own materials or admins can delete any
CREATE POLICY "Users can delete their own materials"
ON public.study_materials
FOR DELETE
USING (uploaded_by = auth.uid() OR is_admin());

-- Create updated_at trigger
CREATE TRIGGER update_study_materials_updated_at
BEFORE UPDATE ON public.study_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for study materials
INSERT INTO storage.buckets (id, name, public) VALUES ('study-materials', 'study-materials', true);

-- Storage policies for study materials bucket
CREATE POLICY "Anyone can view study materials files"
ON storage.objects FOR SELECT
USING (bucket_id = 'study-materials');

CREATE POLICY "Authenticated users can upload study materials"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'study-materials' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'study-materials' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'study-materials' AND auth.uid()::text = (storage.foldername(name))[1]);
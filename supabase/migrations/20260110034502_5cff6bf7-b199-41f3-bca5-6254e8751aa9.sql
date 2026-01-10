-- Create storage bucket for reel videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reel-videos', 
  'reel-videos', 
  true, 
  52428800, -- 50MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for reel videos
CREATE POLICY "Anyone can view reel videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'reel-videos');

CREATE POLICY "Authenticated users can upload reel videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reel-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own reel videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'reel-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own reel videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'reel-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add native_video_url column to reels for uploaded videos
ALTER TABLE public.reels ADD COLUMN IF NOT EXISTS native_video_url TEXT;
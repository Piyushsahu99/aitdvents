-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for event posters
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-posters', 'event-posters', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product-images bucket
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for event-posters bucket
CREATE POLICY "Anyone can view event posters"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-posters');

CREATE POLICY "Admins can upload event posters"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-posters' AND public.is_admin());

CREATE POLICY "Admins can update event posters"
ON storage.objects FOR UPDATE
USING (bucket_id = 'event-posters' AND public.is_admin());

CREATE POLICY "Admins can delete event posters"
ON storage.objects FOR DELETE
USING (bucket_id = 'event-posters' AND public.is_admin());
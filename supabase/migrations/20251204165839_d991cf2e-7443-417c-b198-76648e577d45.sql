-- Update avatars bucket with MIME type restrictions and file size limit
UPDATE storage.buckets 
SET 
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  file_size_limit = 5242880 -- 5MB in bytes
WHERE id = 'avatars';
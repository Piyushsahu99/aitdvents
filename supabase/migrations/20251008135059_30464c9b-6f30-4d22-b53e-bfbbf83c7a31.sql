-- Add poster_url and other fields to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS poster_url text,
ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_free boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS days_left integer,
ADD COLUMN IF NOT EXISTS applied_count integer DEFAULT 0;

-- Update existing events with sample poster URLs
UPDATE public.events
SET poster_url = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=400&fit=crop',
    is_online = true,
    is_free = true,
    days_left = 15,
    applied_count = 0
WHERE poster_url IS NULL;

-- Create event_galleries table for storing Drive links with passwords per event
CREATE TABLE public.event_galleries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_title TEXT NOT NULL,
  description TEXT,
  drive_link TEXT NOT NULL,
  password TEXT NOT NULL,
  cover_image_url TEXT,
  event_date TEXT,
  photo_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_galleries ENABLE ROW LEVEL SECURITY;

-- Public can see active galleries (but not the password or drive_link)
CREATE POLICY "Anyone can view active gallery metadata"
ON public.event_galleries
FOR SELECT
USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage galleries"
ON public.event_galleries
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_event_galleries_updated_at
BEFORE UPDATE ON public.event_galleries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

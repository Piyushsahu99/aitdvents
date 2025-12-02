-- Create site_content table for CMS
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  content_key TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text',
  content_value TEXT,
  image_url TEXT,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(page, section, content_key)
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can view active content
CREATE POLICY "Anyone can view active content"
ON public.site_content
FOR SELECT
USING (is_active = true OR is_admin());

-- Only admins can manage content
CREATE POLICY "Only admins can manage content"
ON public.site_content
FOR ALL
USING (is_admin());

-- Create page_banners table for promotional banners
CREATE TABLE public.page_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'top',
  title TEXT,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  link_text TEXT DEFAULT 'Learn More',
  background_color TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_banners ENABLE ROW LEVEL SECURITY;

-- Anyone can view active banners
CREATE POLICY "Anyone can view active banners"
ON public.page_banners
FOR SELECT
USING ((is_active = true AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now())) OR is_admin());

-- Only admins can manage banners
CREATE POLICY "Only admins can manage banners"
ON public.page_banners
FOR ALL
USING (is_admin());

-- Insert default hero content
INSERT INTO public.site_content (page, section, content_key, content_type, content_value) VALUES
('home', 'hero', 'title', 'text', 'DISCOVER • LEARN • COMPETE'),
('home', 'hero', 'subtitle', 'text', 'Your Gateway to Tech Events, Hackathons & Opportunities'),
('home', 'hero', 'description', 'text', 'Join AITD Events to explore workshops, hackathons, bounties, and career opportunities. Connect with peers and grow your skills.'),
('home', 'hero', 'cta_text', 'text', 'Get Started'),
('home', 'hero', 'cta_link', 'link', '/auth'),
('events', 'hero', 'title', 'text', 'UPCOMING EVENTS'),
('events', 'hero', 'subtitle', 'text', 'Discover and join exciting tech events near you'),
('bounties', 'hero', 'title', 'text', 'BOUNTIES & CHALLENGES'),
('bounties', 'hero', 'subtitle', 'text', 'Complete tasks, earn rewards, and build your portfolio'),
('courses', 'hero', 'title', 'text', 'LEARN & GROW'),
('courses', 'hero', 'subtitle', 'text', 'Master new skills with our curated courses');
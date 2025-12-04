-- Create reels table for educational content sharing
CREATE TABLE public.reels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true, -- Auto-approved for quick audience growth
  is_featured BOOLEAN DEFAULT false,
  reported_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false, -- Auto-hide if reported too many times
  platform TEXT NOT NULL, -- youtube, instagram, linkedin, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reel_likes table for tracking user likes
CREATE TABLE public.reel_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reel_id UUID NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(reel_id, user_id)
);

-- Create reel_reports table for content moderation
CREATE TABLE public.reel_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reel_id UUID NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, reviewed, dismissed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(reel_id, user_id) -- One report per user per reel
);

-- Enable RLS on all tables
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reel_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reel_reports ENABLE ROW LEVEL SECURITY;

-- Reels policies
CREATE POLICY "Anyone can view approved and non-hidden reels"
ON public.reels FOR SELECT
USING ((is_approved = true AND is_hidden = false) OR user_id = auth.uid() OR is_admin());

CREATE POLICY "Authenticated users can create reels"
ON public.reels FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reels"
ON public.reels FOR UPDATE
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can delete their own reels"
ON public.reels FOR DELETE
USING (auth.uid() = user_id OR is_admin());

-- Reel likes policies
CREATE POLICY "Anyone can view likes"
ON public.reel_likes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like reels"
ON public.reel_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
ON public.reel_likes FOR DELETE
USING (auth.uid() = user_id);

-- Reel reports policies
CREATE POLICY "Users can view their own reports"
ON public.reel_reports FOR SELECT
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Authenticated users can report reels"
ON public.reel_reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update reports"
ON public.reel_reports FOR UPDATE
USING (is_admin());

-- Create indexes for performance
CREATE INDEX idx_reels_category ON public.reels(category);
CREATE INDEX idx_reels_user_id ON public.reels(user_id);
CREATE INDEX idx_reels_created_at ON public.reels(created_at DESC);
CREATE INDEX idx_reel_likes_reel_id ON public.reel_likes(reel_id);

-- Function to auto-hide reels with too many reports
CREATE OR REPLACE FUNCTION public.check_reel_reports()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.reels
  SET reported_count = reported_count + 1,
      is_hidden = CASE WHEN reported_count >= 4 THEN true ELSE is_hidden END
  WHERE id = NEW.reel_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-hide reported reels
CREATE TRIGGER on_reel_report
AFTER INSERT ON public.reel_reports
FOR EACH ROW
EXECUTE FUNCTION public.check_reel_reports();

-- Function to update likes count
CREATE OR REPLACE FUNCTION public.update_reel_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reels SET likes_count = likes_count + 1 WHERE id = NEW.reel_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reels SET likes_count = likes_count - 1 WHERE id = OLD.reel_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for likes count
CREATE TRIGGER on_reel_like_change
AFTER INSERT OR DELETE ON public.reel_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_reel_likes_count();

-- Trigger for updated_at
CREATE TRIGGER update_reels_updated_at
BEFORE UPDATE ON public.reels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
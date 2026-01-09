-- Add a table to track reel watch time for coin rewards
CREATE TABLE public.reel_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reel_id UUID NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  watched_seconds INTEGER NOT NULL DEFAULT 0,
  earned_coins BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reel_id, user_id)
);

-- Enable RLS
ALTER TABLE public.reel_views ENABLE ROW LEVEL SECURITY;

-- Users can view their own watch history
CREATE POLICY "Users can view own watch history"
ON public.reel_views
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own watch records
CREATE POLICY "Users can create own watch records"
ON public.reel_views
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own watch records  
CREATE POLICY "Users can update own watch records"
ON public.reel_views
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_reel_views_user_id ON public.reel_views(user_id);
CREATE INDEX idx_reel_views_reel_id ON public.reel_views(reel_id);

-- Add REEL_WATCH action type constant (5 coins for watching 30+ seconds)
COMMENT ON TABLE public.reel_views IS 'Tracks user reel watch time. Users earn 5 coins after watching a reel for 30+ seconds (one-time per reel)';

-- Add trigger to update updated_at
CREATE TRIGGER update_reel_views_updated_at
BEFORE UPDATE ON public.reel_views
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
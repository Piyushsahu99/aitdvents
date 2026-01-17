-- Create earning_tasks table for brand-sponsored micro-tasks
CREATE TABLE public.earning_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  brand_logo_url TEXT,
  task_type TEXT NOT NULL DEFAULT 'social', -- social, engagement, survey, review
  platform TEXT, -- instagram, twitter, github, youtube, linkedin, etc.
  action_required TEXT NOT NULL, -- follow, like, star, subscribe, retweet, etc.
  task_url TEXT NOT NULL,
  reward_amount INTEGER NOT NULL DEFAULT 5, -- coins earned per completion
  reward_currency TEXT DEFAULT 'coins',
  max_completions INTEGER, -- null means unlimited
  current_completions INTEGER DEFAULT 0,
  bonus_pool INTEGER DEFAULT 0, -- bonus for top performers
  top_performers_count INTEGER DEFAULT 0, -- number of top performers who win bonus
  difficulty TEXT DEFAULT 'easy', -- easy, medium, hard
  verification_type TEXT DEFAULT 'manual', -- manual, automatic, screenshot
  instructions TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create task completions tracking table
CREATE TABLE public.task_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.earning_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  proof_url TEXT, -- screenshot or proof link
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  coins_earned INTEGER DEFAULT 0,
  bonus_earned INTEGER DEFAULT 0,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(task_id, user_id)
);

-- Enable RLS
ALTER TABLE public.earning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for earning_tasks
CREATE POLICY "Anyone can view active earning tasks"
  ON public.earning_tasks FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage earning tasks"
  ON public.earning_tasks FOR ALL
  USING (public.is_admin());

-- RLS policies for task_completions
CREATE POLICY "Users can view their own completions"
  ON public.task_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can submit completions"
  ON public.task_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all completions"
  ON public.task_completions FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update completions"
  ON public.task_completions FOR UPDATE
  USING (public.is_admin());

-- Add updated_at trigger
CREATE TRIGGER update_earning_tasks_updated_at
  BEFORE UPDATE ON public.earning_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample tasks
INSERT INTO public.earning_tasks (title, description, brand_name, task_type, platform, action_required, task_url, reward_amount, max_completions, bonus_pool, top_performers_count, instructions, is_featured) VALUES
('Follow AITD Events on Instagram', 'Follow our official Instagram page and stay updated with latest events', 'AITD Events', 'social', 'instagram', 'follow', 'https://instagram.com/aitdevents', 10, NULL, 500, 5, '1. Click the link\n2. Follow the page\n3. Take a screenshot\n4. Submit proof', true),
('Star our GitHub Repository', 'Star our open-source project repository on GitHub', 'AITD Events', 'engagement', 'github', 'star', 'https://github.com/aitdevents', 15, NULL, 300, 3, '1. Visit the GitHub repo\n2. Click the Star button\n3. Submit your GitHub username as proof', true),
('Join Telegram Community', 'Join our official Telegram community for exclusive updates', 'AITD Events', 'social', 'telegram', 'join', 'https://t.me/aitdevents', 10, NULL, 200, 10, '1. Click the link\n2. Join the group\n3. Submit your Telegram username', false),
('Subscribe to YouTube Channel', 'Subscribe to our YouTube channel for tutorials and event highlights', 'AITD Events', 'social', 'youtube', 'subscribe', 'https://youtube.com/@aitdevents', 20, 1000, 1000, 10, '1. Subscribe to the channel\n2. Turn on notifications\n3. Screenshot and submit', true);
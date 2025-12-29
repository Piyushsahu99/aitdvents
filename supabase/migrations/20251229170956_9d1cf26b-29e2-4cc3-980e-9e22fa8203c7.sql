-- =====================================================
-- PHASE 1: GAMIFICATION DATABASE ARCHITECTURE
-- =====================================================

-- 1. Enhance user_points table with new gamification columns
ALTER TABLE public.user_points 
ADD COLUMN IF NOT EXISTS level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS events_submitted integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS reels_uploaded integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS study_materials_uploaded integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS mentor_sessions_booked integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS resumes_created integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS connections_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_login_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_date date,
ADD COLUMN IF NOT EXISTS profile_completeness integer DEFAULT 0;

-- 2. Create points_transactions table for audit trail
CREATE TABLE public.points_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  action_type text NOT NULL,
  reference_id uuid,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on points_transactions
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
ON public.points_transactions FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "System can create transactions"
ON public.points_transactions FOR INSERT
WITH CHECK (true);

-- 3. Create rewards_catalog table
CREATE TABLE public.rewards_catalog (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  points_cost integer NOT NULL,
  category text NOT NULL DEFAULT 'merchandise',
  type text NOT NULL DEFAULT 'physical',
  image_url text,
  stock_quantity integer,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rewards_catalog
ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active rewards"
ON public.rewards_catalog FOR SELECT
USING (is_active = true OR is_admin());

CREATE POLICY "Only admins can manage rewards"
ON public.rewards_catalog FOR ALL
USING (is_admin());

-- 4. Create achievements table
CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'trophy',
  category text NOT NULL DEFAULT 'general',
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  points_reward integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active achievements"
ON public.achievements FOR SELECT
USING (is_active = true OR is_admin());

CREATE POLICY "Only admins can manage achievements"
ON public.achievements FOR ALL
USING (is_admin());

-- 5. Create user_achievements table
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
ON public.user_achievements FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "System can create user achievements"
ON public.user_achievements FOR INSERT
WITH CHECK (true);

-- 6. Create daily_login_rewards table
CREATE TABLE public.daily_login_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_number integer NOT NULL UNIQUE,
  points_reward integer NOT NULL,
  bonus_description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on daily_login_rewards
ALTER TABLE public.daily_login_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view login rewards"
ON public.daily_login_rewards FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage login rewards"
ON public.daily_login_rewards FOR ALL
USING (is_admin());

-- 7. Create mentors table
CREATE TABLE public.mentors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expertise text[] NOT NULL,
  title text NOT NULL,
  bio text,
  rate_per_session integer NOT NULL DEFAULT 50,
  availability jsonb,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  sessions_completed integer DEFAULT 0,
  rating numeric(2,1) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on mentors
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active mentors"
ON public.mentors FOR SELECT
USING (is_active = true OR user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can create their mentor profile"
ON public.mentors FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their mentor profile"
ON public.mentors FOR UPDATE
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Only admins can delete mentors"
ON public.mentors FOR DELETE
USING (is_admin());

-- 8. Create mentor_sessions table
CREATE TABLE public.mentor_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id uuid NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_at timestamp with time zone NOT NULL,
  duration_minutes integer DEFAULT 30,
  topic text NOT NULL,
  notes text,
  points_cost integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  meeting_link text,
  student_rating integer,
  student_review text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on mentor_sessions
ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their sessions"
ON public.mentor_sessions FOR SELECT
USING (student_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.mentors WHERE mentors.id = mentor_sessions.mentor_id AND mentors.user_id = auth.uid()
) OR is_admin());

CREATE POLICY "Students can create sessions"
ON public.mentor_sessions FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Participants can update sessions"
ON public.mentor_sessions FOR UPDATE
USING (student_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.mentors WHERE mentors.id = mentor_sessions.mentor_id AND mentors.user_id = auth.uid()
) OR is_admin());

-- 9. Insert default daily login rewards
INSERT INTO public.daily_login_rewards (day_number, points_reward, bonus_description) VALUES
(1, 2, 'Day 1 - Welcome back!'),
(2, 2, 'Day 2 - Keep going!'),
(3, 3, 'Day 3 - On a roll!'),
(4, 3, 'Day 4 - Halfway to bonus!'),
(5, 4, 'Day 5 - Almost there!'),
(6, 4, 'Day 6 - One more day!'),
(7, 15, 'Day 7 - Weekly Bonus! 🎉'),
(14, 20, 'Day 14 - Two Week Champion!'),
(21, 25, 'Day 21 - Three Week Legend!'),
(30, 50, 'Day 30 - Monthly Master! 🏆');

-- 10. Insert default achievements
INSERT INTO public.achievements (name, description, icon, category, requirement_type, requirement_value, points_reward) VALUES
-- Getting Started
('First Steps', 'Complete your profile to 100%', 'user-check', 'getting_started', 'profile_complete', 100, 15),
('Early Bird', 'Login 7 days in a row', 'sunrise', 'getting_started', 'login_streak', 7, 10),
('Connector', 'Make 10 network connections', 'users', 'getting_started', 'connections', 10, 15),
-- Content Creator
('Event Pioneer', 'Submit your first event', 'calendar', 'content_creator', 'events_submitted', 1, 10),
('Content King', 'Upload 10 reels', 'video', 'content_creator', 'reels_uploaded', 10, 25),
('Knowledge Sharer', 'Upload 5 study materials', 'book', 'content_creator', 'materials_uploaded', 5, 20),
-- Bounty Hunter
('Task Starter', 'Complete your first bounty', 'target', 'bounty_hunter', 'bounties_completed', 1, 15),
('Bounty Pro', 'Complete 10 bounties', 'trophy', 'bounty_hunter', 'bounties_completed', 10, 50),
('Bounty Legend', 'Complete 25 bounties', 'crown', 'bounty_hunter', 'bounties_completed', 25, 100),
-- Learner
('Course Beginner', 'Enroll in your first course', 'book-open', 'learner', 'courses_enrolled', 1, 5),
('Dedicated Learner', 'Complete 5 courses', 'graduation-cap', 'learner', 'courses_completed', 5, 30),
('Scholar', 'Complete 10 courses', 'award', 'learner', 'courses_completed', 10, 50),
-- Social
('Influencer', 'Refer 5 friends', 'share-2', 'social', 'referrals', 5, 30),
('Ambassador', 'Refer 15 friends', 'megaphone', 'social', 'referrals', 15, 75),
-- Streak Master
('Week Warrior', 'Maintain a 7-day login streak', 'flame', 'streak', 'login_streak', 7, 15),
('Month Master', 'Maintain a 30-day login streak', 'zap', 'streak', 'login_streak', 30, 75);

-- 11. Insert default rewards catalog
INSERT INTO public.rewards_catalog (name, description, points_cost, category, type, is_featured) VALUES
('AITD Stickers Pack', 'Premium vinyl stickers pack with AITD branding', 50, 'merchandise', 'physical', false),
('Coffee Mug', 'Ceramic mug with AITD logo', 100, 'merchandise', 'physical', false),
('Water Bottle', 'Stainless steel water bottle', 120, 'merchandise', 'physical', true),
('Tote Bag', 'Canvas tote bag with AITD design', 150, 'merchandise', 'physical', false),
('T-Shirt', 'Premium cotton t-shirt', 200, 'merchandise', 'physical', true),
('Premium Hoodie', 'Soft fleece hoodie', 300, 'merchandise', 'physical', true),
('Complete Swag Box', 'All merchandise items in one box!', 500, 'merchandise', 'physical', true),
('₹50 Amazon Gift Card', 'Amazon.in gift card', 250, 'gift_card', 'digital', false),
('₹100 Amazon Gift Card', 'Amazon.in gift card', 450, 'gift_card', 'digital', true),
('₹200 Amazon Gift Card', 'Amazon.in gift card', 850, 'gift_card', 'digital', false),
('AI Resume Builder (1 Download)', 'Generate a professional resume with AI', 30, 'service', 'digital', true),
('Premium Resume Template', 'Access to all premium templates', 50, 'service', 'digital', false),
('1 Mentor Session (30 min)', 'Book a session with any mentor', 50, 'service', 'digital', true);

-- 12. Create function to award points
CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id uuid,
  p_amount integer,
  p_action_type text,
  p_description text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total integer;
BEGIN
  -- Update or insert user points
  INSERT INTO public.user_points (user_id, total_points, lifetime_points, monthly_points, last_activity)
  VALUES (p_user_id, p_amount, p_amount, p_amount, now())
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_points.total_points + p_amount,
    lifetime_points = user_points.lifetime_points + p_amount,
    monthly_points = user_points.monthly_points + p_amount,
    xp = user_points.xp + p_amount,
    last_activity = now(),
    updated_at = now()
  RETURNING total_points INTO new_total;
  
  -- Log transaction
  INSERT INTO public.points_transactions (user_id, amount, action_type, description, reference_id)
  VALUES (p_user_id, p_amount, p_action_type, p_description, p_reference_id);
  
  RETURN new_total;
END;
$$;

-- 13. Create function to spend points
CREATE OR REPLACE FUNCTION public.spend_points(
  p_user_id uuid,
  p_amount integer,
  p_action_type text,
  p_description text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_points integer;
BEGIN
  -- Get current points
  SELECT total_points INTO current_points
  FROM public.user_points
  WHERE user_id = p_user_id;
  
  IF current_points IS NULL OR current_points < p_amount THEN
    RETURN false;
  END IF;
  
  -- Deduct points
  UPDATE public.user_points
  SET total_points = total_points - p_amount,
      last_activity = now(),
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log transaction (negative amount)
  INSERT INTO public.points_transactions (user_id, amount, action_type, description, reference_id)
  VALUES (p_user_id, -p_amount, p_action_type, p_description, p_reference_id);
  
  RETURN true;
END;
$$;

-- 14. Create function to check daily login
CREATE OR REPLACE FUNCTION public.check_daily_login(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_login date;
  current_streak integer;
  points_earned integer;
  streak_bonus integer;
  result jsonb;
BEGIN
  -- Get current streak and last login
  SELECT last_login_date, daily_login_streak 
  INTO last_login, current_streak
  FROM public.user_points
  WHERE user_id = p_user_id;
  
  -- If no record exists, create one
  IF last_login IS NULL THEN
    INSERT INTO public.user_points (user_id, total_points, lifetime_points, daily_login_streak, last_login_date)
    VALUES (p_user_id, 2, 2, 1, CURRENT_DATE)
    ON CONFLICT (user_id) DO UPDATE SET
      daily_login_streak = 1,
      last_login_date = CURRENT_DATE,
      total_points = user_points.total_points + 2,
      lifetime_points = user_points.lifetime_points + 2;
    
    INSERT INTO public.points_transactions (user_id, amount, action_type, description)
    VALUES (p_user_id, 2, 'daily_login', 'Day 1 - Welcome back!');
    
    RETURN jsonb_build_object('streak', 1, 'points_earned', 2, 'is_new_day', true);
  END IF;
  
  -- Check if already logged in today
  IF last_login = CURRENT_DATE THEN
    RETURN jsonb_build_object('streak', current_streak, 'points_earned', 0, 'is_new_day', false);
  END IF;
  
  -- Check if streak continues or resets
  IF last_login = CURRENT_DATE - 1 THEN
    current_streak := current_streak + 1;
  ELSE
    current_streak := 1;
  END IF;
  
  -- Get points for this streak day
  SELECT COALESCE(points_reward, 2) INTO points_earned
  FROM public.daily_login_rewards
  WHERE day_number = current_streak;
  
  IF points_earned IS NULL THEN
    points_earned := 2;
  END IF;
  
  -- Update user points
  UPDATE public.user_points
  SET daily_login_streak = current_streak,
      last_login_date = CURRENT_DATE,
      total_points = total_points + points_earned,
      lifetime_points = lifetime_points + points_earned,
      xp = xp + points_earned,
      last_activity = now(),
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log transaction
  INSERT INTO public.points_transactions (user_id, amount, action_type, description)
  VALUES (p_user_id, points_earned, 'daily_login', 'Day ' || current_streak || ' login bonus');
  
  RETURN jsonb_build_object('streak', current_streak, 'points_earned', points_earned, 'is_new_day', true);
END;
$$;
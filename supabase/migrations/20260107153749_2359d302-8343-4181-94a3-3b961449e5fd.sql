-- Fix award_points to only allow admins to award points
-- This prevents users from calling the RPC directly to give themselves unlimited points
CREATE OR REPLACE FUNCTION public.award_points(p_user_id uuid, p_amount integer, p_action_type text, p_description text DEFAULT NULL::text, p_reference_id uuid DEFAULT NULL::uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_total integer;
BEGIN
  -- SECURITY: Only admins can award points
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only system administrators can award points';
  END IF;

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

-- Fix spend_points to verify user can only spend their own points (unless admin)
CREATE OR REPLACE FUNCTION public.spend_points(p_user_id uuid, p_amount integer, p_action_type text, p_description text DEFAULT NULL::text, p_reference_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_points integer;
BEGIN
  -- SECURITY: Users can only spend their own points (unless admin)
  IF p_user_id != auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot spend other users points';
  END IF;

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

-- Fix check_daily_login to only allow users to check their own login streak
CREATE OR REPLACE FUNCTION public.check_daily_login(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  last_login date;
  current_streak integer;
  points_earned integer;
  streak_bonus integer;
  result jsonb;
BEGIN
  -- SECURITY: Users can only check their own login
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Can only check your own login';
  END IF;

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
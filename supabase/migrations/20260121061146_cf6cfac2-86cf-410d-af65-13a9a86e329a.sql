-- Add event_share action type to earn_points function
CREATE OR REPLACE FUNCTION public.earn_points(
  p_action_type TEXT,
  p_description TEXT,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_points INTEGER;
  v_already_earned BOOLEAN := FALSE;
BEGIN
  -- Get the current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Determine points based on action type (server-enforced values)
  CASE p_action_type
    WHEN 'event_register' THEN v_points := 5;
    WHEN 'event_submit' THEN v_points := 5;
    WHEN 'job_submit' THEN v_points := 10;
    WHEN 'reel_upload' THEN v_points := 10;
    WHEN 'reel_like' THEN v_points := 1;
    WHEN 'reel_watch' THEN v_points := 2;
    WHEN 'study_material_upload' THEN v_points := 15;
    WHEN 'course_enroll' THEN v_points := 10;
    WHEN 'course_complete' THEN v_points := 25;
    WHEN 'profile_complete' THEN v_points := 15;
    WHEN 'referral' THEN v_points := 25;
    WHEN 'daily_login' THEN v_points := 5;
    WHEN 'product_list' THEN v_points := 5;
    WHEN 'bounty_submit' THEN v_points := 20;
    WHEN 'hackathon_register' THEN v_points := 10;
    WHEN 'event_share' THEN v_points := 1;
    ELSE
      -- Unknown action type - reject
      RETURN FALSE;
  END CASE;

  -- Check for duplicate if reference_id is provided
  IF p_reference_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM points_transactions
      WHERE user_id = v_user_id
        AND action_type = p_action_type
        AND reference_id = p_reference_id
    ) INTO v_already_earned;
    
    IF v_already_earned THEN
      RETURN FALSE;
    END IF;
  END IF;

  -- Insert the transaction record
  INSERT INTO points_transactions (user_id, action_type, points, description, reference_id)
  VALUES (v_user_id, p_action_type, v_points, p_description, p_reference_id);

  -- Update user_points table
  INSERT INTO user_points (user_id, total_points, monthly_points, lifetime_points, shares_count)
  VALUES (v_user_id, v_points, v_points, v_points, CASE WHEN p_action_type = 'event_share' THEN 1 ELSE 0 END)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_points.total_points + v_points,
    monthly_points = user_points.monthly_points + v_points,
    lifetime_points = user_points.lifetime_points + v_points,
    shares_count = CASE WHEN p_action_type = 'event_share' THEN user_points.shares_count + 1 ELSE user_points.shares_count END,
    updated_at = NOW();

  RETURN TRUE;
END;
$$;
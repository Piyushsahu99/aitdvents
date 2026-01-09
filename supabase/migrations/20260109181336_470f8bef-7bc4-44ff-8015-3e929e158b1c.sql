-- Add reel_watch to the earn_points function (5 coins for watching 30+ seconds)
CREATE OR REPLACE FUNCTION public.earn_points(p_action_type text, p_description text DEFAULT NULL::text, p_reference_id uuid DEFAULT NULL::uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  caller_uid uuid := auth.uid();
  point_amount integer;
  new_total integer;
  existing_record uuid;
BEGIN
  -- Require authentication
  IF caller_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Map action types to fixed point values (cannot be manipulated by client)
  point_amount := CASE p_action_type
    WHEN 'event_register' THEN 5
    WHEN 'event_submit' THEN 5
    WHEN 'job_submit' THEN 10
    WHEN 'reel_upload' THEN 10
    WHEN 'reel_like' THEN 1
    WHEN 'reel_watch' THEN 2
    WHEN 'study_material_upload' THEN 15
    WHEN 'course_enroll' THEN 10
    WHEN 'course_complete' THEN 25
    WHEN 'profile_complete' THEN 15
    WHEN 'referral' THEN 25
    WHEN 'product_list' THEN 5
    WHEN 'bounty_submit' THEN 20
    WHEN 'hackathon_register' THEN 10
    ELSE NULL
  END;

  -- Reject invalid action types
  IF point_amount IS NULL THEN
    RAISE EXCEPTION 'Invalid action type: %', p_action_type;
  END IF;

  -- Check for duplicate rewards (if reference_id provided)
  IF p_reference_id IS NOT NULL THEN
    SELECT id INTO existing_record
    FROM public.points_transactions
    WHERE user_id = caller_uid
      AND action_type = p_action_type
      AND reference_id = p_reference_id;
    
    IF existing_record IS NOT NULL THEN
      -- Already rewarded for this action, return current total without error
      SELECT total_points INTO new_total
      FROM public.user_points
      WHERE user_id = caller_uid;
      RETURN COALESCE(new_total, 0);
    END IF;
  END IF;

  -- Update or insert user points
  INSERT INTO public.user_points (user_id, total_points, lifetime_points, monthly_points, last_activity)
  VALUES (caller_uid, point_amount, point_amount, point_amount, now())
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_points.total_points + point_amount,
    lifetime_points = user_points.lifetime_points + point_amount,
    monthly_points = user_points.monthly_points + point_amount,
    xp = user_points.xp + point_amount,
    last_activity = now(),
    updated_at = now()
  RETURNING total_points INTO new_total;
  
  -- Log transaction
  INSERT INTO public.points_transactions (user_id, amount, action_type, description, reference_id)
  VALUES (caller_uid, point_amount, p_action_type, p_description, p_reference_id);
  
  RETURN new_total;
END;
$function$;
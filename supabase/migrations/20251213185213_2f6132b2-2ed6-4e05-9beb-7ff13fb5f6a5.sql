-- Create reward_redemptions table to track redemption requests
CREATE TABLE public.reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  points_spent integer NOT NULL,
  reward_name text NOT NULL,
  reward_description text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  processed_by uuid,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own redemptions
CREATE POLICY "Users can view their own redemptions"
ON public.reward_redemptions
FOR SELECT
USING (user_id = auth.uid() OR is_admin());

-- Users can create redemptions
CREATE POLICY "Users can create redemptions"
ON public.reward_redemptions
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Only admins can update redemptions
CREATE POLICY "Only admins can update redemptions"
ON public.reward_redemptions
FOR UPDATE
USING (is_admin());

-- Only admins can delete redemptions
CREATE POLICY "Only admins can delete redemptions"
ON public.reward_redemptions
FOR DELETE
USING (is_admin());
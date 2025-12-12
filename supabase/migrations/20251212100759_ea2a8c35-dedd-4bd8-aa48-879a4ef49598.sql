-- Fix user_points RLS policies to prevent manipulation and restrict visibility
-- Users can only see their own points, only admins can modify

DROP POLICY IF EXISTS "Anyone can view points" ON user_points;
DROP POLICY IF EXISTS "Users can insert their own points" ON user_points;
DROP POLICY IF EXISTS "Users can update their own points" ON user_points;

-- Users can only view their own points
CREATE POLICY "Users can view their own points" ON user_points
FOR SELECT USING ((user_id = auth.uid()) OR is_admin());

-- Only admins can insert points
CREATE POLICY "Only admins can insert points" ON user_points
FOR INSERT WITH CHECK (is_admin());

-- Only admins can update points
CREATE POLICY "Only admins can update points" ON user_points
FOR UPDATE USING (is_admin());
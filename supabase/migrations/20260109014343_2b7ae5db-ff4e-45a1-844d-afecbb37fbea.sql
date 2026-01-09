-- Fix overly permissive INSERT policies

-- 1. Fix feedback table - require authentication for feedback submission
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Authenticated users can submit feedback" 
ON public.feedback 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Fix campus_ambassadors table - require authentication for applications
DROP POLICY IF EXISTS "Anyone can apply as ambassador" ON public.campus_ambassadors;
CREATE POLICY "Authenticated users can apply as ambassador" 
ON public.campus_ambassadors 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Fix points_transactions table - restrict to system only (admin or SECURITY DEFINER functions)
DROP POLICY IF EXISTS "System can create transactions" ON public.points_transactions;
-- Points transactions should ONLY be created via the award_points, spend_points, earn_points, check_daily_login functions
-- These are SECURITY DEFINER functions that bypass RLS, so no direct INSERT policy is needed
-- This prevents any direct manipulation of points

-- 4. Fix user_achievements table - restrict to admin only
DROP POLICY IF EXISTS "System can create user achievements" ON public.user_achievements;
CREATE POLICY "Admins can create user achievements" 
ON public.user_achievements 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin());

-- 5. Fix event_rsvps table - require authentication for RSVPs
DROP POLICY IF EXISTS "Anyone can create RSVP" ON public.event_rsvps;
CREATE POLICY "Authenticated users can create RSVP" 
ON public.event_rsvps 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
-- Fix: Add UPDATE policy for referrals table to enable referral code conversion during signup
CREATE POLICY "New users can claim referrals" ON public.referrals
FOR UPDATE
USING (referred_id IS NULL)
WITH CHECK (referred_id = auth.uid());
-- Fix admin invite function to verify email matches the invite
-- This prevents someone from using a stolen invite code with a different account

CREATE OR REPLACE FUNCTION public.use_admin_invite(invite_code_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invite_record RECORD;
  caller_uid uuid := auth.uid();
  caller_email text;
BEGIN
  -- Require authentication
  IF caller_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get caller's email from auth.users
  SELECT email INTO caller_email FROM auth.users WHERE id = caller_uid;
  
  -- Get and validate the invite
  SELECT * INTO invite_record
  FROM public.admin_invites
  WHERE invite_code = invite_code_input
    AND status = 'pending'
    AND expires_at > now();
  
  IF invite_record.id IS NULL THEN
    RETURN false;
  END IF;
  
  -- CRITICAL: Verify email matches the invite
  IF invite_record.email != caller_email THEN
    RAISE EXCEPTION 'This invite was sent to a different email address';
  END IF;
  
  -- Mark invite as used
  UPDATE public.admin_invites
  SET status = 'used', used_at = now()
  WHERE id = invite_record.id;
  
  -- Grant admin role to authenticated caller only
  INSERT INTO public.user_roles (user_id, role)
  VALUES (caller_uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;

-- Fix event-posters storage policy to allow authenticated users
-- The file path already includes user_id folder prefix for ownership control
DROP POLICY IF EXISTS "Admins can upload event posters" ON storage.objects;

CREATE POLICY "Authenticated users can upload event posters"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-posters' AND 
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own event posters"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-posters' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own event posters"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-posters' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
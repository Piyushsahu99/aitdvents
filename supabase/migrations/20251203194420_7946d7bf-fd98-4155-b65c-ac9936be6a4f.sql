-- Create admin invites table for invite-only admin creation
CREATE TABLE public.admin_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  invite_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '7 days'),
  used_at timestamp with time zone DEFAULT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired'))
);

-- Enable RLS
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage invites
CREATE POLICY "Admins can view all invites"
  ON public.admin_invites FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can create invites"
  ON public.admin_invites FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update invites"
  ON public.admin_invites FOR UPDATE
  USING (public.is_admin());

-- Function to validate and use admin invite
CREATE OR REPLACE FUNCTION public.validate_admin_invite(invite_code_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  SELECT * INTO invite_record
  FROM public.admin_invites
  WHERE invite_code = invite_code_input
    AND status = 'pending'
    AND expires_at > now();
  
  RETURN invite_record.id IS NOT NULL;
END;
$$;

-- Function to use admin invite and grant admin role
CREATE OR REPLACE FUNCTION public.use_admin_invite(invite_code_input text, user_id_input uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Get and validate the invite
  SELECT * INTO invite_record
  FROM public.admin_invites
  WHERE invite_code = invite_code_input
    AND status = 'pending'
    AND expires_at > now();
  
  IF invite_record.id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Mark invite as used
  UPDATE public.admin_invites
  SET status = 'used', used_at = now()
  WHERE id = invite_record.id;
  
  -- Grant admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id_input, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;

-- Add unique constraint on user_roles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END $$;
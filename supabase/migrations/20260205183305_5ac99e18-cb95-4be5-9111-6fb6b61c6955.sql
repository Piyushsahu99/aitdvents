-- Drop existing functions to change return type
DROP FUNCTION IF EXISTS public.add_admin_by_email(text);
DROP FUNCTION IF EXISTS public.add_team_member_by_email(text, text, text, text, text);

-- Create function to sync email from auth.users to student_profiles
CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.student_profiles
  SET email = (SELECT email FROM auth.users WHERE id = NEW.user_id)
  WHERE user_id = NEW.user_id AND email IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new profiles
DROP TRIGGER IF EXISTS sync_email_on_profile_insert ON public.student_profiles;
CREATE TRIGGER sync_email_on_profile_insert
  AFTER INSERT ON public.student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_email();

-- Backfill existing profiles with emails
UPDATE public.student_profiles sp
SET email = au.email
FROM auth.users au
WHERE sp.user_id = au.id AND sp.email IS NULL;

-- Improved add_admin_by_email that looks up in auth.users directly
CREATE OR REPLACE FUNCTION public.add_admin_by_email(admin_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  existing_role uuid;
BEGIN
  -- Check if current user is admin
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only admins can add other admins');
  END IF;

  -- Look up user by email in auth.users directly
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = lower(trim(admin_email));

  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found with this email. They need to sign up first.');
  END IF;

  -- Check if already admin
  SELECT id INTO existing_role
  FROM public.user_roles
  WHERE user_id = target_user_id AND role = 'admin';

  IF existing_role IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User is already an admin');
  END IF;

  -- Add admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin');

  RETURN jsonb_build_object('success', true, 'user_id', target_user_id);
END;
$$;

-- Improved add_team_member_by_email that looks up in auth.users directly
CREATE OR REPLACE FUNCTION public.add_team_member_by_email(
  member_email text,
  member_name text DEFAULT NULL,
  member_role_title text DEFAULT NULL,
  member_department text DEFAULT NULL,
  member_phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  new_member_id uuid;
  existing_member uuid;
  profile_name text;
BEGIN
  -- Check if current user is admin
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only admins can add team members');
  END IF;

  -- Look up user by email in auth.users directly
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = lower(trim(member_email));

  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found with this email. They need to sign up first.');
  END IF;

  -- Check if already a team member
  SELECT id INTO existing_member
  FROM public.team_members
  WHERE user_id = target_user_id;

  IF existing_member IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User is already a team member');
  END IF;

  -- Get name from profile if not provided
  SELECT full_name INTO profile_name
  FROM public.student_profiles
  WHERE user_id = target_user_id;

  -- Create team member record
  INSERT INTO public.team_members (user_id, full_name, email, role_title, department, phone)
  VALUES (
    target_user_id,
    COALESCE(member_name, profile_name, 'Team Member'),
    lower(trim(member_email)),
    member_role_title,
    member_department,
    member_phone
  )
  RETURNING id INTO new_member_id;

  -- Add core_team role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'core_team')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Create default permissions
  INSERT INTO public.team_permissions (team_member_id)
  VALUES (new_member_id);

  RETURN jsonb_build_object('success', true, 'member_id', new_member_id, 'user_id', target_user_id);
END;
$$;
-- Add email column to student_profiles for better user management
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_student_profiles_email ON public.student_profiles(email);

-- Create a function to get user email by user_id (using admin_invites or session)
CREATE OR REPLACE FUNCTION public.get_user_email(target_user_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- First try to get from student_profiles if it exists
  SELECT email INTO user_email FROM public.student_profiles WHERE user_id = target_user_id AND email IS NOT NULL;
  IF user_email IS NOT NULL THEN
    RETURN user_email;
  END IF;
  
  -- Try from admin_invites (for admins who used invite links)
  SELECT ai.email INTO user_email 
  FROM public.admin_invites ai 
  WHERE ai.status = 'used' 
  LIMIT 1;
  
  RETURN user_email;
END;
$$;

-- Create an RPC to add admin directly by email (finds user and adds role)
CREATE OR REPLACE FUNCTION public.add_admin_by_email(admin_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  result JSON;
BEGIN
  -- Check if current user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Only admins can add other admins');
  END IF;
  
  -- Find user by email in student_profiles
  SELECT user_id INTO target_user_id FROM public.student_profiles WHERE email = admin_email;
  
  IF target_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found with this email. They need to sign up first.');
  END IF;
  
  -- Check if already admin
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user_id AND role = 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'User is already an admin');
  END IF;
  
  -- Add admin role
  INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'admin');
  
  RETURN json_build_object('success', true, 'user_id', target_user_id);
END;
$$;

-- Create an RPC to add team member directly
CREATE OR REPLACE FUNCTION public.add_team_member_by_email(
  member_email TEXT,
  member_name TEXT,
  member_role_title TEXT DEFAULT NULL,
  member_department TEXT DEFAULT NULL,
  member_phone TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  new_member_id uuid;
BEGIN
  -- Check if current user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Only admins can add team members');
  END IF;
  
  -- Find user by email in student_profiles
  SELECT user_id INTO target_user_id FROM public.student_profiles WHERE email = member_email;
  
  IF target_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found with this email. They need to sign up first.');
  END IF;
  
  -- Check if already a team member
  IF EXISTS (SELECT 1 FROM public.team_members WHERE user_id = target_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'User is already a team member');
  END IF;
  
  -- Add team member
  INSERT INTO public.team_members (user_id, full_name, email, phone, role_title, department)
  VALUES (target_user_id, member_name, member_email, member_phone, member_role_title, member_department)
  RETURNING id INTO new_member_id;
  
  -- Add core_team role
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (target_user_id, 'core_team')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Create default permissions
  INSERT INTO public.team_permissions (team_member_id) VALUES (new_member_id);
  
  RETURN json_build_object('success', true, 'member_id', new_member_id, 'user_id', target_user_id);
END;
$$;

-- Grant execute on these functions
GRANT EXECUTE ON FUNCTION public.get_user_email(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_admin_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_team_member_by_email(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
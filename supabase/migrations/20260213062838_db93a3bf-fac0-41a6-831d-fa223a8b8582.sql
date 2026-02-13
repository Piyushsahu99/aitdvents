
-- Table for showcasing team members and ambassadors publicly
CREATE TABLE public.showcase_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  designation TEXT NOT NULL DEFAULT 'Member',
  role_type TEXT NOT NULL DEFAULT 'team' CHECK (role_type IN ('team', 'ambassador')),
  college TEXT,
  photo_url TEXT,
  bio TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.showcase_members ENABLE ROW LEVEL SECURITY;

-- Public can view active members
CREATE POLICY "Anyone can view active showcase members"
  ON public.showcase_members FOR SELECT
  USING (is_active = true);

-- Only admins can manage
CREATE POLICY "Admins can insert showcase members"
  ON public.showcase_members FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update showcase members"
  ON public.showcase_members FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete showcase members"
  ON public.showcase_members FOR DELETE
  USING (public.is_admin());

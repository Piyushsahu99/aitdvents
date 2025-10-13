-- Create community_links table for social links
CREATE TABLE public.community_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL,
  icon text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_links ENABLE ROW LEVEL SECURITY;

-- Anyone can view active community links
CREATE POLICY "Anyone can view active community links"
ON public.community_links
FOR SELECT
USING (is_active = true OR is_admin());

-- Only admins can manage community links
CREATE POLICY "Only admins can manage community links"
ON public.community_links
FOR ALL
USING (is_admin());

-- Insert default community links
INSERT INTO public.community_links (platform, url, icon, description, is_active) VALUES
('Discord', 'https://discord.gg/WRETdpBa', 'MessageSquare', 'Join our Discord server for real-time discussions', true),
('WhatsApp', 'https://chat.whatsapp.com/CN512BoNYCJ094XIKyLm8E', 'MessageCircle', 'Join our WhatsApp community', true),
('YouTube', 'https://youtube.com/@aitdevents', 'Youtube', 'Subscribe for tutorials and updates', true),
('Telegram', 'https://t.me/aitdevents', 'Send', 'Join our Telegram channel', true),
('Twitter/X', 'https://twitter.com/aitdevents', 'Twitter', 'Follow us on X for latest updates', true),
('Reddit', 'https://reddit.com/r/aitdevents', 'MessageSquareText', 'Join our Reddit community', true);

-- Create student_profiles table for networking
CREATE TABLE public.student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  bio text,
  college text,
  graduation_year integer,
  skills text[],
  linkedin_url text,
  github_url text,
  portfolio_url text,
  avatar_url text,
  is_looking_for_team boolean DEFAULT false,
  interests text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view public profiles
CREATE POLICY "Anyone can view student profiles"
ON public.student_profiles
FOR SELECT
USING (true);

-- Users can create their own profile
CREATE POLICY "Users can create their own profile"
ON public.student_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.student_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create student_groups table
CREATE TABLE public.student_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid NOT NULL,
  category text NOT NULL,
  max_members integer DEFAULT 10,
  is_public boolean DEFAULT true,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;

-- Anyone can view public groups
CREATE POLICY "Anyone can view public groups"
ON public.student_groups
FOR SELECT
USING (is_public = true OR created_by = auth.uid());

-- Authenticated users can create groups
CREATE POLICY "Authenticated users can create groups"
ON public.student_groups
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Group creators can update their groups
CREATE POLICY "Group creators can update their groups"
ON public.student_groups
FOR UPDATE
USING (auth.uid() = created_by);

-- Create group_members table
CREATE TABLE public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.student_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text DEFAULT 'member',
  joined_at timestamp with time zone DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Members can view group memberships
CREATE POLICY "Anyone can view group members"
ON public.group_members
FOR SELECT
USING (true);

-- Users can join groups
CREATE POLICY "Users can join groups"
ON public.group_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update tasks table to support user-posted tasks
ALTER TABLE public.bounties ADD COLUMN IF NOT EXISTS posted_by_student boolean DEFAULT false;
ALTER TABLE public.bounties ADD COLUMN IF NOT EXISTS task_type text DEFAULT 'company';

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column_community()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_community_links_updated_at
BEFORE UPDATE ON public.community_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column_community();

CREATE TRIGGER update_student_profiles_updated_at
BEFORE UPDATE ON public.student_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column_community();

CREATE TRIGGER update_student_groups_updated_at
BEFORE UPDATE ON public.student_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column_community();
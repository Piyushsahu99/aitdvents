
-- =============================================
-- CAMPUS AMBASSADOR PROGRAM - COMPLETE SCHEMA
-- =============================================

-- 1. Ambassador Program Cycles (6-month tenures)
CREATE TABLE public.ambassador_program_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  rewards_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ambassador_program_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active cycles" ON public.ambassador_program_cycles
  FOR SELECT USING (is_active = true OR is_admin());

CREATE POLICY "Only admins can manage cycles" ON public.ambassador_program_cycles
  FOR ALL USING (is_admin());

-- 2. Ambassador Tasks
CREATE TABLE public.ambassador_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID REFERENCES public.ambassador_program_cycles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  task_type TEXT NOT NULL DEFAULT 'general',
  points INTEGER NOT NULL DEFAULT 10,
  difficulty TEXT NOT NULL DEFAULT 'easy',
  max_completions INTEGER DEFAULT 1,
  deadline TIMESTAMP WITH TIME ZONE,
  instructions TEXT,
  required_proof TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ambassador_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassadors can view active tasks" ON public.ambassador_tasks
  FOR SELECT USING (is_active = true OR is_admin());

CREATE POLICY "Only admins can manage tasks" ON public.ambassador_tasks
  FOR ALL USING (is_admin());

-- 3. Ambassador Team Members (Core Team + Volunteers)
CREATE TABLE public.ambassador_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ambassador_id UUID REFERENCES public.campus_ambassadors(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES public.ambassador_program_cycles(id) ON DELETE CASCADE,
  user_id UUID,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  college TEXT,
  role TEXT NOT NULL DEFAULT 'volunteer',
  designation TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ambassador_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassadors can view their team members" ON public.ambassador_team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campus_ambassadors ca 
      WHERE ca.id = ambassador_team_members.ambassador_id 
      AND ca.user_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Ambassadors can add team members" ON public.ambassador_team_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campus_ambassadors ca 
      WHERE ca.id = ambassador_team_members.ambassador_id 
      AND ca.user_id = auth.uid()
    )
  );

CREATE POLICY "Ambassadors can update their team members" ON public.ambassador_team_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.campus_ambassadors ca 
      WHERE ca.id = ambassador_team_members.ambassador_id 
      AND ca.user_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Admins can delete team members" ON public.ambassador_team_members
  FOR DELETE USING (is_admin());

-- 4. Ambassador Task Submissions (Report-based)
CREATE TABLE public.ambassador_task_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.ambassador_tasks(id) ON DELETE CASCADE,
  ambassador_id UUID REFERENCES public.campus_ambassadors(id) ON DELETE CASCADE,
  submitted_by_user_id UUID,
  report_title TEXT NOT NULL,
  report_content TEXT NOT NULL,
  proof_images TEXT[] DEFAULT '{}',
  proof_links TEXT[] DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  points_awarded INTEGER DEFAULT 0,
  admin_feedback TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ambassador_task_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassadors can view their submissions" ON public.ambassador_task_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campus_ambassadors ca 
      WHERE ca.id = ambassador_task_submissions.ambassador_id 
      AND ca.user_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Ambassadors can create submissions" ON public.ambassador_task_submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campus_ambassadors ca 
      WHERE ca.id = ambassador_task_submissions.ambassador_id 
      AND ca.user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can update submissions" ON public.ambassador_task_submissions
  FOR UPDATE USING (is_admin());

-- 5. Ambassador Points (Per Cycle)
CREATE TABLE public.ambassador_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ambassador_id UUID REFERENCES public.campus_ambassadors(id) ON DELETE CASCADE,
  user_id UUID,
  cycle_id UUID REFERENCES public.ambassador_program_cycles(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  team_size INTEGER DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(ambassador_id, cycle_id)
);

ALTER TABLE public.ambassador_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard" ON public.ambassador_points
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage points" ON public.ambassador_points
  FOR ALL USING (is_admin());

-- 6. Ambassador Mentors
CREATE TABLE public.ambassador_mentors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  full_name TEXT NOT NULL,
  email TEXT,
  expertise TEXT[] DEFAULT '{}',
  bio TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ambassador_mentors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active mentors" ON public.ambassador_mentors
  FOR SELECT USING (is_active = true OR is_admin());

CREATE POLICY "Only admins can manage mentors" ON public.ambassador_mentors
  FOR ALL USING (is_admin());

-- 7. Ambassador Mentor Sessions
CREATE TABLE public.ambassador_mentor_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES public.ambassador_mentors(id) ON DELETE CASCADE,
  ambassador_id UUID REFERENCES public.campus_ambassadors(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  meeting_link TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ambassador_mentor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassadors can view their sessions" ON public.ambassador_mentor_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campus_ambassadors ca 
      WHERE ca.id = ambassador_mentor_sessions.ambassador_id 
      AND ca.user_id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM public.ambassador_mentors am 
      WHERE am.id = ambassador_mentor_sessions.mentor_id 
      AND am.user_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Ambassadors can book sessions" ON public.ambassador_mentor_sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campus_ambassadors ca 
      WHERE ca.id = ambassador_mentor_sessions.ambassador_id 
      AND ca.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can update sessions" ON public.ambassador_mentor_sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.campus_ambassadors ca 
      WHERE ca.id = ambassador_mentor_sessions.ambassador_id 
      AND ca.user_id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM public.ambassador_mentors am 
      WHERE am.id = ambassador_mentor_sessions.mentor_id 
      AND am.user_id = auth.uid()
    ) OR is_admin()
  );

-- 8. Ambassador Rewards Catalog
CREATE TABLE public.ambassador_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  reward_type TEXT NOT NULL DEFAULT 'merchandise',
  points_required INTEGER NOT NULL DEFAULT 100,
  rank_required INTEGER,
  quantity INTEGER,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ambassador_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active rewards" ON public.ambassador_rewards
  FOR SELECT USING (is_active = true OR is_admin());

CREATE POLICY "Only admins can manage rewards" ON public.ambassador_rewards
  FOR ALL USING (is_admin());

-- 9. Ambassador Reward Claims
CREATE TABLE public.ambassador_reward_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reward_id UUID REFERENCES public.ambassador_rewards(id) ON DELETE CASCADE,
  ambassador_id UUID REFERENCES public.campus_ambassadors(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES public.ambassador_program_cycles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  fulfillment_notes TEXT,
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ambassador_reward_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassadors can view their claims" ON public.ambassador_reward_claims
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campus_ambassadors ca 
      WHERE ca.id = ambassador_reward_claims.ambassador_id 
      AND ca.user_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Ambassadors can create claims" ON public.ambassador_reward_claims
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campus_ambassadors ca 
      WHERE ca.id = ambassador_reward_claims.ambassador_id 
      AND ca.user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can update claims" ON public.ambassador_reward_claims
  FOR UPDATE USING (is_admin());

-- 10. Ambassador Events (Online Parties, Meetups)
CREATE TABLE public.ambassador_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID REFERENCES public.ambassador_program_cycles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'online_party',
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  meeting_link TEXT,
  eligible_min_rank INTEGER,
  eligible_min_points INTEGER,
  food_coupon_value INTEGER DEFAULT 0,
  max_attendees INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ambassador_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassadors can view active events" ON public.ambassador_events
  FOR SELECT USING (is_active = true OR is_admin());

CREATE POLICY "Only admins can manage events" ON public.ambassador_events
  FOR ALL USING (is_admin());

-- 11. Ambassador Event Registrations
CREATE TABLE public.ambassador_event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.ambassador_events(id) ON DELETE CASCADE,
  ambassador_id UUID REFERENCES public.campus_ambassadors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered',
  food_coupon_code TEXT,
  attended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, ambassador_id)
);

ALTER TABLE public.ambassador_event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassadors can view their registrations" ON public.ambassador_event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campus_ambassadors ca 
      WHERE ca.id = ambassador_event_registrations.ambassador_id 
      AND ca.user_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Ambassadors can register for events" ON public.ambassador_event_registrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campus_ambassadors ca 
      WHERE ca.id = ambassador_event_registrations.ambassador_id 
      AND ca.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update registrations" ON public.ambassador_event_registrations
  FOR UPDATE USING (is_admin());

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.ambassador_task_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ambassador_points;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ambassador_team_members;

-- Create updated_at triggers
CREATE TRIGGER update_ambassador_program_cycles_updated_at
  BEFORE UPDATE ON public.ambassador_program_cycles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ambassador_tasks_updated_at
  BEFORE UPDATE ON public.ambassador_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ambassador_team_members_updated_at
  BEFORE UPDATE ON public.ambassador_team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ambassador_points_updated_at
  BEFORE UPDATE ON public.ambassador_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ambassador_mentors_updated_at
  BEFORE UPDATE ON public.ambassador_mentors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ambassador_mentor_sessions_updated_at
  BEFORE UPDATE ON public.ambassador_mentor_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ambassador_rewards_updated_at
  BEFORE UPDATE ON public.ambassador_rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ambassador_events_updated_at
  BEFORE UPDATE ON public.ambassador_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sample data

-- Sample Program Cycle
INSERT INTO public.ambassador_program_cycles (name, description, start_date, end_date, is_active, rewards_description)
VALUES (
  'Spring 2026 Batch',
  'Join our 6-month campus ambassador program and earn exciting rewards including stipends, merchandise, and exclusive opportunities!',
  '2026-01-01',
  '2026-06-30',
  true,
  'Stipends up to ₹5000, Premium merchandise, Internship opportunities, Certificates, Food coupons, Offline meetup invitations'
);

-- Sample Tasks
INSERT INTO public.ambassador_tasks (cycle_id, title, description, task_type, points, difficulty, instructions, required_proof)
SELECT 
  id,
  'Build Your Core Team',
  'Recruit 4-5 dedicated core team members from your college to help manage ambassador activities. Each member should have a specific role like Marketing Lead, Tech Lead, Content Lead, or Event Coordinator.',
  'team_building',
  200,
  'medium',
  '1. Identify potential team members from your college\n2. Explain the ambassador program benefits\n3. Assign specific roles to each member\n4. Register them through the Team tab\n5. Submit team details as proof',
  ARRAY['report', 'images']
FROM public.ambassador_program_cycles WHERE is_active = true;

INSERT INTO public.ambassador_tasks (cycle_id, title, description, task_type, points, difficulty, instructions, required_proof)
SELECT 
  id,
  'Recruit 10 Volunteers',
  'Build a volunteer network of at least 10 students who will help with event organization, content sharing, and campus awareness activities.',
  'recruitment',
  150,
  'medium',
  '1. Promote the volunteer opportunity in your college\n2. Collect volunteer details\n3. Register them through the Team tab\n4. Submit volunteer list with their contact info',
  ARRAY['report']
FROM public.ambassador_program_cycles WHERE is_active = true;

INSERT INTO public.ambassador_tasks (cycle_id, title, description, task_type, points, difficulty, instructions, required_proof)
SELECT 
  id,
  'Host Campus Awareness Event',
  'Organize an awareness event or workshop about AITD in your college. The event should have at least 30 attendees and cover platform features and opportunities.',
  'event',
  300,
  'hard',
  '1. Get necessary permissions from college\n2. Book venue and set date\n3. Create promotional materials\n4. Conduct the event\n5. Collect attendance and feedback\n6. Submit detailed report with photos',
  ARRAY['report', 'images', 'link']
FROM public.ambassador_program_cycles WHERE is_active = true;

INSERT INTO public.ambassador_tasks (cycle_id, title, description, task_type, points, difficulty, instructions, required_proof)
SELECT 
  id,
  'Social Media Campaign',
  'Share 20 posts about AITD events, opportunities, and features on your social media accounts (LinkedIn, Instagram, Twitter). Each post should have proper hashtags and tags.',
  'social',
  100,
  'easy',
  '1. Create engaging posts about AITD\n2. Use hashtags: #AITD #StudentOpportunities\n3. Tag AITD official accounts\n4. Share on multiple platforms\n5. Take screenshots of all posts',
  ARRAY['screenshot', 'link']
FROM public.ambassador_program_cycles WHERE is_active = true;

INSERT INTO public.ambassador_tasks (cycle_id, title, description, task_type, points, difficulty, instructions, required_proof)
SELECT 
  id,
  'Get 50 App Signups',
  'Drive 50 new user registrations on the AITD platform from your college. Track signups using your referral code.',
  'engagement',
  250,
  'hard',
  '1. Share your unique referral link\n2. Promote in college WhatsApp groups\n3. Conduct signup drives\n4. Track conversions in your dashboard\n5. Submit report with signup data',
  ARRAY['report', 'screenshot']
FROM public.ambassador_program_cycles WHERE is_active = true;

INSERT INTO public.ambassador_tasks (cycle_id, title, description, task_type, points, difficulty, instructions, required_proof)
SELECT 
  id,
  'Create Event Poster',
  'Design a creative poster for an upcoming AITD event or hackathon. The poster should be professional and shareable on social media.',
  'content',
  75,
  'easy',
  '1. Choose an event to promote\n2. Design poster with event details\n3. Include AITD branding\n4. Submit in high resolution',
  ARRAY['images']
FROM public.ambassador_program_cycles WHERE is_active = true;

INSERT INTO public.ambassador_tasks (cycle_id, title, description, task_type, points, difficulty, instructions, required_proof)
SELECT 
  id,
  'Write a Blog Post',
  'Write an engaging blog post about your experience as a campus ambassador, tips for students, or review of AITD platform features.',
  'content',
  150,
  'medium',
  '1. Choose a relevant topic\n2. Write minimum 500 words\n3. Include personal insights\n4. Add relevant images\n5. Submit blog link or document',
  ARRAY['link', 'report']
FROM public.ambassador_program_cycles WHERE is_active = true;

INSERT INTO public.ambassador_tasks (cycle_id, title, description, task_type, points, difficulty, instructions, required_proof)
SELECT 
  id,
  'Organize a Workshop',
  'Conduct a hands-on workshop on any tech topic (coding, design, career guidance) for students in your college with at least 20 participants.',
  'event',
  400,
  'hard',
  '1. Choose workshop topic\n2. Prepare presentation/materials\n3. Get venue and permissions\n4. Conduct workshop\n5. Collect attendance and photos\n6. Submit detailed report',
  ARRAY['report', 'images', 'link']
FROM public.ambassador_program_cycles WHERE is_active = true;

-- Sample Rewards
INSERT INTO public.ambassador_rewards (name, description, reward_type, points_required, rank_required, quantity)
VALUES 
  ('AITD T-Shirt', 'Premium quality AITD branded T-shirt', 'merchandise', 200, NULL, 100),
  ('Premium Hoodie', 'Comfortable AITD branded hoodie', 'merchandise', 500, NULL, 50),
  ('Tech Goodies Kit', 'Includes stickers, notebook, pen, and keychain', 'merchandise', 400, NULL, 75),
  ('Certificate of Excellence', 'Official certificate for outstanding performance', 'certificate', 300, NULL, NULL),
  ('Stipend ₹2,000', 'Cash reward for top performers', 'stipend', 800, 10, 10),
  ('Food Coupon ₹500', 'Zomato/Swiggy gift card for online party', 'food_coupon', 400, 20, 20),
  ('Offline Meetup Invite', 'Exclusive invitation to AITD offline event', 'event_invite', 600, 15, 15),
  ('Internship Opportunity', 'Referral for internship at partner companies', 'opportunity', 1000, 5, 5),
  ('Online Party Access', 'Access to exclusive virtual celebration event', 'event_invite', 400, 30, 30),
  ('Amazon Gift Card ₹1,000', 'Amazon shopping voucher', 'stipend', 900, 5, 5),
  ('Top Performer Trophy', 'Special recognition trophy for exceptional ambassadors', 'merchandise', 1500, 3, 3);

-- Sample Mentors
INSERT INTO public.ambassador_mentors (full_name, email, expertise, bio, is_active)
VALUES 
  ('Rahul Sharma', 'rahul.mentor@aitd.com', ARRAY['Event Management', 'Leadership', 'Public Speaking'], 'Experienced campus ambassador mentor with 5+ years in student engagement', true),
  ('Priya Patel', 'priya.mentor@aitd.com', ARRAY['Social Media Marketing', 'Content Creation', 'Branding'], 'Digital marketing expert specializing in student outreach', true),
  ('Amit Kumar', 'amit.mentor@aitd.com', ARRAY['Team Building', 'Project Management', 'Recruitment'], 'HR professional with expertise in building high-performing teams', true);

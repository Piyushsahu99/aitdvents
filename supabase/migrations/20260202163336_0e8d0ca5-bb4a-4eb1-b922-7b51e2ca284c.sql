-- Create crm_tasks table (Universal Task System)
CREATE TABLE public.crm_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  assigned_to uuid,
  assigned_by uuid,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'cancelled')),
  due_date timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  estimated_hours numeric,
  actual_hours numeric,
  category text,
  tags text[],
  points_reward integer DEFAULT 0,
  attachments text[],
  parent_task_id uuid,
  recurring boolean DEFAULT false,
  recurrence_pattern jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add self-reference FK after table creation
ALTER TABLE public.crm_tasks ADD CONSTRAINT crm_tasks_parent_fk FOREIGN KEY (parent_task_id) REFERENCES public.crm_tasks(id) ON DELETE SET NULL;

-- Create team_members table (Core Team Registry)
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  role_title text,
  department text CHECK (department IN ('marketing', 'technical', 'operations', 'design', 'content', 'hr', 'finance')),
  avatar_url text,
  join_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive')),
  reporting_to uuid,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Add self-reference FK
ALTER TABLE public.team_members ADD CONSTRAINT team_members_reporting_fk FOREIGN KEY (reporting_to) REFERENCES public.team_members(id) ON DELETE SET NULL;

-- Create team_permissions table (Granular Access Control)
CREATE TABLE public.team_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  can_manage_events boolean DEFAULT false,
  can_manage_jobs boolean DEFAULT false,
  can_manage_hackathons boolean DEFAULT false,
  can_manage_bounties boolean DEFAULT false,
  can_manage_scholarships boolean DEFAULT false,
  can_manage_reels boolean DEFAULT false,
  can_manage_store boolean DEFAULT false,
  can_manage_study_materials boolean DEFAULT false,
  can_view_users boolean DEFAULT false,
  can_assign_tasks boolean DEFAULT false,
  can_view_analytics boolean DEFAULT false,
  can_send_announcements boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(team_member_id)
);

-- Create kpi_definitions table
CREATE TABLE public.kpi_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  calculation_type text DEFAULT 'count' CHECK (calculation_type IN ('count', 'sum', 'average', 'percentage', 'custom')),
  target_value numeric NOT NULL,
  target_period text DEFAULT 'monthly' CHECK (target_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  entity_type text DEFAULT 'platform' CHECK (entity_type IN ('user', 'team', 'platform')),
  metric_source text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  icon text DEFAULT 'activity',
  color text DEFAULT 'primary',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create kpi_records table
CREATE TABLE public.kpi_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id uuid NOT NULL REFERENCES public.kpi_definitions(id) ON DELETE CASCADE,
  entity_id uuid,
  entity_type text DEFAULT 'platform' CHECK (entity_type IN ('user', 'team', 'platform')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  current_value numeric DEFAULT 0,
  target_value numeric NOT NULL,
  percentage numeric DEFAULT 0,
  trend text DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activity_log table
CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action_type text NOT NULL,
  action_description text,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Create announcements table
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  target_audience text DEFAULT 'all' CHECK (target_audience IN ('all', 'team', 'students', 'specific')),
  target_users uuid[],
  published_by uuid,
  published_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_pinned boolean DEFAULT false,
  is_read_by uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create task_comments table
CREATE TABLE public.task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.crm_tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  comment text NOT NULL,
  attachments text[],
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create time_logs table
CREATE TABLE public.time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.crm_tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  hours numeric NOT NULL,
  description text,
  logged_at date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create is_core_team function
CREATE OR REPLACE FUNCTION public.is_core_team()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'core_team'
  )
$$;

-- Create get_team_member_permissions function
CREATE OR REPLACE FUNCTION public.get_team_member_permissions()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT jsonb_build_object(
      'can_manage_events', tp.can_manage_events,
      'can_manage_jobs', tp.can_manage_jobs,
      'can_manage_hackathons', tp.can_manage_hackathons,
      'can_manage_bounties', tp.can_manage_bounties,
      'can_manage_scholarships', tp.can_manage_scholarships,
      'can_manage_reels', tp.can_manage_reels,
      'can_manage_store', tp.can_manage_store,
      'can_manage_study_materials', tp.can_manage_study_materials,
      'can_view_users', tp.can_view_users,
      'can_assign_tasks', tp.can_assign_tasks,
      'can_view_analytics', tp.can_view_analytics,
      'can_send_announcements', tp.can_send_announcements
    )
    FROM public.team_members tm
    JOIN public.team_permissions tp ON tp.team_member_id = tm.id
    WHERE tm.user_id = auth.uid()
    LIMIT 1),
    '{}'::jsonb
  )
$$;

-- Create log_activity function
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action_type text,
  p_action_description text,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO public.activity_log (user_id, action_type, action_description, entity_type, entity_id, metadata)
  VALUES (auth.uid(), p_action_type, p_action_description, p_entity_type, p_entity_id, p_metadata)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_crm_tasks_updated_at BEFORE UPDATE ON public.crm_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_permissions_updated_at BEFORE UPDATE ON public.team_permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kpi_definitions_updated_at BEFORE UPDATE ON public.kpi_definitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kpi_records_updated_at BEFORE UPDATE ON public.kpi_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crm_tasks
CREATE POLICY "Admins have full access to tasks" ON public.crm_tasks FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Core team can manage tasks they can assign" ON public.crm_tasks FOR ALL TO authenticated USING (public.is_core_team() AND (SELECT (public.get_team_member_permissions()->>'can_assign_tasks')::boolean)) WITH CHECK (public.is_core_team() AND (SELECT (public.get_team_member_permissions()->>'can_assign_tasks')::boolean));
CREATE POLICY "Users can view their assigned tasks" ON public.crm_tasks FOR SELECT TO authenticated USING (assigned_to = auth.uid());
CREATE POLICY "Users can update their own task status" ON public.crm_tasks FOR UPDATE TO authenticated USING (assigned_to = auth.uid()) WITH CHECK (assigned_to = auth.uid());

-- RLS Policies for team_members
CREATE POLICY "Admins have full access to team members" ON public.team_members FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Team members can view all team members" ON public.team_members FOR SELECT TO authenticated USING (public.is_core_team());
CREATE POLICY "Team members can update own profile" ON public.team_members FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- RLS Policies for team_permissions
CREATE POLICY "Admins have full access to permissions" ON public.team_permissions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Team members can view own permissions" ON public.team_permissions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.id = team_member_id AND tm.user_id = auth.uid()));

-- RLS Policies for kpi_definitions
CREATE POLICY "Admins have full access to KPI definitions" ON public.kpi_definitions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Core team can view KPI definitions" ON public.kpi_definitions FOR SELECT TO authenticated USING (public.is_core_team());

-- RLS Policies for kpi_records
CREATE POLICY "Admins have full access to KPI records" ON public.kpi_records FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Core team can view KPI records" ON public.kpi_records FOR SELECT TO authenticated USING (public.is_core_team());
CREATE POLICY "Users can view own KPI records" ON public.kpi_records FOR SELECT TO authenticated USING (entity_id = auth.uid() AND entity_type = 'user');

-- RLS Policies for activity_log
CREATE POLICY "Admins have full access to activity log" ON public.activity_log FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Core team with analytics can view logs" ON public.activity_log FOR SELECT TO authenticated USING (public.is_core_team() AND (SELECT (public.get_team_member_permissions()->>'can_view_analytics')::boolean));

-- RLS Policies for announcements
CREATE POLICY "Admins have full access to announcements" ON public.announcements FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Core team with permission can manage announcements" ON public.announcements FOR ALL TO authenticated USING (public.is_core_team() AND (SELECT (public.get_team_member_permissions()->>'can_send_announcements')::boolean)) WITH CHECK (public.is_core_team() AND (SELECT (public.get_team_member_permissions()->>'can_send_announcements')::boolean));
CREATE POLICY "Users can view relevant announcements" ON public.announcements FOR SELECT TO authenticated USING (
  target_audience = 'all' OR
  (target_audience = 'team' AND public.is_core_team()) OR
  (target_audience = 'students' AND NOT public.is_core_team() AND NOT public.is_admin()) OR
  (target_audience = 'specific' AND auth.uid() = ANY(target_users))
);

-- RLS Policies for task_comments
CREATE POLICY "Admins have full access to comments" ON public.task_comments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Task participants can view comments" ON public.task_comments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.crm_tasks t WHERE t.id = task_id AND (t.assigned_to = auth.uid() OR t.assigned_by = auth.uid()))
);
CREATE POLICY "Task participants can add comments" ON public.task_comments FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.crm_tasks t WHERE t.id = task_id AND (t.assigned_to = auth.uid() OR t.assigned_by = auth.uid()))
);

-- RLS Policies for time_logs
CREATE POLICY "Admins have full access to time logs" ON public.time_logs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Users can manage own time logs" ON public.time_logs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Core team can view all time logs" ON public.time_logs FOR SELECT TO authenticated USING (public.is_core_team());

-- Create indexes for performance
CREATE INDEX idx_crm_tasks_assigned_to ON public.crm_tasks(assigned_to);
CREATE INDEX idx_crm_tasks_status ON public.crm_tasks(status);
CREATE INDEX idx_crm_tasks_due_date ON public.crm_tasks(due_date);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at);
CREATE INDEX idx_announcements_target_audience ON public.announcements(target_audience);
CREATE INDEX idx_kpi_records_kpi_id ON public.kpi_records(kpi_id);
CREATE INDEX idx_time_logs_task_id ON public.time_logs(task_id);
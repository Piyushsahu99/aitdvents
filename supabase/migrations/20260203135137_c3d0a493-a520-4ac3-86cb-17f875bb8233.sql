-- =============================================
-- HRM Enhancement: New Tables and Extensions
-- =============================================

-- 1. Leave/Availability Management Table
CREATE TABLE public.team_leaves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES public.team_members(id) ON DELETE CASCADE,
  leave_type text NOT NULL DEFAULT 'vacation',
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  status text DEFAULT 'pending',
  approved_by uuid REFERENCES public.team_members(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Performance Reviews Table
CREATE TABLE public.performance_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES public.team_members(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES public.team_members(id),
  review_period text NOT NULL,
  self_rating integer CHECK (self_rating >= 1 AND self_rating <= 5),
  manager_rating integer CHECK (manager_rating >= 1 AND manager_rating <= 5),
  strengths text,
  improvements text,
  goals text,
  overall_feedback text,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Team Documents Table
CREATE TABLE public.team_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES public.team_members(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  uploaded_by uuid,
  is_verified boolean DEFAULT false,
  expires_at date,
  created_at timestamptz DEFAULT now()
);

-- 4. Onboarding Checklists Table
CREATE TABLE public.onboarding_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES public.team_members(id) ON DELETE CASCADE,
  checklist_items jsonb DEFAULT '[]',
  mentor_id uuid REFERENCES public.team_members(id),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  status text DEFAULT 'in_progress'
);

-- 5. Extend team_members table
ALTER TABLE public.team_members
ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS emergency_contact text,
ADD COLUMN IF NOT EXISTS stipend_amount decimal(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_remote boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Asia/Kolkata';

-- =============================================
-- Row Level Security Policies
-- =============================================

-- Enable RLS
ALTER TABLE public.team_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_checklists ENABLE ROW LEVEL SECURITY;

-- Team Leaves Policies
CREATE POLICY "Admins can manage all leaves"
ON public.team_leaves FOR ALL
USING (public.is_admin());

CREATE POLICY "Core team can view all leaves"
ON public.team_leaves FOR SELECT
USING (public.is_core_team());

CREATE POLICY "Team members can view own leaves"
ON public.team_leaves FOR SELECT
USING (
  team_member_id IN (
    SELECT id FROM public.team_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team members can create own leave requests"
ON public.team_leaves FOR INSERT
WITH CHECK (
  team_member_id IN (
    SELECT id FROM public.team_members WHERE user_id = auth.uid()
  )
);

-- Performance Reviews Policies
CREATE POLICY "Admins can manage all reviews"
ON public.performance_reviews FOR ALL
USING (public.is_admin());

CREATE POLICY "Team members can view own reviews"
ON public.performance_reviews FOR SELECT
USING (
  team_member_id IN (
    SELECT id FROM public.team_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team members can create own self reviews"
ON public.performance_reviews FOR INSERT
WITH CHECK (
  team_member_id IN (
    SELECT id FROM public.team_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team members can update own draft reviews"
ON public.performance_reviews FOR UPDATE
USING (
  status = 'draft' AND
  team_member_id IN (
    SELECT id FROM public.team_members WHERE user_id = auth.uid()
  )
);

-- Team Documents Policies
CREATE POLICY "Admins can manage all documents"
ON public.team_documents FOR ALL
USING (public.is_admin());

CREATE POLICY "Team members can view own documents"
ON public.team_documents FOR SELECT
USING (
  team_member_id IN (
    SELECT id FROM public.team_members WHERE user_id = auth.uid()
  )
);

-- Onboarding Checklists Policies
CREATE POLICY "Admins can manage all checklists"
ON public.onboarding_checklists FOR ALL
USING (public.is_admin());

CREATE POLICY "Team members can view and update own checklist"
ON public.onboarding_checklists FOR SELECT
USING (
  team_member_id IN (
    SELECT id FROM public.team_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team members can update own checklist"
ON public.onboarding_checklists FOR UPDATE
USING (
  team_member_id IN (
    SELECT id FROM public.team_members WHERE user_id = auth.uid()
  )
);

-- Mentors can view assigned mentee checklists
CREATE POLICY "Mentors can view assigned checklists"
ON public.onboarding_checklists FOR SELECT
USING (
  mentor_id IN (
    SELECT id FROM public.team_members WHERE user_id = auth.uid()
  )
);

-- =============================================
-- Updated_at Triggers
-- =============================================

CREATE TRIGGER update_team_leaves_updated_at
BEFORE UPDATE ON public.team_leaves
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_reviews_updated_at
BEFORE UPDATE ON public.performance_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
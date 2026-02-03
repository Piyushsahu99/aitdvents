
# HRM System Enhancement Plan

## Current State Analysis

The platform has a foundational HRM/CRM system with these existing components:

### Existing Tables
- `team_members` - Core team data with role_title, department, status, reporting_to
- `team_permissions` - Granular 12-permission access control
- `crm_tasks` - Task management with priority, status, due dates, points
- `time_logs` - Time tracking (hours, description, logged_at) - **NOT IMPLEMENTED IN UI**
- `task_comments` - Task comments with attachments, internal flag - **NOT IMPLEMENTED IN UI**
- `kpi_definitions` / `kpi_records` - Performance metrics
- `activity_log` - Audit trail
- `announcements` - Team/user communications

### Existing UI Components
- `CRMDashboard.tsx` - Overview with 6 tabs
- `TeamMemberManager.tsx` - Add/edit members and permissions
- `TaskManager.tsx` - Basic task CRUD with filters
- `KPIDashboard.tsx` - KPI visualization
- `ActivityLogViewer.tsx` - Activity log browser
- `AnnouncementManager.tsx` - Announcement publishing
- `TeamPanel.tsx` - Core team member's personal dashboard

### Key Gaps Identified
1. **Time Logging UI** - Table exists but no interface to log/view hours
2. **Task Comments** - No commenting system on tasks
3. **Leave Management** - No attendance/leave tracking
4. **Team Hierarchy** - `reporting_to` exists but not visualized
5. **Performance Reviews** - No review/feedback system
6. **Payroll Tracking** - No stipend/compensation management (for volunteer appreciation)
7. **Document Management** - No HR document storage
8. **Onboarding Workflows** - No structured onboarding for new team members

---

## Proposed Improvements

### Part 1: Enhanced Task Management

**1.1 Task Comments & Collaboration**

Add a comment section to each task allowing team members to discuss progress, ask questions, and share updates.

| Feature | Description |
|---------|-------------|
| Threaded comments | Reply to specific comments |
| @mentions | Tag team members in comments |
| Attachments | Upload files to comments |
| Internal/Public | Toggle visibility of comments |
| Rich text | Basic formatting support |

**1.2 Time Tracking Integration**

Implement the existing `time_logs` table with a proper UI:

| Feature | Description |
|---------|-------------|
| Log hours | Quick entry form per task |
| Time summary | Total hours per task/user/week |
| Timesheet view | Weekly/monthly timesheet report |
| Actual vs estimated | Compare logged hours to estimates |
| Export reports | Download time reports as CSV |

**1.3 Task Kanban Board**

Add a drag-and-drop Kanban view alongside the table view:

```
| Pending | In Progress | Review | Completed |
|---------|-------------|--------|-----------|
| [Task1] | [Task3]     | [Task5]| [Task6]   |
| [Task2] | [Task4]     |        | [Task7]   |
```

**1.4 Subtasks**

Leverage existing `parent_task_id` column for checklist-style subtasks:

- Break large tasks into smaller items
- Track completion percentage
- Collapse/expand subtask groups

---

### Part 2: Team Management Enhancements

**2.1 Organization Chart**

Visualize team hierarchy using `reporting_to` field:

```
            [Super Admin]
                 |
     +-----------+-----------+
     |           |           |
[Marketing]  [Technical]  [Operations]
     |           |
  [Member1]   [Member2]
  [Member3]   [Member4]
```

**2.2 Team Member Profiles**

Enhanced profile cards showing:
- Avatar and contact info
- Role and department
- Join date and tenure
- Tasks assigned/completed
- Time logged this month
- Skills and expertise tags
- Performance score

**2.3 Leave & Availability Management**

New table and UI for tracking team availability:

| Field | Type | Description |
|-------|------|-------------|
| start_date | date | Leave start |
| end_date | date | Leave end |
| leave_type | text | vacation/sick/personal |
| status | text | pending/approved/rejected |
| approved_by | uuid | Manager who approved |
| notes | text | Reason/comments |

Features:
- Request leave form
- Calendar view of team availability
- Leave balance tracking
- Approval workflow (manager approves)
- Conflict detection (overlapping leaves)

**2.4 Attendance Tracking (Optional)**

Simple check-in/check-out for volunteer tracking:
- Daily login detection (auto-logged)
- Streak tracking
- Monthly attendance summary

---

### Part 3: Performance & Analytics

**3.1 Individual Performance Dashboard**

Each team member sees:
- Personal KPIs and targets
- Tasks completed vs assigned
- Average task completion time
- On-time delivery rate
- Peer feedback received
- Monthly/quarterly trends

**3.2 Performance Reviews**

Structured review system:

| Feature | Description |
|---------|-------------|
| Review cycles | Quarterly/monthly schedules |
| Self-assessment | Team member fills own review |
| Manager review | Reporting manager provides feedback |
| Goal setting | Set objectives for next period |
| 360 feedback | Peer feedback option |

**3.3 Enhanced KPI Management**

- Allow admins to create custom KPIs
- Individual KPI assignment
- Real-time progress tracking
- Automated alerts when targets at risk

---

### Part 4: Document & Resource Management

**4.1 HR Documents Storage**

New section for storing team documents:
- Offer letters and certificates
- Policy documents
- Training materials
- ID proofs (encrypted)

**4.2 Onboarding Checklist**

Structured onboarding for new team members:
- Automated task creation
- Document collection checklist
- Platform orientation tasks
- Mentor assignment
- Progress tracking

---

### Part 5: Database Schema Updates

**5.1 New Tables**

```sql
-- Leave/Availability Management
CREATE TABLE public.team_leaves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  leave_type text NOT NULL DEFAULT 'vacation',
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  status text DEFAULT 'pending',
  approved_by uuid REFERENCES team_members(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Performance Reviews
CREATE TABLE public.performance_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES team_members(id),
  review_period text NOT NULL,
  self_rating integer,
  manager_rating integer,
  strengths text,
  improvements text,
  goals text,
  overall_feedback text,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- HR Documents
CREATE TABLE public.team_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  uploaded_by uuid,
  is_verified boolean DEFAULT false,
  expires_at date,
  created_at timestamptz DEFAULT now()
);

-- Onboarding Checklists
CREATE TABLE public.onboarding_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  checklist_items jsonb DEFAULT '[]',
  mentor_id uuid REFERENCES team_members(id),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  status text DEFAULT 'in_progress'
);
```

**5.2 Team Members Table Extensions**

```sql
ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS emergency_contact text,
ADD COLUMN IF NOT EXISTS stipend_amount decimal(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_remote boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Asia/Kolkata';
```

---

### Part 6: UI Components to Create

| Component | Purpose |
|-----------|---------|
| `TimeLogManager.tsx` | Log and view time entries |
| `TaskComments.tsx` | Task discussion thread |
| `TaskKanban.tsx` | Kanban board view |
| `TeamOrgChart.tsx` | Visual hierarchy |
| `TeamMemberProfile.tsx` | Enhanced profile card |
| `LeaveManager.tsx` | Leave requests & approvals |
| `PerformanceReview.tsx` | Review forms & history |
| `OnboardingTracker.tsx` | New member onboarding |
| `TeamCalendar.tsx` | Availability calendar |
| `TimesheetReport.tsx` | Weekly/monthly reports |

---

### Part 7: Enhanced Team Panel

Update `TeamPanel.tsx` with new tabs:

| Tab | Content |
|-----|---------|
| Dashboard | Personal stats, upcoming tasks, notifications |
| My Tasks | Kanban/list of assigned tasks |
| Time Log | Personal timesheet entry |
| Leave | Apply for leave, view balance |
| My Performance | Personal KPIs, reviews |
| Documents | Personal HR documents |
| Team | Org chart, colleague profiles |

---

### Part 8: Implementation Priority

**Phase 1 (Core):**
1. Time logging UI using existing table
2. Task comments system
3. Kanban board view
4. Enhanced task details modal

**Phase 2 (Team Management):**
5. Organization chart visualization
6. Team member profile enhancements
7. Leave management system
8. Team calendar

**Phase 3 (Performance):**
9. Performance reviews
10. Individual KPI dashboards
11. Reporting enhancements

**Phase 4 (Polish):**
12. Document management
13. Onboarding workflows
14. Advanced analytics

---

### Part 9: Technical Approach

**File Changes:**

| File | Action |
|------|--------|
| `src/components/crm/TimeLogManager.tsx` | Create |
| `src/components/crm/TaskComments.tsx` | Create |
| `src/components/crm/TaskKanban.tsx` | Create |
| `src/components/crm/TeamOrgChart.tsx` | Create |
| `src/components/crm/LeaveManager.tsx` | Create |
| `src/components/crm/TeamCalendar.tsx` | Create |
| `src/components/crm/TaskManager.tsx` | Enhance with Kanban toggle |
| `src/components/crm/CRMDashboard.tsx` | Add new tabs |
| `src/pages/TeamPanel.tsx` | Add personal time/leave/reviews |
| `src/hooks/useTimeLog.ts` | Create |
| `src/hooks/useLeaves.ts` | Create |

**Database Migrations:**
- New tables: `team_leaves`, `performance_reviews`, `team_documents`, `onboarding_checklists`
- Extend `team_members` with new columns
- RLS policies for all new tables

---

## Summary

This plan transforms the basic HRM into a comprehensive team management system with:
- Full time tracking with timesheets
- Task collaboration with comments
- Kanban workflow visualization
- Leave and availability management
- Performance review cycles
- Organization hierarchy visualization
- Personal dashboards for each team member

The implementation uses existing database infrastructure (`time_logs`, `task_comments`) and extends it with new capabilities while maintaining the current permission system.

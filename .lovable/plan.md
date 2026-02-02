
# Comprehensive CRM & HRM Portal with KPIs and Professional Management

## Executive Summary

This plan creates a professional-grade CRM (Customer Relationship Management) and HRM (Human Resource Management) system with KPIs, advanced task management, team performance tracking, and enterprise-level analytics for managing your platform.

---

## Three-Tier Access Hierarchy

| Role | Access Level | Dashboard |
|------|-------------|-----------|
| **Admin (You)** | Full CRM/HRM + All Controls | Admin Dashboard with CRM Tab |
| **Core Team** | Module-specific + Task Management | Team Panel (`/team-panel`) |
| **Students** | View assigned tasks + progress | Dashboard with My Tasks |

---

## Part 1: Database Schema

### 1.1 Update app_role Enum

Add `core_team` to existing roles:

```sql
ALTER TYPE public.app_role ADD VALUE 'core_team';
```

### 1.2 New Table: `crm_tasks` (Universal Task System)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Task title |
| description | text | Detailed description |
| assigned_to | uuid | Target user |
| assigned_by | uuid | Assigner (admin/team) |
| priority | text | low/medium/high/urgent |
| status | text | pending/in_progress/review/completed/cancelled |
| due_date | timestamptz | Deadline |
| started_at | timestamptz | When started |
| completed_at | timestamptz | Completion timestamp |
| estimated_hours | numeric | Time estimate |
| actual_hours | numeric | Time spent |
| category | text | Task category |
| tags | text[] | Labels |
| points_reward | integer | Coins on completion |
| attachments | text[] | File URLs |
| parent_task_id | uuid | For subtasks |
| recurring | boolean | Repeating task |
| recurrence_pattern | jsonb | Daily/weekly/monthly config |

### 1.3 New Table: `team_members` (Core Team Registry)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to auth user |
| full_name | text | Display name |
| email | text | Contact email |
| phone | text | Phone number |
| role_title | text | Job title (e.g., "Content Lead") |
| department | text | marketing/technical/operations/design |
| avatar_url | text | Profile image |
| join_date | date | When joined team |
| status | text | active/on_leave/inactive |
| reporting_to | uuid | Manager reference |
| notes | text | Admin notes |

### 1.4 New Table: `team_permissions` (Granular Access Control)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| team_member_id | uuid | FK to team_members |
| can_manage_events | boolean | Events access |
| can_manage_jobs | boolean | Jobs access |
| can_manage_hackathons | boolean | Hackathons access |
| can_manage_bounties | boolean | Bounties access |
| can_manage_scholarships | boolean | Scholarships access |
| can_manage_reels | boolean | Reels moderation |
| can_manage_store | boolean | Store access |
| can_manage_study_materials | boolean | Materials access |
| can_view_users | boolean | User list access |
| can_assign_tasks | boolean | Task assignment |
| can_view_analytics | boolean | Analytics access |
| can_send_announcements | boolean | Broadcast messages |

### 1.5 New Table: `kpi_definitions` (KPI Configuration)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | KPI name |
| description | text | What it measures |
| calculation_type | text | count/sum/average/percentage/custom |
| target_value | numeric | Goal value |
| target_period | text | daily/weekly/monthly/quarterly |
| entity_type | text | user/team/platform |
| metric_source | text | Table/function source |
| is_active | boolean | Currently tracked |
| display_order | integer | Sort order |
| icon | text | Lucide icon name |
| color | text | Badge color |

### 1.6 New Table: `kpi_records` (KPI Tracking Data)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| kpi_id | uuid | FK to kpi_definitions |
| entity_id | uuid | User/team ID |
| entity_type | text | user/team/platform |
| period_start | date | Period begin |
| period_end | date | Period end |
| current_value | numeric | Achieved value |
| target_value | numeric | Goal for period |
| percentage | numeric | Achievement % |
| trend | text | up/down/stable |

### 1.7 New Table: `activity_log` (Comprehensive Audit Trail)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Who performed action |
| action_type | text | Action category |
| action_description | text | Human-readable description |
| entity_type | text | Affected entity type |
| entity_id | uuid | Affected entity ID |
| metadata | jsonb | Additional context |
| ip_address | text | Request origin |
| created_at | timestamptz | Timestamp |

### 1.8 New Table: `announcements` (Team/Platform Announcements)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Announcement title |
| content | text | Message body |
| priority | text | low/normal/high/urgent |
| target_audience | text | all/team/students/specific |
| target_users | uuid[] | Specific recipients |
| published_by | uuid | Author |
| published_at | timestamptz | When published |
| expires_at | timestamptz | Auto-hide date |
| is_pinned | boolean | Sticky announcement |

### 1.9 New Table: `task_comments` (Task Discussion Thread)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| task_id | uuid | FK to crm_tasks |
| user_id | uuid | Commenter |
| comment | text | Message content |
| attachments | text[] | File URLs |
| is_internal | boolean | Team-only visibility |
| created_at | timestamptz | Timestamp |

### 1.10 New Table: `time_logs` (Time Tracking)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| task_id | uuid | FK to crm_tasks |
| user_id | uuid | Who logged |
| hours | numeric | Duration |
| description | text | Work description |
| logged_at | date | Work date |
| created_at | timestamptz | Entry timestamp |

---

## Part 2: Database Functions

### 2.1 `is_core_team()` Function

```sql
CREATE OR REPLACE FUNCTION public.is_core_team()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'core_team'
  )
$$;
```

### 2.2 `get_team_member_permissions()` Function

Returns current user's permissions for conditional UI rendering.

### 2.3 `calculate_kpi_value()` Function

Calculates KPI values based on definition configuration.

### 2.4 `log_activity()` Function

Logs user actions to activity_log table automatically.

---

## Part 3: RLS Policies

All new tables will have Row Level Security enabled with appropriate policies:

- **crm_tasks**: Admins full access; assigned users can view/update their tasks
- **team_members**: Admins can manage; team members can view own profile
- **team_permissions**: Admin-only management
- **kpi_definitions**: Admin-only management; team can view
- **kpi_records**: Based on entity ownership
- **activity_log**: Admin-only viewing
- **announcements**: Admin can manage; target audience can view
- **task_comments**: Task participants can read/write
- **time_logs**: Own logs editable; admins can view all

---

## Part 4: New UI Components

### 4.1 Admin CRM Components

| Component | Purpose |
|-----------|---------|
| `CRMDashboard.tsx` | Main CRM overview with KPIs and quick stats |
| `PeopleManager.tsx` | Enhanced user directory with filters, bulk actions |
| `TeamMemberManager.tsx` | Add/manage core team members with permissions |
| `TaskManager.tsx` | Create/assign/track tasks with Kanban and list views |
| `KPIDashboard.tsx` | Visual KPI tracking with charts and trends |
| `ActivityLogViewer.tsx` | Real-time activity feed with filters |
| `AnnouncementManager.tsx` | Create and manage announcements |
| `PerformanceReports.tsx` | Team/user performance analytics |
| `TimeTrackingReport.tsx` | Time log summaries and analysis |

### 4.2 Team Panel Components

| Component | Purpose |
|-----------|---------|
| `TeamDashboard.tsx` | Core team member's main view |
| `MyTasksView.tsx` | Personal task list with status updates |
| `TeamActivityFeed.tsx` | Team-wide activity stream |
| `QuickAccessModules.tsx` | Permitted module shortcuts |
| `MyPerformance.tsx` | Individual KPI and performance stats |

### 4.3 Student Dashboard Enhancements

| Component | Purpose |
|-----------|---------|
| `AssignedTasks.tsx` | Tasks assigned to the student |
| `TaskProgressTracker.tsx` | Visual progress on tasks |
| `NotificationCenter.tsx` | Announcements and task updates |

---

## Part 5: New Pages

### 5.1 Team Panel (`/team-panel`)

Dedicated dashboard for core team members with:
- Personal task list with quick status updates
- KPI widgets showing individual performance
- Quick access to permitted management modules
- Team announcements feed
- Activity timeline

### 5.2 Enhanced Admin Dashboard

New "CRM" tab with sub-sections:
- **Overview**: KPI cards, task summary, activity feed
- **People**: Enhanced user management
- **Team**: Core team management with permissions
- **Tasks**: Universal task manager
- **KPIs**: Performance metrics and goals
- **Activity**: Platform-wide audit log
- **Reports**: Analytics and exports

---

## Part 6: Features Deep Dive

### 6.1 Task Management System

```text
Task Lifecycle:
┌──────────┐    ┌────────────┐    ┌─────────┐    ┌───────────┐
│  Created │ -> │ In Progress│ -> │ Review  │ -> │ Completed │
└──────────┘    └────────────┘    └─────────┘    └───────────┘
      │                                               │
      └─────────────> Cancelled <─────────────────────┘
```

**Features:**
- Assign to any user (student, team member)
- Priority levels with color coding
- Due date with overdue highlighting
- Subtasks for complex projects
- Comments/discussion thread
- Time tracking per task
- File attachments
- Points reward on completion
- Recurring task templates
- Bulk assignment to multiple users
- Kanban board view
- List view with filters
- Calendar view for deadlines

### 6.2 KPI System

**Pre-configured KPIs:**

| KPI | Type | Target Example |
|-----|------|----------------|
| New User Registrations | Count | 100/week |
| Active Users | Count | 500/day |
| Events Published | Count | 10/week |
| Tasks Completed | Count | 50/week |
| User Engagement Rate | Percentage | 60% |
| Average Session Duration | Time | 15 min |
| Content Submission Rate | Count | 20/week |
| Task Completion Rate | Percentage | 80% |
| Response Time (Tasks) | Time | < 24 hours |

**Team Member KPIs:**
- Tasks assigned vs completed
- Average task completion time
- Module activity (events approved, jobs posted, etc.)
- User engagement generated

**Visual Representation:**
- Progress rings/gauges
- Trend charts (sparklines)
- Comparison bars (actual vs target)
- Period-over-period change indicators

### 6.3 Activity Logging

**Tracked Actions:**
- User logins/registrations
- Content creation/updates/deletions
- Task assignments/completions
- Role changes
- Settings modifications
- Export operations
- Announcement publications

**Log Entry Format:**
```json
{
  "action_type": "task_assigned",
  "description": "Admin assigned 'Update Event Posters' to John Doe",
  "entity_type": "crm_task",
  "entity_id": "uuid...",
  "metadata": {
    "task_title": "Update Event Posters",
    "assignee_name": "John Doe",
    "due_date": "2026-02-10"
  }
}
```

### 6.4 Team Permission Matrix

| Permission | Content Lead | Marketing | Technical | Operations |
|------------|-------------|-----------|-----------|------------|
| Manage Events | Yes | Yes | No | Yes |
| Manage Jobs | No | Yes | Yes | No |
| Manage Store | No | Yes | No | Yes |
| View Users | Yes | Yes | Yes | Yes |
| Assign Tasks | Yes | No | No | Yes |
| View Analytics | Yes | Yes | Yes | Yes |

### 6.5 Announcement System

- **Priority levels**: Low, Normal, High, Urgent
- **Target audiences**: All, Team Only, Students Only, Specific Users
- **Features**:
  - Rich text content
  - Expiration dates
  - Pinned announcements
  - Read receipts (optional)
  - Push notification integration (future)

---

## Part 7: Files to Create

| File | Description |
|------|-------------|
| `src/pages/TeamPanel.tsx` | Core team dashboard |
| `src/components/crm/CRMDashboard.tsx` | Main CRM overview |
| `src/components/crm/PeopleManager.tsx` | Enhanced user management |
| `src/components/crm/TeamMemberManager.tsx` | Team member CRUD |
| `src/components/crm/TaskManager.tsx` | Task creation/management |
| `src/components/crm/TaskKanban.tsx` | Kanban board view |
| `src/components/crm/TaskListView.tsx` | List view with filters |
| `src/components/crm/TaskDetailModal.tsx` | Full task view/edit |
| `src/components/crm/KPIDashboard.tsx` | KPI visualization |
| `src/components/crm/KPICard.tsx` | Individual KPI widget |
| `src/components/crm/ActivityLogViewer.tsx` | Activity feed |
| `src/components/crm/AnnouncementManager.tsx` | Announcement CRUD |
| `src/components/crm/PerformanceReports.tsx` | Analytics reports |
| `src/components/crm/TimeTrackingReport.tsx` | Time log analysis |
| `src/components/dashboard/AssignedTasks.tsx` | Student task view |
| `src/components/dashboard/NotificationCenter.tsx` | Announcement display |
| `src/hooks/useTeamPermissions.ts` | Permission checking hook |
| `src/hooks/useTasks.ts` | Task management hook |
| `src/hooks/useKPIs.ts` | KPI data fetching hook |

## Part 8: Files to Modify

| File | Changes |
|------|---------|
| `src/pages/AdminDashboard.tsx` | Add CRM tab with new components |
| `src/pages/Dashboard.tsx` | Add Assigned Tasks and Notifications sections |
| `src/components/Navbar.tsx` | Add Team Panel link for core_team role |
| `src/App.tsx` | Add `/team-panel` route |

---

## Part 9: Implementation Order

1. **Database migrations** - Create all new tables and functions
2. **CRM Core Components** - TaskManager, TeamMemberManager
3. **KPI System** - Definitions, records, dashboard
4. **Activity Logging** - Table, trigger, viewer
5. **Team Panel** - New page with permissions
6. **Dashboard Enhancements** - Student task view
7. **Admin Integration** - CRM tab in AdminDashboard
8. **Announcements** - Manager and display components
9. **Reports** - Performance and time tracking
10. **Polish** - Animations, loading states, mobile responsive

---

## Part 10: Security Considerations

1. **Role-based access**: All endpoints verify `is_admin()` or `is_core_team()`
2. **Permission granularity**: Team members only access permitted modules
3. **RLS policies**: All tables have proper row-level security
4. **Activity logging**: All significant actions are tracked
5. **Data isolation**: Students can only see their own data
6. **Input validation**: All forms validated server-side

---

## Expected Outcome

After implementation:
- Full CRM to view and manage all registered students with advanced filters
- Team management system with granular permissions
- Professional task assignment and tracking with Kanban view
- KPI dashboard with visual progress tracking and trends
- Real-time activity logging for audit and monitoring
- Announcement system for platform communications
- Performance reports and analytics
- Time tracking capabilities
- Core team has their own dedicated panel
- Students see assigned tasks in their dashboard
- Mobile-responsive design throughout

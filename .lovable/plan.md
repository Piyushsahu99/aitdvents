
# Admin Panel Enhancement: CRM, HRM & Team Management Fixes

## Overview
This plan addresses three core issues you're facing:
1. **Missing CRM Tab** - The CRM tab trigger exists but has no content
2. **Admin/Team Member Management Issues** - The email lookup system isn't working because user emails aren't being stored in profiles
3. **Need for Enhanced HRM Features** - Adding comprehensive team and admin management

---

## Issues Identified

### Problem 1: CRM Tab Missing
The Admin Dashboard has a "CRM" tab trigger (line 583) but no corresponding `TabsContent` for it. The CRMDashboard component is imported but never rendered.

### Problem 2: Email Not Stored in Profiles
When users sign up, their email isn't being stored in the `student_profiles.email` column. This breaks the `add_admin_by_email` and `add_team_member_by_email` RPC functions which rely on email lookup.

### Problem 3: Team Member Count is Zero
There are currently no team members in the database, and the system to add them requires the email fix first.

---

## Implementation Plan

### Phase 1: Fix Email Storage Issue

**Database Migration Required:**
Create a trigger to automatically copy user email from `auth.users` to `student_profiles` when a profile is created or when missing.

```text
1. Create trigger function to sync email on profile creation
2. Update existing profiles to populate email from auth.users
3. Ensure the RPC functions work correctly
```

**Files to Modify:**
- Database migration (new)

### Phase 2: Add CRM Tab Content to Admin Dashboard

**File: `src/pages/AdminDashboard.tsx`**

Add the missing CRM TabsContent that renders the CRMDashboard component:
```text
{/* CRM Tab */}
<TabsContent value="crm">
  <CRMDashboard />
</TabsContent>
```

This connects the already-imported CRMDashboard which includes:
- Task Management (Kanban view)
- Team Member Management with permissions
- Time Logging
- Leave Management
- Team Calendar
- Org Chart
- KPIs Dashboard
- Activity Logs
- Announcements

### Phase 3: Enhance Admin Management (AdminInviteManager)

**Improvements:**
1. Add "Add by Email" input with instant promotion for existing users
2. Show clearer error messages when email lookup fails
3. Add bulk operations for team invites
4. Display profile completion status for pending admins

**Files to Modify:**
- `src/components/admin/AdminInviteManager.tsx` - Add email sync check

### Phase 4: Improve Team Member Manager

**File: `src/components/crm/TeamMemberManager.tsx`**

**Enhancements:**
1. Add "Add by Email" direct input (not just dropdown selection)
2. Show existing user search with email matching
3. Add "Invite Link" for users who haven't signed up yet
4. Pre-populate permissions based on role templates

**New Features:**
- Quick permission templates (Content Manager, Event Manager, Full Access)
- Bulk permission updates
- Email-based team member lookup

---

## Database Changes Required

### Migration 1: Email Sync Trigger
```sql
-- Create function to sync email from auth.users to student_profiles
CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Get email from auth.users and update the profile
  UPDATE public.student_profiles
  SET email = (SELECT email FROM auth.users WHERE id = NEW.user_id)
  WHERE user_id = NEW.user_id AND email IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new profiles
CREATE TRIGGER sync_email_on_profile_insert
  AFTER INSERT ON public.student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_email();

-- Backfill existing profiles with emails
UPDATE public.student_profiles sp
SET email = au.email
FROM auth.users au
WHERE sp.user_id = au.id AND sp.email IS NULL;
```

### Migration 2: Improve add_admin_by_email RPC
```sql
-- Improved function that works with auth.users email
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
  -- Look up user by email in auth.users directly
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = lower(trim(admin_email));

  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found with this email');
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
```

### Migration 3: Improve add_team_member_by_email RPC
```sql
-- Similar improvement for team member function
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
BEGIN
  -- Look up user by email in auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = lower(trim(member_email));

  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found with this email');
  END IF;

  -- Check if already a team member
  SELECT id INTO existing_member
  FROM public.team_members
  WHERE user_id = target_user_id;

  IF existing_member IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User is already a team member');
  END IF;

  -- Create team member record
  INSERT INTO public.team_members (user_id, full_name, email, role_title, department, phone)
  VALUES (
    target_user_id,
    COALESCE(member_name, (SELECT full_name FROM student_profiles WHERE user_id = target_user_id)),
    member_email,
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

  RETURN jsonb_build_object('success', true, 'member_id', new_member_id);
END;
$$;
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/AdminDashboard.tsx` | Add missing CRM TabsContent |
| `src/components/admin/AdminInviteManager.tsx` | Minor improvements to error handling |
| `src/components/crm/TeamMemberManager.tsx` | Add email-based lookup, permission templates |

## Files Already Existing (No Changes Needed)
The following components already exist and will work once the CRM tab is connected:
- `src/components/crm/CRMDashboard.tsx` - Main CRM container
- `src/components/crm/TaskManager.tsx` - Task management
- `src/components/crm/TaskKanban.tsx` - Kanban board view
- `src/components/crm/TeamMemberManager.tsx` - Team management
- `src/components/crm/TimeLogManager.tsx` - Time tracking
- `src/components/crm/LeaveManager.tsx` - Leave requests
- `src/components/crm/TeamCalendar.tsx` - Calendar view
- `src/components/crm/TeamOrgChart.tsx` - Org structure
- `src/components/crm/KPIDashboard.tsx` - KPIs
- `src/components/crm/ActivityLogViewer.tsx` - Activity logs
- `src/components/crm/AnnouncementManager.tsx` - Announcements

---

## Implementation Order

1. **Database Migration** - Fix email sync (critical first step)
2. **Add CRM Tab** - Connect existing CRMDashboard to Admin Panel
3. **Test Admin Addition** - Verify you can add admins by email
4. **Test Team Member Addition** - Verify team member workflow
5. **Enhance UX** - Add permission templates and better error messages

---

## Expected Outcome

After implementation:
- You'll have a full CRM/HRM dashboard accessible via the Admin Panel "CRM" tab
- Adding admins by email will work instantly for registered users
- Adding team members by email will work with granular permission controls
- Team members can access their Team Panel (`/team-panel`) with limited permissions
- All existing CRM features (tasks, time logs, leave, calendar) will be functional

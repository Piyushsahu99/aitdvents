
# Password Reset Fix and Admin/Team Management Improvements

## Overview

This plan addresses two main issues:
1. **Forgot Password Not Working** - Fix the password reset flow to properly handle recovery tokens
2. **Improved Admin and Team Member Management** - Enhance the UI and functionality for managing admins and team members

---

## Issue 1: Password Reset Flow Fix

### Problem Analysis
The current password reset flow has a critical issue. When users click the reset link from their email, they're redirected to a URL like:
```
/auth#access_token=...&type=recovery
```

However, the code only checks for `?reset=true` query parameter and doesn't handle the actual recovery session from the URL hash fragment. This causes the reset form to not appear when users click the email link.

### Solution
Update the Auth page to:
1. Detect the `type=recovery` in the URL hash fragment
2. Listen for `PASSWORD_RECOVERY` events from the auth state change listener
3. Automatically show the password reset form when a recovery session is detected

### Implementation

**File: `src/pages/Auth.tsx`**

Add logic to handle recovery flow:
- Parse URL hash on mount to detect `type=recovery`
- In `onAuthStateChange`, handle the `PASSWORD_RECOVERY` event
- Automatically show the reset password form when recovery is detected
- Clear the hash from URL after detecting recovery to prevent issues on refresh

---

## Issue 2: Admin Management Improvements

### Current State
- Basic invite system with email + code generation
- Simple table view of invites
- No ability to revoke invites or remove admins

### Enhancements

**File: `src/components/admin/AdminInviteManager.tsx`**

Transform into a comprehensive **Admin & Team Manager** with:

1. **Two-Tab Layout**:
   - **Admin Invites Tab**: Current invite functionality
   - **Current Admins Tab**: View and manage existing admins

2. **Enhanced Invite Features**:
   - Ability to revoke pending invites
   - Resend invite email option
   - Visual countdown showing time until expiration
   - Bulk invite capability

3. **Current Admins Section**:
   - List all users with admin role
   - Show when they became admin
   - Option to remove admin privileges (with confirmation)
   - Display invite history (who invited them)

4. **UI Improvements**:
   - Better visual hierarchy with cards
   - Status indicators with animations
   - Search/filter for large lists
   - Mobile-responsive design

---

## Issue 3: Ambassador Team Management Improvements

### Current State
- Basic add member form
- Simple table display
- No edit or remove functionality for ambassadors

### Enhancements

**File: `src/components/ambassador/TeamManager.tsx`**

1. **Edit Team Members**:
   - Click to edit member details
   - Change role (volunteer to core team and vice versa)
   - Update contact information

2. **Remove Team Members**:
   - Delete button with confirmation dialog
   - Cascade updates to related data

3. **Enhanced UI**:
   - Avatar placeholders with initials
   - Status badges with colors
   - Animated transitions when adding/removing
   - Empty state illustrations

4. **Additional Features**:
   - Email team members directly (mailto links)
   - Phone call shortcut on mobile
   - Export team list as CSV

---

## Technical Implementation Details

### Password Reset Fix (Auth.tsx)

```typescript
// Add inside useEffect - detect recovery from URL hash
useEffect(() => {
  // Check for recovery in hash fragment
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  if (hashParams.get('type') === 'recovery') {
    setShowResetPassword(true);
    // Clean up URL
    window.history.replaceState({}, '', '/auth');
  }
}, []);

// In onAuthStateChange listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    setShowResetPassword(true);
  }
});
```

### Admin Manager Database Query

Add a new function to fetch current admins:
```typescript
const fetchCurrentAdmins = async () => {
  const { data } = await supabase
    .from("user_roles")
    .select(`
      id,
      user_id,
      role,
      created_at,
      profiles:student_profiles!user_id(full_name, email)
    `)
    .eq("role", "admin");
};
```

### Team Manager Edit/Delete

Add edit and delete functionality:
```typescript
const handleDeleteMember = async (memberId: string) => {
  const { error } = await supabase
    .from("ambassador_team_members")
    .delete()
    .eq("id", memberId);
  
  if (!error) {
    toast.success("Team member removed");
    fetchMembers();
  }
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Auth.tsx` | Add recovery token detection and PASSWORD_RECOVERY event handling |
| `src/components/admin/AdminInviteManager.tsx` | Enhance with current admins tab, revoke functionality, and UI improvements |
| `src/components/ambassador/TeamManager.tsx` | Add edit/delete functionality, improved UI |

---

## Security Considerations

1. **Admin Removal**: Only super admins (first admin) can remove other admins
2. **Self-Protection**: Users cannot remove their own admin role
3. **Audit Trail**: Log admin role changes for security tracking
4. **RLS Policies**: Existing policies already protect against unauthorized access

---

## Expected Outcome

After implementation:
- Users will be able to successfully reset their passwords via email link
- Admins can invite, view, and manage other administrators
- Ambassadors can fully manage their team members with edit/delete capabilities
- All interfaces will have improved visual design and user experience

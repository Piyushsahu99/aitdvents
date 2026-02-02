import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, UserPlus, Shield, User } from "lucide-react";

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role_title: string | null;
  department: string | null;
  status: string;
  join_date: string;
}

interface TeamPermissions {
  can_manage_events: boolean;
  can_manage_jobs: boolean;
  can_manage_hackathons: boolean;
  can_manage_bounties: boolean;
  can_manage_scholarships: boolean;
  can_manage_reels: boolean;
  can_manage_store: boolean;
  can_manage_study_materials: boolean;
  can_view_users: boolean;
  can_assign_tasks: boolean;
  can_view_analytics: boolean;
  can_send_announcements: boolean;
}

const DEPARTMENTS = ["marketing", "technical", "operations", "design", "content", "hr", "finance"];
const PERMISSION_LABELS: Record<keyof TeamPermissions, string> = {
  can_manage_events: "Manage Events",
  can_manage_jobs: "Manage Jobs",
  can_manage_hackathons: "Manage Hackathons",
  can_manage_bounties: "Manage Bounties",
  can_manage_scholarships: "Manage Scholarships",
  can_manage_reels: "Moderate Reels",
  can_manage_store: "Manage Store",
  can_manage_study_materials: "Manage Materials",
  can_view_users: "View Users",
  can_assign_tasks: "Assign Tasks",
  can_view_analytics: "View Analytics",
  can_send_announcements: "Send Announcements",
};

export function TeamMemberManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<{ member: TeamMember; permissions: TeamPermissions } | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    user_id: "",
    full_name: "",
    email: "",
    phone: "",
    role_title: "",
    department: "",
  });

  const defaultPermissions: TeamPermissions = {
    can_manage_events: false,
    can_manage_jobs: false,
    can_manage_hackathons: false,
    can_manage_bounties: false,
    can_manage_scholarships: false,
    can_manage_reels: false,
    can_manage_store: false,
    can_manage_study_materials: false,
    can_view_users: false,
    can_assign_tasks: false,
    can_view_analytics: false,
    can_send_announcements: false,
  };

  const [permissions, setPermissions] = useState<TeamPermissions>(defaultPermissions);

  useEffect(() => {
    fetchMembers();
    fetchUsers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("student_profiles").select("user_id, full_name, email");
    setUsers(data || []);
  };

  const resetForm = () => {
    setFormData({
      user_id: "",
      full_name: "",
      email: "",
      phone: "",
      role_title: "",
      department: "",
    });
    setPermissions(defaultPermissions);
  };

  const handleUserSelect = (userId: string) => {
    const user = users.find(u => u.user_id === userId);
    if (user) {
      setFormData({
        ...formData,
        user_id: userId,
        full_name: user.full_name || "",
        email: user.email || "",
      });
    }
  };

  const handleAdd = async () => {
    try {
      // Add team member
      const { data: member, error: memberError } = await supabase
        .from("team_members")
        .insert([{
          user_id: formData.user_id,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || null,
          role_title: formData.role_title || null,
          department: formData.department || null,
        }])
        .select()
        .single();

      if (memberError) throw memberError;

      // Add core_team role
      await supabase.from("user_roles").insert([{
        user_id: formData.user_id,
        role: "core_team",
      }]);

      // Add permissions
      await supabase.from("team_permissions").insert([{
        team_member_id: member.id,
        ...permissions,
      }]);

      toast({ title: "Success", description: "Team member added successfully" });
      resetForm();
      setIsAddOpen(false);
      fetchMembers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (member: TeamMember) => {
    try {
      // Remove core_team role
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", member.user_id)
        .eq("role", "core_team");

      // Delete team member (permissions cascade)
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", member.id);

      if (error) throw error;

      toast({ title: "Success", description: "Team member removed" });
      fetchMembers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const openPermissionsEdit = async (member: TeamMember) => {
    const { data } = await supabase
      .from("team_permissions")
      .select("*")
      .eq("team_member_id", member.id)
      .maybeSingle();

    setEditingPermissions({
      member,
      permissions: data ? {
        can_manage_events: data.can_manage_events || false,
        can_manage_jobs: data.can_manage_jobs || false,
        can_manage_hackathons: data.can_manage_hackathons || false,
        can_manage_bounties: data.can_manage_bounties || false,
        can_manage_scholarships: data.can_manage_scholarships || false,
        can_manage_reels: data.can_manage_reels || false,
        can_manage_store: data.can_manage_store || false,
        can_manage_study_materials: data.can_manage_study_materials || false,
        can_view_users: data.can_view_users || false,
        can_assign_tasks: data.can_assign_tasks || false,
        can_view_analytics: data.can_view_analytics || false,
        can_send_announcements: data.can_send_announcements || false,
      } : defaultPermissions,
    });
  };

  const savePermissions = async () => {
    if (!editingPermissions) return;

    try {
      const { error } = await supabase
        .from("team_permissions")
        .upsert({
          team_member_id: editingPermissions.member.id,
          ...editingPermissions.permissions,
        }, {
          onConflict: "team_member_id",
        });

      if (error) throw error;

      toast({ title: "Success", description: "Permissions updated" });
      setEditingPermissions(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "on_leave": return "bg-warning text-warning-foreground";
      case "inactive": return "bg-muted text-muted-foreground";
      default: return "";
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading team members...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl">Team Members</CardTitle>
            <CardDescription>Manage your core team and permissions</CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={resetForm}>
                <UserPlus className="h-4 w-4" /> Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>Add a user to the core team with specific permissions</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Select User *</Label>
                  <Select value={formData.user_id} onValueChange={handleUserSelect}>
                    <SelectTrigger><SelectValue placeholder="Choose a user" /></SelectTrigger>
                    <SelectContent>
                      {users.filter(u => !members.find(m => m.user_id === u.user_id)).map(user => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Full Name</Label>
                    <Input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Role Title</Label>
                    <Input value={formData.role_title} onChange={e => setFormData({ ...formData, role_title: e.target.value })} placeholder="e.g., Content Lead" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Department</Label>
                    <Select value={formData.department} onValueChange={v => setFormData({ ...formData, department: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(d => (
                          <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>

                <div className="border-t pt-4">
                  <Label className="text-base font-semibold mb-3 block">Permissions</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Checkbox 
                          id={key}
                          checked={permissions[key as keyof TeamPermissions]}
                          onCheckedChange={checked => setPermissions({ ...permissions, [key]: checked })}
                        />
                        <Label htmlFor={key} className="text-sm cursor-pointer">{label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} disabled={!formData.user_id || !formData.full_name}>Add Member</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead className="hidden sm:table-cell">Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No team members yet. Add your first team member!
                  </TableCell>
                </TableRow>
              ) : (
                members.map(member => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-sm">{member.full_name}</span>
                        <span className="text-xs text-muted-foreground">{member.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm">{member.role_title || "—"}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="capitalize text-xs">
                        {member.department || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`capitalize text-xs ${getStatusColor(member.status)}`}>
                        {member.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openPermissionsEdit(member)} title="Edit Permissions">
                          <Shield className="h-3.5 w-3.5 text-primary" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(member)} title="Remove Member">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Permissions Edit Dialog */}
      <Dialog open={!!editingPermissions} onOpenChange={open => !open && setEditingPermissions(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>
              {editingPermissions?.member.full_name}'s access permissions
            </DialogDescription>
          </DialogHeader>
          {editingPermissions && (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox 
                    id={`edit-${key}`}
                    checked={editingPermissions.permissions[key as keyof TeamPermissions]}
                    onCheckedChange={checked => setEditingPermissions({
                      ...editingPermissions,
                      permissions: { ...editingPermissions.permissions, [key]: checked }
                    })}
                  />
                  <Label htmlFor={`edit-${key}`} className="text-sm cursor-pointer">{label}</Label>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditingPermissions(null)}>Cancel</Button>
            <Button onClick={savePermissions}>Save Permissions</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

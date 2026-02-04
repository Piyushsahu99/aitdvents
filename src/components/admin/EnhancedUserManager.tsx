import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, Search, UserPlus, Edit, Trash2, Shield, Crown,
  School, Calendar, Phone, ExternalLink, Loader2, FileSpreadsheet, Mail
} from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string | null;
  college: string | null;
  graduation_year: number | null;
  skills: string[] | null;
  linkedin_url: string | null;
  github_url: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  is_public: boolean | null;
  email?: string;
}

interface UserRole {
  role: string;
}

const AVAILABLE_ROLES = ["admin", "core_team", "moderator", "user"] as const;

export function EnhancedUserManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [exporting, setExporting] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editingRoles, setEditingRoles] = useState<{ user: UserProfile; roles: string[] } | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    college: "",
    graduation_year: "",
    bio: "",
    skills: "",
    linkedin_url: "",
    github_url: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from("student_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch roles for all users
      const userIds = (profiles || []).map(p => p.user_id).filter(Boolean);
      if (userIds.length > 0) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .in("user_id", userIds);

        const rolesMap: Record<string, string[]> = {};
        roles?.forEach(r => {
          if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
          rolesMap[r.user_id].push(r.role);
        });
        setUserRoles(rolesMap);
      }

      setUsers(profiles || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(query) ||
      user.college?.toLowerCase().includes(query) ||
      user.phone?.includes(query)
    );
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      college: "",
      graduation_year: "",
      bio: "",
      skills: "",
      linkedin_url: "",
      github_url: "",
    });
    setEditingUser(null);
  };

  const openEditDialog = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
      college: user.college || "",
      graduation_year: user.graduation_year?.toString() || "",
      bio: user.bio || "",
      skills: user.skills?.join(", ") || "",
      linkedin_url: user.linkedin_url || "",
      github_url: user.github_url || "",
    });
    setIsAddOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      const profileData = {
        full_name: formData.full_name,
        phone: formData.phone || null,
        college: formData.college || null,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        bio: formData.bio || null,
        skills: formData.skills ? formData.skills.split(",").map(s => s.trim()).filter(Boolean) : null,
        linkedin_url: formData.linkedin_url || null,
        github_url: formData.github_url || null,
      };

      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from("student_profiles")
          .update(profileData)
          .eq("id", editingUser.id);

        if (error) throw error;
        toast({ title: "Success", description: "User updated successfully" });
      } else {
        // Note: For manual creation, admin would need to invite via auth
        toast({ 
          title: "Info", 
          description: "To add new users, use the Admin Invite system. This form edits existing users.",
          variant: "default"
        });
        setIsAddOpen(false);
        return;
      }

      resetForm();
      setIsAddOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const openRolesDialog = (user: UserProfile) => {
    setEditingRoles({
      user,
      roles: userRoles[user.user_id] || [],
    });
  };

  const toggleRole = (role: string) => {
    if (!editingRoles) return;
    const hasRole = editingRoles.roles.includes(role);
    setEditingRoles({
      ...editingRoles,
      roles: hasRole 
        ? editingRoles.roles.filter(r => r !== role)
        : [...editingRoles.roles, role],
    });
  };

  const saveRoles = async () => {
    if (!editingRoles) return;
    
    try {
      const userId = editingRoles.user.user_id;
      const currentRoles = userRoles[userId] || [];
      const newRoles = editingRoles.roles;

      // Remove roles that were removed
      const toRemove = currentRoles.filter(r => !newRoles.includes(r));
      for (const role of toRemove) {
        await supabase.from("user_roles").delete()
          .eq("user_id", userId)
          .eq("role", role as "admin" | "core_team" | "user");
      }

      // Add new roles
      const toAdd = newRoles.filter(r => !currentRoles.includes(r));
      for (const role of toAdd) {
        await supabase.from("user_roles").insert({ 
          user_id: userId, 
          role: role as "admin" | "core_team" | "user"
        });
      }

      toast({ title: "Success", description: "Roles updated successfully" });
      setEditingRoles(null);
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <Badge className="bg-destructive text-destructive-foreground text-[10px]"><Crown className="h-2.5 w-2.5 mr-0.5" />Admin</Badge>;
      case "core_team": return <Badge className="bg-primary text-primary-foreground text-[10px]"><Shield className="h-2.5 w-2.5 mr-0.5" />Team</Badge>;
      case "moderator": return <Badge variant="secondary" className="text-[10px]">Mod</Badge>;
      default: return null;
    }
  };

  const exportToExcel = () => {
    setExporting(true);
    try {
      const headers = ["Name", "College", "Graduation Year", "Phone", "Skills", "Roles", "LinkedIn", "GitHub", "Joined Date"];
      const rows = filteredUsers.map(user => [
        user.full_name,
        user.college || "N/A",
        user.graduation_year?.toString() || "N/A",
        user.phone || "N/A",
        user.skills?.join(", ") || "N/A",
        userRoles[user.user_id]?.join(", ") || "user",
        user.linkedin_url || "N/A",
        user.github_url || "N/A",
        new Date(user.created_at).toLocaleDateString(),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `AITD_Users_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "Export Successful", description: `Exported ${filteredUsers.length} users` });
    } catch (error) {
      toast({ title: "Export Failed", description: "Could not export user data", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Stats
  const adminCount = Object.values(userRoles).filter(r => r.includes("admin")).length;
  const teamCount = Object.values(userRoles).filter(r => r.includes("core_team")).length;
  const thisWeekCount = users.filter(u => new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management ({users.length})
              </CardTitle>
              <CardDescription>View, edit users and manage their roles</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToExcel} disabled={exporting} variant="outline" size="sm">
                {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />}
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, college, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
            <Card className="p-3 text-center">
              <p className="text-xl sm:text-2xl font-bold text-primary">{users.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Total Users</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xl sm:text-2xl font-bold text-destructive">{adminCount}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Admins</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xl sm:text-2xl font-bold text-secondary">{teamCount}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Core Team</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xl sm:text-2xl font-bold text-success">{thisWeekCount}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">This Week</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xl sm:text-2xl font-bold text-info">{users.filter(u => u.college).length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">With College</p>
            </Card>
          </div>

          {/* Users Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">College</TableHead>
                  <TableHead className="hidden sm:table-cell">Phone</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar_url || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1 text-sm">
                          <School className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate max-w-[150px]">{user.college || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {user.phone ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {user.phone}
                          </div>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {userRoles[user.user_id]?.map(role => (
                            <span key={role}>{getRoleBadge(role)}</span>
                          ))}
                          {(!userRoles[user.user_id] || userRoles[user.user_id].length === 0) && (
                            <Badge variant="outline" className="text-[10px]">User</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditDialog(user)} title="Edit User">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openRolesDialog(user)} title="Manage Roles">
                            <Shield className="h-3.5 w-3.5 text-primary" />
                          </Button>
                          {user.linkedin_url && (
                            <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                              <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsAddOpen(open); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update user profile information" : "Add a new user to the platform"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Full Name *</Label>
                <Input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>College</Label>
                <Input value={formData.college} onChange={e => setFormData({ ...formData, college: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Graduation Year</Label>
                <Input type="number" value={formData.graduation_year} onChange={e => setFormData({ ...formData, graduation_year: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Skills (comma-separated)</Label>
              <Input value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} placeholder="React, Python, Design..." />
            </div>
            <div className="grid gap-2">
              <Label>Bio</Label>
              <Textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>LinkedIn URL</Label>
                <Input value={formData.linkedin_url} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>GitHub URL</Label>
                <Input value={formData.github_url} onChange={e => setFormData({ ...formData, github_url: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { resetForm(); setIsAddOpen(false); }}>Cancel</Button>
            <Button onClick={handleSaveUser} disabled={!formData.full_name}>
              {editingUser ? "Save Changes" : "Add User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Roles Management Dialog */}
      <Dialog open={!!editingRoles} onOpenChange={(open) => !open && setEditingRoles(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Roles</DialogTitle>
            <DialogDescription>
              Assign roles to {editingRoles?.user.full_name}
            </DialogDescription>
          </DialogHeader>
          {editingRoles && (
            <div className="space-y-4">
              <div className="space-y-3">
                {AVAILABLE_ROLES.map((role) => (
                  <div key={role} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id={`role-${role}`}
                      checked={editingRoles.roles.includes(role)}
                      onCheckedChange={() => toggleRole(role)}
                    />
                    <Label htmlFor={`role-${role}`} className="flex-1 cursor-pointer">
                      <div className="font-medium capitalize">{role.replace("_", " ")}</div>
                      <div className="text-xs text-muted-foreground">
                        {role === "admin" && "Full platform access and management"}
                        {role === "core_team" && "Access to Team Panel with permissions"}
                        {role === "moderator" && "Content moderation capabilities"}
                        {role === "user" && "Standard user access"}
                      </div>
                    </Label>
                    {getRoleBadge(role)}
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-xs text-warning flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Changes to admin role require careful consideration
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditingRoles(null)}>Cancel</Button>
            <Button onClick={saveRoles}>Save Roles</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Plus, UserCheck, User, Pencil, Trash2, Mail, Phone, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  designation: string | null;
  status: string;
}

interface TeamManagerProps {
  ambassadorId: string;
  cycleId: string;
  onTeamUpdate?: () => void;
}

export function TeamManager({ ambassadorId, cycleId, onTeamUpdate }: TeamManagerProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "volunteer",
    designation: "",
  });

  useEffect(() => {
    fetchMembers();
  }, [ambassadorId, cycleId]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("ambassador_team_members")
        .select("*")
        .eq("ambassador_id", ambassadorId)
        .eq("cycle_id", cycleId)
        .order("role", { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching team:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const coreTeamCount = members.filter((m) => m.role === "core_team").length;
    if (formData.role === "core_team" && coreTeamCount >= 5) {
      toast.error("Maximum 5 core team members allowed");
      return;
    }

    try {
      const { error } = await supabase.from("ambassador_team_members").insert({
        ambassador_id: ambassadorId,
        cycle_id: cycleId,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        role: formData.role,
        designation: formData.designation || null,
      });

      if (error) throw error;
      toast.success("Team member added!");
      setIsDialogOpen(false);
      setFormData({ full_name: "", email: "", phone: "", role: "volunteer", designation: "" });
      fetchMembers();
      onTeamUpdate?.();
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add team member");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const coreTeamCount = members.filter((m) => m.role === "core_team" && m.id !== editingMember.id).length;
    if (formData.role === "core_team" && coreTeamCount >= 5) {
      toast.error("Maximum 5 core team members allowed");
      return;
    }

    try {
      const { error } = await supabase
        .from("ambassador_team_members")
        .update({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || null,
          role: formData.role,
          designation: formData.designation || null,
        })
        .eq("id", editingMember.id);

      if (error) throw error;
      toast.success("Team member updated!");
      setIsEditDialogOpen(false);
      setEditingMember(null);
      setFormData({ full_name: "", email: "", phone: "", role: "volunteer", designation: "" });
      fetchMembers();
      onTeamUpdate?.();
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error("Failed to update team member");
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("ambassador_team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      toast.success("Team member removed");
      fetchMembers();
      onTeamUpdate?.();
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Failed to remove team member");
    }
  };

  const openEditDialog = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      full_name: member.full_name,
      email: member.email,
      phone: member.phone || "",
      role: member.role,
      designation: member.designation || "",
    });
    setIsEditDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const coreTeam = members.filter((m) => m.role === "core_team");
  const volunteers = members.filter((m) => m.role === "volunteer");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const MemberCard = ({ member, showActions = true }: { member: TeamMember; showActions?: boolean }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
          {getInitials(member.full_name)}
        </div>
        <div>
          <p className="font-medium text-sm">{member.full_name}</p>
          <p className="text-xs text-muted-foreground">{member.designation || member.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge 
          variant={member.status === "active" ? "default" : "secondary"}
          className={member.status === "active" ? "bg-green-500/10 text-green-600 border-green-200" : ""}
        >
          {member.status}
        </Badge>
        {showActions && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <a 
              href={`mailto:${member.email}`}
              className="p-1.5 rounded-md hover:bg-background transition-colors"
              title="Send email"
            >
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
            {member.phone && (
              <a 
                href={`tel:${member.phone}`}
                className="p-1.5 rounded-md hover:bg-background transition-colors"
                title="Call"
              >
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            )}
            <button 
              onClick={() => openEditDialog(member)}
              className="p-1.5 rounded-md hover:bg-background transition-colors"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button 
                  className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove {member.full_name} from your team. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeleteMember(member.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </motion.div>
  );

  const MemberForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void; isEdit?: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label>Full Name</Label>
        <Input
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          placeholder="Enter full name"
          required
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter email address"
          required
        />
      </div>
      <div>
        <Label>Phone</Label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Enter phone number (optional)"
        />
      </div>
      <div>
        <Label>Role</Label>
        <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="core_team" disabled={coreTeam.length >= 5 && (!isEdit || editingMember?.role !== "core_team")}>
              Core Team ({coreTeam.length}/5)
            </SelectItem>
            <SelectItem value="volunteer">Volunteer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.role === "core_team" && (
        <div>
          <Label>Designation</Label>
          <Input
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            placeholder="Marketing Lead, Tech Lead, etc."
          />
        </div>
      )}
      <DialogFooter>
        <Button type="submit">{isEdit ? "Update Member" : "Add Member"}</Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          My Team ({members.length})
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
            </DialogHeader>
            <MemberForm onSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          <MemberForm onSubmit={handleEditSubmit} isEdit />
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              Core Team ({coreTeam.length}/5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {coreTeam.length === 0 ? (
              <div className="text-center py-6">
                <UserCheck className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No core team members yet</p>
                <p className="text-xs text-muted-foreground mt-1">Add up to 5 core team members with specific roles</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {coreTeam.map((m) => (
                    <MemberCard key={m.id} member={m} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Volunteers ({volunteers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {volunteers.length === 0 ? (
              <div className="text-center py-6">
                <User className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No volunteers yet</p>
                <p className="text-xs text-muted-foreground mt-1">Add unlimited volunteers to help with tasks</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <AnimatePresence>
                  {volunteers.map((m) => (
                    <MemberCard key={m.id} member={m} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

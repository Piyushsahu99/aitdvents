import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Plus, UserCheck, User } from "lucide-react";

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

  const coreTeam = members.filter((m) => m.role === "core_team");
  const volunteers = members.filter((m) => m.role === "volunteer");

  if (loading) return <div className="text-center py-8">Loading team...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          My Team
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core_team">Core Team ({coreTeam.length}/5)</SelectItem>
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
              <Button type="submit">Add Member</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4" />Core Team ({coreTeam.length}/5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {coreTeam.length === 0 ? (
              <p className="text-sm text-muted-foreground">No core team members yet</p>
            ) : (
              <div className="space-y-2">
                {coreTeam.map((m) => (
                  <div key={m.id} className="flex justify-between items-center p-2 bg-muted rounded">
                    <div>
                      <p className="font-medium text-sm">{m.full_name}</p>
                      <p className="text-xs text-muted-foreground">{m.designation || m.email}</p>
                    </div>
                    <Badge variant={m.status === "active" ? "default" : "secondary"}>{m.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />Volunteers ({volunteers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {volunteers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No volunteers yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {volunteers.map((m) => (
                  <div key={m.id} className="flex justify-between items-center p-2 bg-muted rounded">
                    <div>
                      <p className="font-medium text-sm">{m.full_name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                    <Badge variant={m.status === "active" ? "default" : "secondary"}>{m.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Award, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Mentor {
  id: string;
  full_name: string;
  email: string | null;
  expertise: string[];
  bio: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface MentorSession {
  id: string;
  mentor_id: string;
  topic: string;
  scheduled_at: string;
  status: string;
  ambassador?: {
    full_name: string;
  };
}

export function AmbassadorMentorManager() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    expertise: "",
    bio: "",
    avatar_url: "",
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mentorsRes, sessionsRes] = await Promise.all([
        supabase.from("ambassador_mentors").select("*").order("full_name"),
        supabase
          .from("ambassador_mentor_sessions")
          .select(`*, ambassador:campus_ambassadors(full_name)`)
          .order("scheduled_at", { ascending: false })
          .limit(50),
      ]);

      if (mentorsRes.error) throw mentorsRes.error;
      if (sessionsRes.error) throw sessionsRes.error;

      setMentors(mentorsRes.data || []);
      setSessions(sessionsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch mentors");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const mentorData = {
      full_name: formData.full_name,
      email: formData.email || null,
      expertise: formData.expertise.split(",").map((s) => s.trim()).filter(Boolean),
      bio: formData.bio || null,
      avatar_url: formData.avatar_url || null,
      is_active: formData.is_active,
    };

    try {
      if (editingMentor) {
        const { error } = await supabase
          .from("ambassador_mentors")
          .update(mentorData)
          .eq("id", editingMentor.id);

        if (error) throw error;
        toast.success("Mentor updated successfully");
      } else {
        const { error } = await supabase
          .from("ambassador_mentors")
          .insert([mentorData]);

        if (error) throw error;
        toast.success("Mentor added successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving mentor:", error);
      toast.error("Failed to save mentor");
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      expertise: "",
      bio: "",
      avatar_url: "",
      is_active: true,
    });
    setEditingMentor(null);
  };

  const handleEdit = (mentor: Mentor) => {
    setEditingMentor(mentor);
    setFormData({
      full_name: mentor.full_name,
      email: mentor.email || "",
      expertise: mentor.expertise?.join(", ") || "",
      bio: mentor.bio || "",
      avatar_url: mentor.avatar_url || "",
      is_active: mentor.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (mentorId: string) => {
    if (!confirm("Are you sure you want to delete this mentor?")) return;

    try {
      const { error } = await supabase
        .from("ambassador_mentors")
        .delete()
        .eq("id", mentorId);

      if (error) throw error;
      toast.success("Mentor deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting mentor:", error);
      toast.error("Failed to delete mentor");
    }
  };

  const getMentorSessionCount = (mentorId: string) => {
    return sessions.filter((s) => s.mentor_id === mentorId).length;
  };

  const getSessionStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading mentors...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Program Mentors
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Mentor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingMentor ? "Edit Mentor" : "Add Mentor"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Mentor name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="mentor@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="expertise">Expertise (comma-separated)</Label>
                  <Input
                    id="expertise"
                    value={formData.expertise}
                    onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                    placeholder="Leadership, Event Management, Marketing"
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Brief description..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingMentor ? "Update" : "Add"} Mentor
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {mentors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No mentors added yet. Add your first mentor to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mentor</TableHead>
                  <TableHead>Expertise</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mentors.map((mentor) => (
                  <TableRow key={mentor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={mentor.avatar_url || undefined} />
                          <AvatarFallback>
                            {mentor.full_name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{mentor.full_name}</p>
                          <p className="text-sm text-muted-foreground">{mentor.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise?.slice(0, 3).map((exp, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Calendar className="h-3 w-3 mr-1" />
                        {getMentorSessionCount(mentor.id)} sessions
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={mentor.is_active ? "default" : "secondary"}>
                        {mentor.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(mentor)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(mentor.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Mentor Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No mentor sessions booked yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ambassador</TableHead>
                  <TableHead>Mentor</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.slice(0, 10).map((session) => {
                  const mentor = mentors.find((m) => m.id === session.mentor_id);
                  return (
                    <TableRow key={session.id}>
                      <TableCell>{session.ambassador?.full_name || "Unknown"}</TableCell>
                      <TableCell>{mentor?.full_name || "Unknown"}</TableCell>
                      <TableCell>{session.topic}</TableCell>
                      <TableCell>
                        {format(new Date(session.scheduled_at), "MMM d, yyyy h:mm a")}
                      </TableCell>
                      <TableCell>{getSessionStatusBadge(session.status)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

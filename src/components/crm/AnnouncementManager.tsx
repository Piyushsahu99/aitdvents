import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, Plus, Edit, Trash2, Pin, Clock, Users, Megaphone, AlertCircle, Info, CheckCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  target_audience: string;
  target_users: string[] | null;
  published_by: string | null;
  published_at: string;
  expires_at: string | null;
  is_pinned: boolean;
  is_read_by: string[];
  created_at: string;
}

const PRIORITIES = ["low", "normal", "high", "urgent"];
const AUDIENCES = ["all", "team", "students", "specific"];

export function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal",
    target_audience: "all",
    expires_at: "",
    is_pinned: false,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("published_at", { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      priority: "normal",
      target_audience: "all",
      expires_at: "",
      is_pinned: false,
    });
  };

  const handleCreate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("announcements")
        .insert([{
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          target_audience: formData.target_audience,
          expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
          is_pinned: formData.is_pinned,
          published_by: user?.id,
        }]);

      if (error) throw error;

      toast({ title: "Success", description: "Announcement published" });
      resetForm();
      setIsCreateOpen(false);
      fetchAnnouncements();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editingAnnouncement) return;
    try {
      const { error } = await supabase
        .from("announcements")
        .update({
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          target_audience: formData.target_audience,
          expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
          is_pinned: formData.is_pinned,
        })
        .eq("id", editingAnnouncement.id);

      if (error) throw error;

      toast({ title: "Success", description: "Announcement updated" });
      setEditingAnnouncement(null);
      resetForm();
      fetchAnnouncements();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Success", description: "Announcement deleted" });
      fetchAnnouncements();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const togglePin = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .update({ is_pinned: !announcement.is_pinned })
        .eq("id", announcement.id);

      if (error) throw error;
      fetchAnnouncements();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const openEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      target_audience: announcement.target_audience,
      expires_at: announcement.expires_at ? format(new Date(announcement.expires_at), "yyyy-MM-dd") : "",
      is_pinned: announcement.is_pinned,
    });
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent": return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "high": return <AlertCircle className="h-4 w-4 text-warning" />;
      case "normal": return <Info className="h-4 w-4 text-info" />;
      case "low": return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "default";
      case "normal": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case "all": return "Everyone";
      case "team": return "Team Only";
      case "students": return "Students";
      case "specific": return "Specific Users";
      default: return audience;
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const AnnouncementForm = () => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Title *</Label>
        <Input 
          value={formData.title} 
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="Announcement title"
        />
      </div>
      <div className="grid gap-2">
        <Label>Content *</Label>
        <Textarea 
          value={formData.content} 
          onChange={e => setFormData({ ...formData, content: e.target.value })}
          placeholder="Write your announcement..."
          rows={4}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Priority</Label>
          <Select value={formData.priority} onValueChange={v => setFormData({ ...formData, priority: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRIORITIES.map(p => (
                <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Target Audience</Label>
          <Select value={formData.target_audience} onValueChange={v => setFormData({ ...formData, target_audience: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {AUDIENCES.map(a => (
                <SelectItem key={a} value={a} className="capitalize">{getAudienceBadge(a)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Expires At (optional)</Label>
        <Input 
          type="date"
          value={formData.expires_at} 
          onChange={e => setFormData({ ...formData, expires_at: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch 
          checked={formData.is_pinned}
          onCheckedChange={checked => setFormData({ ...formData, is_pinned: checked })}
        />
        <Label>Pin this announcement</Label>
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading announcements...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Announcements
            </CardTitle>
            <CardDescription>Broadcast messages to your team and users</CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={resetForm}>
                <Plus className="h-4 w-4" /> New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>Publish a new announcement to your audience</DialogDescription>
              </DialogHeader>
              <AnnouncementForm />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={!formData.title || !formData.content}>Publish</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No announcements yet</p>
              <p className="text-sm">Create your first announcement to reach your audience</p>
            </div>
          ) : (
            announcements.map(announcement => (
              <Card 
                key={announcement.id} 
                className={`${announcement.is_pinned ? "border-primary/50 bg-primary/5" : ""} ${isExpired(announcement.expires_at) ? "opacity-60" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {getPriorityIcon(announcement.priority)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm">{announcement.title}</h4>
                          {announcement.is_pinned && (
                            <Pin className="h-3.5 w-3.5 text-primary" />
                          )}
                          {isExpired(announcement.expires_at) && (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">Expired</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{announcement.content}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                          <Badge variant={getPriorityColor(announcement.priority)} className="text-[10px]">
                            {announcement.priority}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            <Users className="h-3 w-3 mr-1" />
                            {getAudienceBadge(announcement.target_audience)}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(announcement.published_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className={`h-7 w-7 ${announcement.is_pinned ? "text-primary" : ""}`}
                        onClick={() => togglePin(announcement)}
                        title={announcement.is_pinned ? "Unpin" : "Pin"}
                      >
                        <Pin className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7"
                        onClick={() => openEdit(announcement)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editingAnnouncement} onOpenChange={open => !open && setEditingAnnouncement(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription>Update announcement details</DialogDescription>
          </DialogHeader>
          <AnnouncementForm />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditingAnnouncement(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={!formData.title || !formData.content}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

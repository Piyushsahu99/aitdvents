import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Users, Loader2, Linkedin, Instagram, Github, Twitter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Member {
  id: string;
  full_name: string;
  designation: string;
  role_type: string;
  college: string | null;
  photo_url: string | null;
  bio: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const emptyForm = {
  full_name: "",
  designation: "Member",
  role_type: "team",
  college: "",
  photo_url: "",
  bio: "",
  linkedin_url: "",
  instagram_url: "",
  github_url: "",
  twitter_url: "",
  display_order: 0,
};

export function ShowcaseMemberManager() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    const { data } = await supabase
      .from("showcase_members")
      .select("*")
      .order("display_order", { ascending: true });
    setMembers((data as Member[]) || []);
    setLoading(false);
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (m: Member) => {
    setEditing(m);
    setForm({
      full_name: m.full_name,
      designation: m.designation,
      role_type: m.role_type,
      college: m.college || "",
      photo_url: m.photo_url || "",
      bio: m.bio || "",
      linkedin_url: m.linkedin_url || "",
      instagram_url: m.instagram_url || "",
      github_url: m.github_url || "",
      twitter_url: m.twitter_url || "",
      display_order: m.display_order,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.full_name) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name,
        designation: form.designation,
        role_type: form.role_type,
        college: form.college || null,
        photo_url: form.photo_url || null,
        bio: form.bio || null,
        linkedin_url: form.linkedin_url || null,
        instagram_url: form.instagram_url || null,
        github_url: form.github_url || null,
        twitter_url: form.twitter_url || null,
        display_order: form.display_order,
      };

      if (editing) {
        const { error } = await supabase.from("showcase_members").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Updated" });
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from("showcase_members").insert({ ...payload, created_by: user?.id });
        if (error) throw error;
        toast({ title: "Added" });
      }
      setDialogOpen(false);
      fetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("showcase_members").update({ is_active: !current }).eq("id", id);
    fetch();
  };

  const deleteMember = async (id: string) => {
    await supabase.from("showcase_members").delete().eq("id", id);
    toast({ title: "Deleted" });
    fetch();
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Team & Ambassador Showcase</h3>
          <p className="text-sm text-muted-foreground">Manage public team member and ambassador profiles</p>
        </div>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Member</Button>
      </div>

      {members.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No showcase members yet. Add your first team member!</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {members.map((m) => (
            <Card key={m.id} className="p-4">
              <div className="flex items-center gap-3">
                {/* Photo */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-primary/20">
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Users className="h-5 w-5 text-muted-foreground/40" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-semibold text-sm truncate">{m.full_name}</h4>
                    <Badge variant={m.role_type === "team" ? "default" : "secondary"} className="text-[10px]">
                      {m.role_type === "team" ? "Team" : "Ambassador"}
                    </Badge>
                    <Badge variant={m.is_active ? "default" : "outline"} className="text-[10px]">
                      {m.is_active ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.designation} {m.college ? `• ${m.college}` : ""}</p>
                  <div className="flex gap-1.5 mt-1">
                    {m.linkedin_url && <Linkedin className="h-3 w-3 text-[#0A66C2]" />}
                    {m.instagram_url && <Instagram className="h-3 w-3 text-pink-500" />}
                    {m.github_url && <Github className="h-3 w-3" />}
                    {m.twitter_url && <Twitter className="h-3 w-3 text-sky-500" />}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Switch checked={m.is_active} onCheckedChange={() => toggleActive(m.id, m.is_active)} />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(m)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteMember(m.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Member" : "Add Showcase Member"}</DialogTitle>
            <DialogDescription>Add a team member or campus ambassador to display publicly</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Full Name *</Label><Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="John Doe" /></div>
              <div><Label className="text-xs">Designation</Label><Input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} placeholder="Campus Ambassador" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={form.role_type} onValueChange={v => setForm({ ...form, role_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team">Core Team</SelectItem>
                    <SelectItem value="ambassador">Campus Ambassador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Display Order</Label><Input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div><Label className="text-xs">College</Label><Input value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} placeholder="College name" /></div>
            <div><Label className="text-xs">Photo URL</Label><Input value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." /></div>
            <div><Label className="text-xs">Bio</Label><Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={2} placeholder="Short bio..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">LinkedIn URL</Label><Input value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." /></div>
              <div><Label className="text-xs">Instagram URL</Label><Input value={form.instagram_url} onChange={e => setForm({ ...form, instagram_url: e.target.value })} placeholder="https://instagram.com/..." /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">GitHub URL</Label><Input value={form.github_url} onChange={e => setForm({ ...form, github_url: e.target.value })} placeholder="https://github.com/..." /></div>
              <div><Label className="text-xs">Twitter URL</Label><Input value={form.twitter_url} onChange={e => setForm({ ...form, twitter_url: e.target.value })} placeholder="https://twitter.com/..." /></div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editing ? "Update Member" : "Add Member"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

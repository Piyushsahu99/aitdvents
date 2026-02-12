import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Eye, EyeOff, Link as LinkIcon, Lock, Image as ImageIcon, Loader2, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Gallery {
  id: string;
  event_title: string;
  description: string | null;
  drive_link: string;
  password: string;
  cover_image_url: string | null;
  event_date: string | null;
  photo_count: number;
  is_active: boolean;
  created_at: string;
}

export function EventGalleryManager() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [form, setForm] = useState({
    event_title: "",
    description: "",
    drive_link: "",
    password: "",
    cover_image_url: "",
    event_date: "",
    photo_count: 0,
  });
  const { toast } = useToast();

  useEffect(() => { fetchGalleries(); }, []);

  const fetchGalleries = async () => {
    const { data, error } = await supabase
      .from("event_galleries")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setGalleries(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ event_title: "", description: "", drive_link: "", password: "", cover_image_url: "", event_date: "", photo_count: 0 });
    setEditingGallery(null);
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (g: Gallery) => {
    setEditingGallery(g);
    setForm({
      event_title: g.event_title,
      description: g.description || "",
      drive_link: g.drive_link,
      password: g.password,
      cover_image_url: g.cover_image_url || "",
      event_date: g.event_date || "",
      photo_count: g.photo_count,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.event_title || !form.drive_link || !form.password) {
      toast({ title: "Missing fields", description: "Title, Drive link and password are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editingGallery) {
        const { error } = await supabase.from("event_galleries").update({
          event_title: form.event_title,
          description: form.description || null,
          drive_link: form.drive_link,
          password: form.password,
          cover_image_url: form.cover_image_url || null,
          event_date: form.event_date || null,
          photo_count: form.photo_count,
        }).eq("id", editingGallery.id);
        if (error) throw error;
        toast({ title: "Updated", description: "Gallery updated successfully" });
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from("event_galleries").insert({
          event_title: form.event_title,
          description: form.description || null,
          drive_link: form.drive_link,
          password: form.password,
          cover_image_url: form.cover_image_url || null,
          event_date: form.event_date || null,
          photo_count: form.photo_count,
          created_by: user?.id,
        });
        if (error) throw error;
        toast({ title: "Created", description: "Gallery added successfully" });
      }
      setDialogOpen(false);
      resetForm();
      fetchGalleries();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("event_galleries").update({ is_active: !current }).eq("id", id);
    if (!error) fetchGalleries();
  };

  const deleteGallery = async (id: string) => {
    const { error } = await supabase.from("event_galleries").delete().eq("id", id);
    if (!error) { toast({ title: "Deleted" }); fetchGalleries(); }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Event Photo Galleries</h3>
          <p className="text-sm text-muted-foreground">Share Google Drive links with password protection for each event</p>
        </div>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Gallery</Button>
      </div>

      {galleries.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No galleries yet. Add your first event gallery!</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {galleries.map((g) => (
            <Card key={g.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm truncate">{g.event_title}</h4>
                    <Badge variant={g.is_active ? "default" : "secondary"} className="text-[10px]">
                      {g.is_active ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                  {g.description && <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{g.description}</p>}
                  <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs text-muted-foreground">
                    {g.event_date && <span>📅 {g.event_date}</span>}
                    <span className="flex items-center gap-0.5"><ImageIcon className="h-3 w-3" /> {g.photo_count} photos</span>
                    <span className="flex items-center gap-0.5"><Lock className="h-3 w-3" /> {g.password}</span>
                    <a href={g.drive_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" /> Drive
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Switch checked={g.is_active} onCheckedChange={() => toggleActive(g.id, g.is_active)} />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(g)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteGallery(g.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingGallery ? "Edit Gallery" : "Add Event Gallery"}</DialogTitle>
            <DialogDescription>Add a Google Drive link with a password for event photos</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Event Title *</Label><Input value={form.event_title} onChange={e => setForm({ ...form, event_title: e.target.value })} placeholder="e.g. CodeMatrix Genesis 2025" /></div>
            <div><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Short description..." /></div>
            <div><Label className="text-xs">Google Drive Link *</Label><Input value={form.drive_link} onChange={e => setForm({ ...form, drive_link: e.target.value })} placeholder="https://drive.google.com/..." /></div>
            <div><Label className="text-xs">Password *</Label><Input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password for access" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Event Date</Label><Input value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} placeholder="e.g. Jan 2025" /></div>
              <div><Label className="text-xs">Photo Count</Label><Input type="number" value={form.photo_count} onChange={e => setForm({ ...form, photo_count: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div><Label className="text-xs">Cover Image URL</Label><Input value={form.cover_image_url} onChange={e => setForm({ ...form, cover_image_url: e.target.value })} placeholder="https://..." /></div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingGallery ? "Update Gallery" : "Create Gallery"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

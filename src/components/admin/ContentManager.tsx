import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Save, Trash2, FileText, Image } from "lucide-react";

interface SiteContent {
  id: string;
  page: string;
  section: string;
  content_key: string;
  content_type: string;
  content_value: string | null;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  order_index: number;
}

interface PageBanner {
  id: string;
  page: string;
  position: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  link_text: string | null;
  background_color: string | null;
  is_active: boolean;
  order_index: number;
}

const PAGES = ["home", "events", "bounties", "courses", "jobs", "hackathons"];
const POSITIONS = ["top", "middle", "bottom", "sidebar"];

export function ContentManager() {
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [banners, setBanners] = useState<PageBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPage, setSelectedPage] = useState("home");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contentsRes, bannersRes] = await Promise.all([
        supabase.from("site_content").select("*").order("page").order("section").order("order_index"),
        supabase.from("page_banners").select("*").order("page").order("order_index"),
      ]);

      if (contentsRes.error) throw contentsRes.error;
      if (bannersRes.error) throw bannersRes.error;

      setContents((contentsRes.data as SiteContent[]) || []);
      setBanners((bannersRes.data as PageBanner[]) || []);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({ title: "Error", description: "Failed to load content", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (id: string, updates: Partial<SiteContent>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_content")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Content updated" });
      fetchData();
    } catch (error) {
      console.error("Error updating content:", error);
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addContent = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("site_content").insert({
        page: selectedPage,
        section: "custom",
        content_key: `new_content_${Date.now()}`,
        content_type: "text",
        content_value: "New content",
        is_active: true,
        order_index: contents.length,
      });

      if (error) throw error;
      toast({ title: "Success", description: "Content added" });
      fetchData();
    } catch (error) {
      console.error("Error adding content:", error);
      toast({ title: "Error", description: "Failed to add content", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteContent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return;
    
    setSaving(true);
    try {
      const { error } = await supabase.from("site_content").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Content deleted" });
      fetchData();
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateBanner = async (id: string, updates: Partial<PageBanner>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("page_banners")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Banner updated" });
      fetchData();
    } catch (error) {
      console.error("Error updating banner:", error);
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addBanner = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("page_banners").insert({
        page: selectedPage,
        position: "top",
        title: "New Banner",
        description: "Banner description",
        is_active: false,
        order_index: banners.length,
      });

      if (error) throw error;
      toast({ title: "Success", description: "Banner added" });
      fetchData();
    } catch (error) {
      console.error("Error adding banner:", error);
      toast({ title: "Error", description: "Failed to add banner", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    
    setSaving(true);
    try {
      const { error } = await supabase.from("page_banners").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Banner deleted" });
      fetchData();
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const filteredContents = contents.filter((c) => c.page === selectedPage);
  const filteredBanners = banners.filter((b) => b.page === selectedPage);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Manager</h2>
          <p className="text-muted-foreground">Manage website content like WordPress</p>
        </div>
        <Select value={selectedPage} onValueChange={setSelectedPage}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGES.map((page) => (
              <SelectItem key={page} value={page} className="capitalize">
                {page}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">
            <FileText className="h-4 w-4 mr-2" />
            Page Content
          </TabsTrigger>
          <TabsTrigger value="banners">
            <Image className="h-4 w-4 mr-2" />
            Banners & Promos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4 mt-4">
          <Button onClick={addContent} disabled={saving}>
            <Plus className="h-4 w-4 mr-2" />
            Add Content Block
          </Button>

          {filteredContents.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No content for this page yet. Add some content blocks above.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredContents.map((content) => (
                <Card key={content.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {content.section} / {content.content_key}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={content.is_active}
                          onCheckedChange={(checked) =>
                            updateContent(content.id, { is_active: checked })
                          }
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteContent(content.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Section</Label>
                        <Input
                          value={content.section}
                          onChange={(e) =>
                            updateContent(content.id, { section: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Key</Label>
                        <Input
                          value={content.content_key}
                          onChange={(e) =>
                            updateContent(content.id, { content_key: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Content Value</Label>
                      <Textarea
                        value={content.content_value || ""}
                        onChange={(e) =>
                          updateContent(content.id, { content_value: e.target.value })
                        }
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Image URL</Label>
                        <Input
                          value={content.image_url || ""}
                          onChange={(e) =>
                            updateContent(content.id, { image_url: e.target.value })
                          }
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Link URL</Label>
                        <Input
                          value={content.link_url || ""}
                          onChange={(e) =>
                            updateContent(content.id, { link_url: e.target.value })
                          }
                          placeholder="/path or https://..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="banners" className="space-y-4 mt-4">
          <Button onClick={addBanner} disabled={saving}>
            <Plus className="h-4 w-4 mr-2" />
            Add Banner
          </Button>

          {filteredBanners.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No banners for this page yet. Add promotional banners above.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredBanners.map((banner) => (
                <Card key={banner.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {banner.title || "Untitled Banner"} ({banner.position})
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={banner.is_active}
                          onCheckedChange={(checked) =>
                            updateBanner(banner.id, { is_active: checked })
                          }
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteBanner(banner.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Title</Label>
                        <Input
                          value={banner.title || ""}
                          onChange={(e) =>
                            updateBanner(banner.id, { title: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Position</Label>
                        <Select
                          value={banner.position}
                          onValueChange={(value) =>
                            updateBanner(banner.id, { position: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {POSITIONS.map((pos) => (
                              <SelectItem key={pos} value={pos} className="capitalize">
                                {pos}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        value={banner.description || ""}
                        onChange={(e) =>
                          updateBanner(banner.id, { description: e.target.value })
                        }
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Image URL</Label>
                        <Input
                          value={banner.image_url || ""}
                          onChange={(e) =>
                            updateBanner(banner.id, { image_url: e.target.value })
                          }
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Link URL</Label>
                        <Input
                          value={banner.link_url || ""}
                          onChange={(e) =>
                            updateBanner(banner.id, { link_url: e.target.value })
                          }
                          placeholder="/path or https://..."
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Button Text</Label>
                        <Input
                          value={banner.link_text || ""}
                          onChange={(e) =>
                            updateBanner(banner.id, { link_text: e.target.value })
                          }
                          placeholder="Learn More"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Background Color</Label>
                        <Input
                          value={banner.background_color || ""}
                          onChange={(e) =>
                            updateBanner(banner.id, { background_color: e.target.value })
                          }
                          placeholder="linear-gradient(...) or #hex"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
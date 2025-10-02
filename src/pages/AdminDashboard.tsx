import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, Loader2, Sparkles } from "lucide-react";

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    participants: 0,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!roles) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate AI content
      toast({
        title: "Generating AI Content",
        description: "Creating blog post, hashtags, and poster...",
      });

      // Generate blog
      const blogResponse = await supabase.functions.invoke('generate-content', {
        body: { event: formData, type: 'blog' }
      });

      // Generate hashtags
      const hashtagsResponse = await supabase.functions.invoke('generate-content', {
        body: { event: formData, type: 'hashtags' }
      });

      // Generate poster description
      const posterDescResponse = await supabase.functions.invoke('generate-content', {
        body: { event: formData, type: 'poster' }
      });

      // Generate poster image
      const posterResponse = await supabase.functions.invoke('generate-poster', {
        body: { description: posterDescResponse.data?.description }
      });

      const hashtags = hashtagsResponse.data || [];
      const posterUrl = posterResponse.data?.imageUrl || "";

      // Create event
      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert([{
          ...formData,
          status: 'draft',
          created_by: user.id,
          hashtags,
          poster_url: posterUrl,
        }])
        .select()
        .single();

      if (eventError) throw eventError;

      // Create blog
      if (blogResponse.data) {
        const { error: blogError } = await supabase
          .from("blogs")
          .insert([{
            event_id: event.id,
            title: blogResponse.data.title,
            content: blogResponse.data.content,
            excerpt: blogResponse.data.excerpt,
            read_time: blogResponse.data.readTime,
            author: "AITD Events Team",
            category: formData.category,
            published: false,
            ai_generated: true,
          }]);

        if (blogError) throw blogError;
      }

      toast({
        title: "Success!",
        description: "Event created with AI-generated content. Review and publish when ready.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        date: "",
        location: "",
        category: "",
        participants: 0,
      });
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage events with AI-powered content generation</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="create-event">
        <TabsList>
          <TabsTrigger value="create-event">Create Event</TabsTrigger>
          <TabsTrigger value="manage-events">Manage Events</TabsTrigger>
        </TabsList>

        <TabsContent value="create-event">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Create New Event</h2>
              <Badge variant="secondary" className="ml-2">AI-Powered</Badge>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title*</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="AI Hackathon 2025"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category*</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hackathon">Hackathon</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Competition">Competition</SelectItem>
                      <SelectItem value="Conference">Conference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description*</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  placeholder="Describe the event..."
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date*</Label>
                  <Input
                    id="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                    placeholder="15-17 Jan 2025"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location*</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                    placeholder="IIT Delhi / Online"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participants">Expected Participants</Label>
                  <Input
                    id="participants"
                    type="number"
                    value={formData.participants}
                    onChange={(e) => setFormData({...formData, participants: parseInt(e.target.value) || 0})}
                    placeholder="500"
                  />
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Will Generate:
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Professional blog post about the event</li>
                  <li>• Trending hashtags for social media</li>
                  <li>• Eye-catching event poster</li>
                  <li>• SEO-optimized content</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating AI Content...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event with AI Content
                  </>
                )}
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="manage-events">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Event Management</h2>
            <p className="text-muted-foreground">
              View and manage all events, approve AI-generated content, and publish.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

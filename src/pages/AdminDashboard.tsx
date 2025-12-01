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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LogOut, Plus, Loader2, Sparkles, Calendar, Users, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    participants: 0,
    is_online: true,
    is_free: true,
    external_link: "",
  });

  const [jobs, setJobs] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [jobFormData, setJobFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "",
    duration: "",
    stipend: "",
    category: "",
    description: "",
    requirements: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
    fetchEvents();
    fetchJobs();
    fetchBlogs();
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

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*, events(title)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const updateEventStatus = async (id: string, status: 'draft' | 'live' | 'ended') => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Event ${status === 'live' ? 'published' : 'updated'} successfully`,
      });

      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });

      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("jobs")
        .insert([{
          ...jobFormData,
          status: 'draft',
          created_by: user.id,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job opportunity created successfully",
      });

      setJobFormData({
        title: "",
        company: "",
        location: "",
        type: "",
        duration: "",
        stipend: "",
        category: "",
        description: "",
        requirements: "",
      });

      fetchJobs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateJobStatus = async (id: string, status: 'draft' | 'live' | 'ended') => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Job ${status === 'live' ? 'published' : 'updated'} successfully`,
      });

      fetchJobs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job deleted successfully",
      });

      fetchJobs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateBlogStatus = async (id: string, published: boolean) => {
    try {
      const { error } = await supabase
        .from("blogs")
        .update({ published })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Blog ${published ? 'published' : 'unpublished'} successfully`,
      });

      fetchBlogs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteBlog = async (id: string) => {
    try {
      const { error } = await supabase
        .from("blogs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog deleted successfully",
      });

      fetchBlogs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
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
        is_online: true,
        is_free: true,
        external_link: "",
      });

      fetchEvents();
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-fade-in">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage events with AI-powered content generation</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="hover-lift">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="manage-events" className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 mb-6">
            <TabsTrigger value="manage-events" className="gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="manage-jobs" className="gap-2">
              <Users className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="manage-blogs" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Blogs
            </TabsTrigger>
            <TabsTrigger value="create-event" className="gap-2">
              <Plus className="h-4 w-4" />
              New Event
            </TabsTrigger>
          </TabsList>

        <TabsContent value="create-event">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Create New Event</h2>
              <Badge variant="secondary" className="ml-2">AI-Powered</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Fill in the event details below. The system will automatically generate a blog post, hashtags, and an eye-catching poster using AI.
            </p>

            <form onSubmit={handleCreateEvent} className="space-y-6">
              {/* Basic Information Section */}
              <div className="p-5 bg-muted/30 rounded-xl border border-border space-y-4">
                <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                  📋 Basic Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                      placeholder="e.g., AI Innovation Summit 2025"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
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
                        <SelectItem value="Webinar">Webinar</SelectItem>
                        <SelectItem value="Meetup">Meetup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Event Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    placeholder="Provide a detailed description of the event..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">This description will be used to generate AI content</p>
                </div>
              </div>

              {/* Date & Location Section */}
              <div className="p-5 bg-muted/30 rounded-xl border border-border space-y-4">
                <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                  📅 Date & Location
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Event Date *</Label>
                    <Input
                      id="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                      placeholder="15-17 Jan 2025"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
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
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Select
                      value={formData.is_online ? "online" : "offline"}
                      onValueChange={(value) => setFormData({...formData, is_online: value === "online"})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">🌐 Online</SelectItem>
                        <SelectItem value="offline">📍 Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Registration Fee</Label>
                    <Select
                      value={formData.is_free ? "free" : "paid"}
                      onValueChange={(value) => setFormData({...formData, is_free: value === "free"})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">✨ Free</SelectItem>
                        <SelectItem value="paid">💰 Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Registration Link - Highlighted Section */}
              <div className="p-5 bg-gradient-to-br from-primary/10 to-accent/5 rounded-xl border-2 border-primary/30 space-y-3">
                <h3 className="font-semibold text-primary flex items-center gap-2">
                  🔗 Registration Link
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="external_link" className="text-foreground">Registration Form URL</Label>
                  <Input
                    id="external_link"
                    value={formData.external_link}
                    onChange={(e) => setFormData({...formData, external_link: e.target.value})}
                    placeholder="https://forms.google.com/... or https://eventbrite.com/..."
                    type="url"
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Paste your Google Form, Typeform, Eventbrite, or any registration page link here. The "Register Now" button on event cards will link to this URL.
                  </p>
                </div>
              </div>

              {/* AI Generation Info */}
              <div className="bg-gradient-to-br from-accent/10 to-primary/5 p-6 rounded-xl border-2 border-accent/20 shadow-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  AI Will Automatically Generate:
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Professional blog post about the event</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Trending hashtags for social media promotion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Eye-catching event poster image</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>SEO-optimized content for better visibility</span>
                  </li>
                </ul>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={generating}>
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
          <div className="grid gap-4">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <Card className="p-4 hover-lift">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Events</p>
                    <p className="text-2xl font-bold">{events.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 hover-lift">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Live Events</p>
                    <p className="text-2xl font-bold">{events.filter(e => e.status === 'live').length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 hover-lift">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Edit className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Draft Events</p>
                    <p className="text-2xl font-bold">{events.filter(e => e.status === 'draft').length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 hover-lift">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Registrations</p>
                    <p className="text-2xl font-bold">{events.reduce((acc, e) => acc + (e.applied_count || 0), 0)}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Events Table */}
            <Card className="overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  Event Management
                </h2>
                <p className="text-muted-foreground mt-1">
                  View, edit, and manage all events
                </p>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registrations</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No events yet. Create your first event to get started!
                        </TableCell>
                      </TableRow>
                    ) : (
                      events.map((event) => (
                        <TableRow key={event.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">{event.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{event.category}</Badge>
                          </TableCell>
                          <TableCell>{event.date}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={event.status === 'live' ? 'default' : 'secondary'}
                              className={event.status === 'live' ? 'bg-green-500 hover:bg-green-600' : ''}
                            >
                              {event.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {event.applied_count || 0}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>{event.title}</DialogTitle>
                                    <DialogDescription>Event Details</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Description</Label>
                                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <Label>Date</Label>
                                        <p className="text-sm">{event.date}</p>
                                      </div>
                                      <div>
                                        <Label>Location</Label>
                                        <p className="text-sm">{event.location}</p>
                                      </div>
                                    </div>
                                    {event.poster_url && (
                                      <div>
                                        <Label>AI Generated Poster</Label>
                                        <img src={event.poster_url} alt={event.title} className="mt-2 rounded-lg w-full" />
                                      </div>
                                    )}
                                    {event.hashtags && event.hashtags.length > 0 && (
                                      <div>
                                        <Label>Hashtags</Label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {event.hashtags.map((tag: string, i: number) => (
                                            <Badge key={i} variant="secondary">{tag}</Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>

                              {event.status === 'draft' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => updateEventStatus(event.id, 'live')}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}

                              {event.status === 'live' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => updateEventStatus(event.id, 'draft')}
                                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}

                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteEvent(event.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manage-jobs">
          <Card className="overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-blue-500/5 to-transparent">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Job Opportunities Management
              </h2>
              <p className="text-muted-foreground mt-1">
                Create and manage job opportunities for students
              </p>
            </div>

            {/* Job Creation Form */}
            <div className="p-6 border-b bg-muted/20">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add New Job Opportunity
              </h3>
              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title*</Label>
                    <Input
                      id="job_title"
                      value={jobFormData.title}
                      onChange={(e) => setJobFormData({...jobFormData, title: e.target.value})}
                      required
                      placeholder="Software Developer Intern"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company*</Label>
                    <Input
                      id="company"
                      value={jobFormData.company}
                      onChange={(e) => setJobFormData({...jobFormData, company: e.target.value})}
                      required
                      placeholder="Google"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job_type">Type*</Label>
                    <Select
                      value={jobFormData.type}
                      onValueChange={(value) => setJobFormData({...jobFormData, type: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Internship">Internship</SelectItem>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_location">Location*</Label>
                    <Input
                      id="job_location"
                      value={jobFormData.location}
                      onChange={(e) => setJobFormData({...jobFormData, location: e.target.value})}
                      required
                      placeholder="Bangalore / Remote"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stipend">Stipend*</Label>
                    <Input
                      id="stipend"
                      value={jobFormData.stipend}
                      onChange={(e) => setJobFormData({...jobFormData, stipend: e.target.value})}
                      required
                      placeholder="₹20,000/month"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration*</Label>
                    <Input
                      id="duration"
                      value={jobFormData.duration}
                      onChange={(e) => setJobFormData({...jobFormData, duration: e.target.value})}
                      required
                      placeholder="3 months"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_category">Category*</Label>
                    <Select
                      value={jobFormData.category}
                      onValueChange={(value) => setJobFormData({...jobFormData, category: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Development">Development</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_description">Description*</Label>
                  <Textarea
                    id="job_description"
                    value={jobFormData.description}
                    onChange={(e) => setJobFormData({...jobFormData, description: e.target.value})}
                    required
                    placeholder="Job description..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_requirements">Requirements*</Label>
                  <Textarea
                    id="job_requirements"
                    value={jobFormData.requirements}
                    onChange={(e) => setJobFormData({...jobFormData, requirements: e.target.value})}
                    required
                    placeholder="Skills and qualifications required..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Job Opportunity
                </Button>
              </form>
            </div>

            {/* Jobs Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No jobs yet. Add your first job opportunity!
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobs.map((job) => (
                      <TableRow key={job.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.company}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={job.status === 'live' ? 'default' : 'secondary'}
                            className={job.status === 'live' ? 'bg-green-500 hover:bg-green-600' : ''}
                          >
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {job.status === 'draft' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => updateJobStatus(job.id, 'live')}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {job.status === 'live' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => updateJobStatus(job.id, 'draft')}
                                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteJob(job.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="manage-blogs">
          <Card className="overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-purple-500/5 to-transparent">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Blog Management
              </h2>
              <p className="text-muted-foreground mt-1">
                Manage AI-generated and custom blog posts
              </p>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>AI Generated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No blogs yet. Create an event to generate AI blog posts!
                      </TableCell>
                    </TableRow>
                  ) : (
                    blogs.map((blog) => (
                      <TableRow key={blog.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium max-w-xs truncate">{blog.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{blog.category}</Badge>
                        </TableCell>
                        <TableCell>{blog.author}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={blog.published ? 'default' : 'secondary'}
                            className={blog.published ? 'bg-green-500 hover:bg-green-600' : ''}
                          >
                            {blog.published ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {blog.ai_generated && (
                            <Badge variant="outline" className="gap-1">
                              <Sparkles className="h-3 w-3" />
                              AI
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{blog.title}</DialogTitle>
                                  <DialogDescription>
                                    By {blog.author} • {blog.read_time}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Excerpt</Label>
                                    <p className="text-sm text-muted-foreground mt-1">{blog.excerpt}</p>
                                  </div>
                                  <div>
                                    <Label>Content</Label>
                                    <div className="text-sm text-muted-foreground mt-1 prose prose-sm max-w-none">
                                      {blog.content}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {!blog.published && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => updateBlogStatus(blog.id, true)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {blog.published && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => updateBlogStatus(blog.id, false)}
                                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteBlog(blog.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

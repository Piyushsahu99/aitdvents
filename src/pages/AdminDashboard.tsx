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
import { LogOut, Plus, Loader2, Sparkles, Calendar, Users, Eye, Edit, Trash2, CheckCircle, XCircle, FileText, Shield, DollarSign, GraduationCap, Briefcase, Trophy, Database } from "lucide-react";
import { ContentManager } from "@/components/admin/ContentManager";
import { AdminInviteManager } from "@/components/admin/AdminInviteManager";

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [bounties, setBounties] = useState<any[]>([]);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

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

  const [bountyFormData, setBountyFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    prize_amount: "",
    deadline: "",
    requirements: "",
    tags: "",
  });

  const [hackathonFormData, setHackathonFormData] = useState({
    title: "",
    description: "",
    organizer: "",
    category: "",
    difficulty: "",
    prize_pool: "",
    start_date: "",
    end_date: "",
    registration_deadline: "",
    location: "",
    mode: "online",
    max_team_size: 4,
    external_link: "",
  });

  const [scholarshipFormData, setScholarshipFormData] = useState({
    title: "",
    description: "",
    provider: "",
    amount: "",
    deadline: "",
    eligibility: "",
    category: "",
    requirements: "",
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
        .maybeSingle();

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
      fetchAllData();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchEvents(),
      fetchJobs(),
      fetchBlogs(),
      fetchBounties(),
      fetchHackathons(),
      fetchScholarships(),
      fetchCourses(),
      fetchUsers(),
    ]);
  };

  const fetchEvents = async () => {
    const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false });
    setEvents(data || []);
  };

  const fetchJobs = async () => {
    const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
    setJobs(data || []);
  };

  const fetchBlogs = async () => {
    const { data } = await supabase.from("blogs").select("*, events(title)").order("created_at", { ascending: false });
    setBlogs(data || []);
  };

  const fetchBounties = async () => {
    const { data } = await supabase.from("bounties").select("*").order("created_at", { ascending: false });
    setBounties(data || []);
  };

  const fetchHackathons = async () => {
    const { data } = await supabase.from("hackathons").select("*").order("created_at", { ascending: false });
    setHackathons(data || []);
  };

  const fetchScholarships = async () => {
    const { data } = await supabase.from("scholarships").select("*").order("created_at", { ascending: false });
    setScholarships(data || []);
  };

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    setCourses(data || []);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("student_profiles").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Event CRUD
  const updateEventStatus = async (id: string, status: 'draft' | 'live' | 'ended') => {
    const { error } = await supabase.from("events").update({ status }).eq("id", id);
    if (!error) { toast({ title: "Success", description: "Event updated" }); fetchEvents(); }
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (!error) { toast({ title: "Success", description: "Event deleted" }); fetchEvents(); }
  };

  // Job CRUD
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase.from("jobs").insert([{ ...jobFormData, status: 'draft', created_by: user.id }]);
    if (!error) {
      toast({ title: "Success", description: "Job created" });
      setJobFormData({ title: "", company: "", location: "", type: "", duration: "", stipend: "", category: "", description: "", requirements: "" });
      fetchJobs();
    }
  };

  const updateJobStatus = async (id: string, status: 'draft' | 'live' | 'ended') => {
    const { error } = await supabase.from("jobs").update({ status }).eq("id", id);
    if (!error) { toast({ title: "Success", description: "Job updated" }); fetchJobs(); }
  };

  const deleteJob = async (id: string) => {
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (!error) { toast({ title: "Success", description: "Job deleted" }); fetchJobs(); }
  };

  // Blog CRUD
  const updateBlogStatus = async (id: string, published: boolean) => {
    const { error } = await supabase.from("blogs").update({ published }).eq("id", id);
    if (!error) { toast({ title: "Success", description: `Blog ${published ? 'published' : 'unpublished'}` }); fetchBlogs(); }
  };

  const deleteBlog = async (id: string) => {
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (!error) { toast({ title: "Success", description: "Blog deleted" }); fetchBlogs(); }
  };

  // Bounty CRUD
  const handleCreateBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase.from("bounties").insert([{
      ...bountyFormData,
      tags: bountyFormData.tags.split(",").map(t => t.trim()).filter(Boolean),
      status: 'draft',
      created_by: user.id,
    }]);
    if (!error) {
      toast({ title: "Success", description: "Bounty created" });
      setBountyFormData({ title: "", description: "", category: "", difficulty: "", prize_amount: "", deadline: "", requirements: "", tags: "" });
      fetchBounties();
    }
  };

  const updateBountyStatus = async (id: string, status: 'draft' | 'live' | 'ended') => {
    const { error } = await supabase.from("bounties").update({ status }).eq("id", id);
    if (!error) { toast({ title: "Success", description: "Bounty updated" }); fetchBounties(); }
  };

  const deleteBounty = async (id: string) => {
    const { error } = await supabase.from("bounties").delete().eq("id", id);
    if (!error) { toast({ title: "Success", description: "Bounty deleted" }); fetchBounties(); }
  };

  // Hackathon CRUD
  const handleCreateHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase.from("hackathons").insert([{
      ...hackathonFormData,
      status: 'draft',
      created_by: user.id,
    }]);
    if (!error) {
      toast({ title: "Success", description: "Hackathon created" });
      setHackathonFormData({ title: "", description: "", organizer: "", category: "", difficulty: "", prize_pool: "", start_date: "", end_date: "", registration_deadline: "", location: "", mode: "online", max_team_size: 4, external_link: "" });
      fetchHackathons();
    }
  };

  const updateHackathonStatus = async (id: string, status: 'draft' | 'live' | 'ended') => {
    const { error } = await supabase.from("hackathons").update({ status }).eq("id", id);
    if (!error) { toast({ title: "Success", description: "Hackathon updated" }); fetchHackathons(); }
  };

  const deleteHackathon = async (id: string) => {
    const { error } = await supabase.from("hackathons").delete().eq("id", id);
    if (!error) { toast({ title: "Success", description: "Hackathon deleted" }); fetchHackathons(); }
  };

  // Scholarship CRUD
  const handleCreateScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase.from("scholarships").insert([{
      ...scholarshipFormData,
      status: 'draft',
      created_by: user.id,
    }]);
    if (!error) {
      toast({ title: "Success", description: "Scholarship created" });
      setScholarshipFormData({ title: "", description: "", provider: "", amount: "", deadline: "", eligibility: "", category: "", requirements: "" });
      fetchScholarships();
    }
  };

  const updateScholarshipStatus = async (id: string, status: 'draft' | 'live' | 'ended') => {
    const { error } = await supabase.from("scholarships").update({ status }).eq("id", id);
    if (!error) { toast({ title: "Success", description: "Scholarship updated" }); fetchScholarships(); }
  };

  const deleteScholarship = async (id: string) => {
    const { error } = await supabase.from("scholarships").delete().eq("id", id);
    if (!error) { toast({ title: "Success", description: "Scholarship deleted" }); fetchScholarships(); }
  };

  // Event creation with AI
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      toast({ title: "Generating AI Content", description: "Creating blog post, hashtags, and poster..." });

      const blogResponse = await supabase.functions.invoke('generate-content', { body: { event: formData, type: 'blog' } });
      const hashtagsResponse = await supabase.functions.invoke('generate-content', { body: { event: formData, type: 'hashtags' } });
      const posterDescResponse = await supabase.functions.invoke('generate-content', { body: { event: formData, type: 'poster' } });
      const posterResponse = await supabase.functions.invoke('generate-poster', { body: { description: posterDescResponse.data?.description } });

      const { data: event, error: eventError } = await supabase.from("events").insert([{
        ...formData,
        status: 'draft',
        created_by: user.id,
        hashtags: hashtagsResponse.data || [],
        poster_url: posterResponse.data?.imageUrl || "",
      }]).select().single();

      if (eventError) throw eventError;

      if (blogResponse.data) {
        await supabase.from("blogs").insert([{
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
      }

      toast({ title: "Success!", description: "Event created with AI-generated content." });
      setFormData({ title: "", description: "", date: "", location: "", category: "", participants: 0, is_online: true, is_free: true, external_link: "" });
      fetchEvents();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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

  const getStatusBadge = (status: string) => (
    <Badge variant={status === 'live' ? 'default' : 'secondary'} className={status === 'live' ? 'bg-green-500' : ''}>
      {status}
    </Badge>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage all platform content and users</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <Card className="p-4"><div className="text-center"><Calendar className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{events.length}</p><p className="text-xs text-muted-foreground">Events</p></div></Card>
          <Card className="p-4"><div className="text-center"><Trophy className="h-5 w-5 mx-auto text-orange-500 mb-1" /><p className="text-2xl font-bold">{bounties.length}</p><p className="text-xs text-muted-foreground">Bounties</p></div></Card>
          <Card className="p-4"><div className="text-center"><Sparkles className="h-5 w-5 mx-auto text-purple-500 mb-1" /><p className="text-2xl font-bold">{hackathons.length}</p><p className="text-xs text-muted-foreground">Hackathons</p></div></Card>
          <Card className="p-4"><div className="text-center"><Briefcase className="h-5 w-5 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{jobs.length}</p><p className="text-xs text-muted-foreground">Jobs</p></div></Card>
          <Card className="p-4"><div className="text-center"><GraduationCap className="h-5 w-5 mx-auto text-green-500 mb-1" /><p className="text-2xl font-bold">{scholarships.length}</p><p className="text-xs text-muted-foreground">Scholarships</p></div></Card>
          <Card className="p-4"><div className="text-center"><FileText className="h-5 w-5 mx-auto text-pink-500 mb-1" /><p className="text-2xl font-bold">{courses.length}</p><p className="text-xs text-muted-foreground">Courses</p></div></Card>
          <Card className="p-4"><div className="text-center"><Users className="h-5 w-5 mx-auto text-cyan-500 mb-1" /><p className="text-2xl font-bold">{users.length}</p><p className="text-xs text-muted-foreground">Users</p></div></Card>
          <Card className="p-4"><div className="text-center"><FileText className="h-5 w-5 mx-auto text-amber-500 mb-1" /><p className="text-2xl font-bold">{blogs.length}</p><p className="text-xs text-muted-foreground">Blogs</p></div></Card>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1">
            <TabsTrigger value="events"><Calendar className="h-4 w-4 mr-1" />Events</TabsTrigger>
            <TabsTrigger value="bounties"><Trophy className="h-4 w-4 mr-1" />Bounties</TabsTrigger>
            <TabsTrigger value="hackathons"><Sparkles className="h-4 w-4 mr-1" />Hackathons</TabsTrigger>
            <TabsTrigger value="jobs"><Briefcase className="h-4 w-4 mr-1" />Jobs</TabsTrigger>
            <TabsTrigger value="scholarships"><GraduationCap className="h-4 w-4 mr-1" />Scholarships</TabsTrigger>
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" />Users</TabsTrigger>
            <TabsTrigger value="blogs"><FileText className="h-4 w-4 mr-1" />Blogs</TabsTrigger>
            <TabsTrigger value="cms"><Database className="h-4 w-4 mr-1" />CMS</TabsTrigger>
            <TabsTrigger value="admins"><Shield className="h-4 w-4 mr-1" />Admins</TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Plus className="h-5 w-5" /> Create Event (AI-Powered)</h3>
              <form onSubmit={handleCreateEvent} className="grid md:grid-cols-2 gap-4">
                <div><Label>Title</Label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                <div><Label>Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hackathon">Hackathon</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Competition">Competition</SelectItem>
                      <SelectItem value="Conference">Conference</SelectItem>
                      <SelectItem value="Webinar">Webinar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2"><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required /></div>
                <div><Label>Date</Label><Input value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required /></div>
                <div><Label>Location</Label><Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required /></div>
                <div><Label>Registration Link</Label><Input value={formData.external_link} onChange={e => setFormData({...formData, external_link: e.target.value})} /></div>
                <div><Label>Participants</Label><Input type="number" value={formData.participants} onChange={e => setFormData({...formData, participants: parseInt(e.target.value) || 0})} /></div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={generating}>{generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="mr-2 h-4 w-4" />Create with AI</>}</Button>
                </div>
              </form>
            </Card>
            <Card>
              <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {events.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="flex gap-1">
                        {item.status === 'draft' && <Button size="sm" variant="ghost" onClick={() => updateEventStatus(item.id, 'live')}><CheckCircle className="h-4 w-4 text-green-500" /></Button>}
                        {item.status === 'live' && <Button size="sm" variant="ghost" onClick={() => updateEventStatus(item.id, 'ended')}><XCircle className="h-4 w-4 text-yellow-500" /></Button>}
                        <Button size="sm" variant="ghost" onClick={() => deleteEvent(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Bounties Tab */}
          <TabsContent value="bounties">
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Plus className="h-5 w-5" /> Create Bounty</h3>
              <form onSubmit={handleCreateBounty} className="grid md:grid-cols-2 gap-4">
                <div><Label>Title</Label><Input value={bountyFormData.title} onChange={e => setBountyFormData({...bountyFormData, title: e.target.value})} required /></div>
                <div><Label>Category</Label>
                  <Select value={bountyFormData.category} onValueChange={v => setBountyFormData({...bountyFormData, category: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Content">Content</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2"><Label>Description</Label><Textarea value={bountyFormData.description} onChange={e => setBountyFormData({...bountyFormData, description: e.target.value})} required /></div>
                <div><Label>Difficulty</Label>
                  <Select value={bountyFormData.difficulty} onValueChange={v => setBountyFormData({...bountyFormData, difficulty: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Prize Amount (₹)</Label><Input value={bountyFormData.prize_amount} onChange={e => setBountyFormData({...bountyFormData, prize_amount: e.target.value})} required /></div>
                <div><Label>Deadline</Label><Input type="datetime-local" value={bountyFormData.deadline} onChange={e => setBountyFormData({...bountyFormData, deadline: e.target.value})} required /></div>
                <div><Label>Tags (comma separated)</Label><Input value={bountyFormData.tags} onChange={e => setBountyFormData({...bountyFormData, tags: e.target.value})} /></div>
                <div className="md:col-span-2"><Label>Requirements</Label><Textarea value={bountyFormData.requirements} onChange={e => setBountyFormData({...bountyFormData, requirements: e.target.value})} required /></div>
                <div className="md:col-span-2"><Button type="submit"><Plus className="mr-2 h-4 w-4" />Create Bounty</Button></div>
              </form>
            </Card>
            <Card>
              <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Prize</TableHead><TableHead>Difficulty</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {bounties.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                      <TableCell>₹{item.prize_amount}</TableCell>
                      <TableCell><Badge>{item.difficulty}</Badge></TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="flex gap-1">
                        {item.status === 'draft' && <Button size="sm" variant="ghost" onClick={() => updateBountyStatus(item.id, 'live')}><CheckCircle className="h-4 w-4 text-green-500" /></Button>}
                        {item.status === 'live' && <Button size="sm" variant="ghost" onClick={() => updateBountyStatus(item.id, 'ended')}><XCircle className="h-4 w-4 text-yellow-500" /></Button>}
                        <Button size="sm" variant="ghost" onClick={() => deleteBounty(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Hackathons Tab */}
          <TabsContent value="hackathons">
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Plus className="h-5 w-5" /> Create Hackathon</h3>
              <form onSubmit={handleCreateHackathon} className="grid md:grid-cols-2 gap-4">
                <div><Label>Title</Label><Input value={hackathonFormData.title} onChange={e => setHackathonFormData({...hackathonFormData, title: e.target.value})} required /></div>
                <div><Label>Organizer</Label><Input value={hackathonFormData.organizer} onChange={e => setHackathonFormData({...hackathonFormData, organizer: e.target.value})} required /></div>
                <div className="md:col-span-2"><Label>Description</Label><Textarea value={hackathonFormData.description} onChange={e => setHackathonFormData({...hackathonFormData, description: e.target.value})} required /></div>
                <div><Label>Category</Label>
                  <Select value={hackathonFormData.category} onValueChange={v => setHackathonFormData({...hackathonFormData, category: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AI/ML">AI/ML</SelectItem>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Mobile">Mobile</SelectItem>
                      <SelectItem value="Blockchain">Blockchain</SelectItem>
                      <SelectItem value="Open Innovation">Open Innovation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Difficulty</Label>
                  <Select value={hackathonFormData.difficulty} onValueChange={v => setHackathonFormData({...hackathonFormData, difficulty: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Prize Pool</Label><Input value={hackathonFormData.prize_pool} onChange={e => setHackathonFormData({...hackathonFormData, prize_pool: e.target.value})} required /></div>
                <div><Label>Start Date</Label><Input type="datetime-local" value={hackathonFormData.start_date} onChange={e => setHackathonFormData({...hackathonFormData, start_date: e.target.value})} required /></div>
                <div><Label>End Date</Label><Input type="datetime-local" value={hackathonFormData.end_date} onChange={e => setHackathonFormData({...hackathonFormData, end_date: e.target.value})} required /></div>
                <div><Label>Registration Deadline</Label><Input type="datetime-local" value={hackathonFormData.registration_deadline} onChange={e => setHackathonFormData({...hackathonFormData, registration_deadline: e.target.value})} required /></div>
                <div><Label>Mode</Label>
                  <Select value={hackathonFormData.mode} onValueChange={v => setHackathonFormData({...hackathonFormData, mode: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Location</Label><Input value={hackathonFormData.location} onChange={e => setHackathonFormData({...hackathonFormData, location: e.target.value})} required /></div>
                <div><Label>Max Team Size</Label><Input type="number" value={hackathonFormData.max_team_size} onChange={e => setHackathonFormData({...hackathonFormData, max_team_size: parseInt(e.target.value) || 4})} /></div>
                <div><Label>External Link</Label><Input value={hackathonFormData.external_link} onChange={e => setHackathonFormData({...hackathonFormData, external_link: e.target.value})} /></div>
                <div className="md:col-span-2"><Button type="submit"><Plus className="mr-2 h-4 w-4" />Create Hackathon</Button></div>
              </form>
            </Card>
            <Card>
              <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Organizer</TableHead><TableHead>Prize Pool</TableHead><TableHead>Mode</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {hackathons.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.organizer}</TableCell>
                      <TableCell>{item.prize_pool}</TableCell>
                      <TableCell><Badge variant="outline">{item.mode}</Badge></TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="flex gap-1">
                        {item.status === 'draft' && <Button size="sm" variant="ghost" onClick={() => updateHackathonStatus(item.id, 'live')}><CheckCircle className="h-4 w-4 text-green-500" /></Button>}
                        {item.status === 'live' && <Button size="sm" variant="ghost" onClick={() => updateHackathonStatus(item.id, 'ended')}><XCircle className="h-4 w-4 text-yellow-500" /></Button>}
                        <Button size="sm" variant="ghost" onClick={() => deleteHackathon(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Plus className="h-5 w-5" /> Create Job</h3>
              <form onSubmit={handleCreateJob} className="grid md:grid-cols-2 gap-4">
                <div><Label>Title</Label><Input value={jobFormData.title} onChange={e => setJobFormData({...jobFormData, title: e.target.value})} required /></div>
                <div><Label>Company</Label><Input value={jobFormData.company} onChange={e => setJobFormData({...jobFormData, company: e.target.value})} required /></div>
                <div><Label>Location</Label><Input value={jobFormData.location} onChange={e => setJobFormData({...jobFormData, location: e.target.value})} required /></div>
                <div><Label>Type</Label>
                  <Select value={jobFormData.type} onValueChange={v => setJobFormData({...jobFormData, type: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Duration</Label><Input value={jobFormData.duration} onChange={e => setJobFormData({...jobFormData, duration: e.target.value})} required /></div>
                <div><Label>Stipend/Salary</Label><Input value={jobFormData.stipend} onChange={e => setJobFormData({...jobFormData, stipend: e.target.value})} required /></div>
                <div><Label>Category</Label>
                  <Select value={jobFormData.category} onValueChange={v => setJobFormData({...jobFormData, category: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Requirements</Label><Input value={jobFormData.requirements || ''} onChange={e => setJobFormData({...jobFormData, requirements: e.target.value})} /></div>
                <div className="md:col-span-2"><Label>Description</Label><Textarea value={jobFormData.description || ''} onChange={e => setJobFormData({...jobFormData, description: e.target.value})} /></div>
                <div className="md:col-span-2"><Button type="submit"><Plus className="mr-2 h-4 w-4" />Create Job</Button></div>
              </form>
            </Card>
            <Card>
              <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Company</TableHead><TableHead>Type</TableHead><TableHead>Stipend</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {jobs.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.company}</TableCell>
                      <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
                      <TableCell>{item.stipend}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="flex gap-1">
                        {item.status === 'draft' && <Button size="sm" variant="ghost" onClick={() => updateJobStatus(item.id, 'live')}><CheckCircle className="h-4 w-4 text-green-500" /></Button>}
                        {item.status === 'live' && <Button size="sm" variant="ghost" onClick={() => updateJobStatus(item.id, 'ended')}><XCircle className="h-4 w-4 text-yellow-500" /></Button>}
                        <Button size="sm" variant="ghost" onClick={() => deleteJob(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Scholarships Tab */}
          <TabsContent value="scholarships">
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Plus className="h-5 w-5" /> Create Scholarship</h3>
              <form onSubmit={handleCreateScholarship} className="grid md:grid-cols-2 gap-4">
                <div><Label>Title</Label><Input value={scholarshipFormData.title} onChange={e => setScholarshipFormData({...scholarshipFormData, title: e.target.value})} required /></div>
                <div><Label>Provider</Label><Input value={scholarshipFormData.provider} onChange={e => setScholarshipFormData({...scholarshipFormData, provider: e.target.value})} required /></div>
                <div className="md:col-span-2"><Label>Description</Label><Textarea value={scholarshipFormData.description} onChange={e => setScholarshipFormData({...scholarshipFormData, description: e.target.value})} required /></div>
                <div><Label>Amount</Label><Input value={scholarshipFormData.amount} onChange={e => setScholarshipFormData({...scholarshipFormData, amount: e.target.value})} required /></div>
                <div><Label>Deadline</Label><Input value={scholarshipFormData.deadline} onChange={e => setScholarshipFormData({...scholarshipFormData, deadline: e.target.value})} required /></div>
                <div><Label>Eligibility</Label><Input value={scholarshipFormData.eligibility} onChange={e => setScholarshipFormData({...scholarshipFormData, eligibility: e.target.value})} required /></div>
                <div><Label>Category</Label>
                  <Select value={scholarshipFormData.category} onValueChange={v => setScholarshipFormData({...scholarshipFormData, category: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Merit-based">Merit-based</SelectItem>
                      <SelectItem value="Need-based">Need-based</SelectItem>
                      <SelectItem value="Research">Research</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Women in STEM">Women in STEM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Requirements</Label><Input value={scholarshipFormData.requirements || ''} onChange={e => setScholarshipFormData({...scholarshipFormData, requirements: e.target.value})} /></div>
                <div className="md:col-span-2"><Button type="submit"><Plus className="mr-2 h-4 w-4" />Create Scholarship</Button></div>
              </form>
            </Card>
            <Card>
              <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Provider</TableHead><TableHead>Amount</TableHead><TableHead>Deadline</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {scholarships.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.provider}</TableCell>
                      <TableCell>{item.amount}</TableCell>
                      <TableCell>{item.deadline}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="flex gap-1">
                        {item.status === 'draft' && <Button size="sm" variant="ghost" onClick={() => updateScholarshipStatus(item.id, 'live')}><CheckCircle className="h-4 w-4 text-green-500" /></Button>}
                        {item.status === 'live' && <Button size="sm" variant="ghost" onClick={() => updateScholarshipStatus(item.id, 'ended')}><XCircle className="h-4 w-4 text-yellow-500" /></Button>}
                        <Button size="sm" variant="ghost" onClick={() => deleteScholarship(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-primary" /> Registered Users ({users.length})</h2>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>College</TableHead><TableHead>Graduation</TableHead><TableHead>Skills</TableHead><TableHead>Phone</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {user.avatar_url && <img src={user.avatar_url} className="h-8 w-8 rounded-full" alt="" />}
                          {user.full_name}
                        </div>
                      </TableCell>
                      <TableCell>{user.college || '-'}</TableCell>
                      <TableCell>{user.graduation_year || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(user.skills || []).slice(0, 3).map((s: string, i: number) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}
                          {(user.skills || []).length > 3 && <Badge variant="outline">+{user.skills.length - 3}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Blogs Tab */}
          <TabsContent value="blogs">
            <Card>
              <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Author</TableHead><TableHead>AI Generated</TableHead><TableHead>Published</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {blogs.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                      <TableCell>{item.author}</TableCell>
                      <TableCell>{item.ai_generated ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}</TableCell>
                      <TableCell>{item.published ? <Badge className="bg-green-500">Published</Badge> : <Badge variant="secondary">Draft</Badge>}</TableCell>
                      <TableCell className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => updateBlogStatus(item.id, !item.published)}>{item.published ? <XCircle className="h-4 w-4 text-yellow-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}</Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteBlog(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* CMS Tab */}
          <TabsContent value="cms">
            <Card className="p-6"><ContentManager /></Card>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins">
            <AdminInviteManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

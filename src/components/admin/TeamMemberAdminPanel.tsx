import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, Briefcase, Play, Trophy, GraduationCap, Users, 
  ShoppingBag, BookOpen, Bell, BarChart3, ClipboardList, Loader2,
  LayoutDashboard, Home, LogOut, Shield
} from "lucide-react";

// Import managers based on permissions
import { ReelsModerationManager } from "@/components/admin/ReelsModerationManager";
import { MarketplaceManager } from "@/components/admin/MarketplaceManager";
import StudyMaterialsManager from "@/components/admin/StudyMaterialsManager";
import { UserManager } from "@/components/admin/UserManager";
import { TaskManager } from "@/components/crm/TaskManager";
import { AnnouncementManager } from "@/components/crm/AnnouncementManager";

export function TeamMemberAdminPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { permissions, teamMember, isLoading, isCoreTeam } = useTeamPermissions();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    events: 0, jobs: 0, hackathons: 0, bounties: 0, scholarships: 0, reels: 0, products: 0, materials: 0, users: 0
  });

  useEffect(() => {
    if (!isLoading && !isCoreTeam) {
      toast({ title: "Access Denied", description: "You don't have team member privileges", variant: "destructive" });
      navigate("/");
    }
  }, [isLoading, isCoreTeam]);

  useEffect(() => {
    if (permissions) fetchStats();
  }, [permissions]);

  const fetchStats = async () => {
    const newStats = { ...stats };
    
    if (permissions?.can_manage_events) {
      const { count } = await supabase.from("events").select("id", { count: "exact", head: true });
      newStats.events = count || 0;
    }
    if (permissions?.can_manage_jobs) {
      const { count } = await supabase.from("jobs").select("id", { count: "exact", head: true });
      newStats.jobs = count || 0;
    }
    if (permissions?.can_manage_store) {
      const { count } = await supabase.from("marketplace_products").select("id", { count: "exact", head: true });
      newStats.products = count || 0;
    }
    if (permissions?.can_manage_study_materials) {
      const { count } = await supabase.from("study_materials").select("id", { count: "exact", head: true });
      newStats.materials = count || 0;
    }
    if (permissions?.can_view_users) {
      const { count } = await supabase.from("student_profiles").select("id", { count: "exact", head: true });
      newStats.users = count || 0;
    }
    
    setStats(newStats);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isCoreTeam || !permissions) return null;

  // Build available tabs based on permissions
  const availableTabs: { value: string; label: string; icon: any; shortLabel?: string }[] = [
    { value: "overview", label: "Overview", icon: LayoutDashboard },
  ];

  if (permissions.can_assign_tasks) {
    availableTabs.push({ value: "tasks", label: "Tasks", icon: ClipboardList });
  }
  if (permissions.can_manage_events) {
    availableTabs.push({ value: "events", label: "Events", icon: Calendar });
  }
  if (permissions.can_manage_jobs) {
    availableTabs.push({ value: "jobs", label: "Jobs", icon: Briefcase });
  }
  if (permissions.can_manage_hackathons) {
    availableTabs.push({ value: "hackathons", label: "Hackathons", icon: Trophy, shortLabel: "Hack" });
  }
  if (permissions.can_manage_bounties) {
    availableTabs.push({ value: "bounties", label: "Bounties", icon: Trophy });
  }
  if (permissions.can_manage_scholarships) {
    availableTabs.push({ value: "scholarships", label: "Scholarships", icon: GraduationCap, shortLabel: "Schol" });
  }
  if (permissions.can_manage_reels) {
    availableTabs.push({ value: "reels", label: "Reels", icon: Play });
  }
  if (permissions.can_manage_store) {
    availableTabs.push({ value: "store", label: "Store", icon: ShoppingBag });
  }
  if (permissions.can_manage_study_materials) {
    availableTabs.push({ value: "materials", label: "Materials", icon: BookOpen, shortLabel: "Mat" });
  }
  if (permissions.can_view_users) {
    availableTabs.push({ value: "users", label: "Users", icon: Users });
  }
  if (permissions.can_send_announcements) {
    availableTabs.push({ value: "announcements", label: "Announcements", icon: Bell, shortLabel: "Announce" });
  }
  if (permissions.can_view_analytics) {
    availableTabs.push({ value: "analytics", label: "Analytics", icon: BarChart3 });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
                Team Panel
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {teamMember?.full_name} • {teamMember?.role_title || "Team Member"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-2">
              <Home className="h-4 w-4" /> Home
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        {/* Permission Overview */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 mb-6">
          {permissions.can_manage_events && (
            <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("events")}>
              <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{stats.events}</p>
              <p className="text-[10px] text-muted-foreground">Events</p>
            </Card>
          )}
          {permissions.can_manage_jobs && (
            <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("jobs")}>
              <Briefcase className="h-5 w-5 mx-auto mb-1 text-info" />
              <p className="text-lg font-bold">{stats.jobs}</p>
              <p className="text-[10px] text-muted-foreground">Jobs</p>
            </Card>
          )}
          {permissions.can_manage_store && (
            <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("store")}>
              <ShoppingBag className="h-5 w-5 mx-auto mb-1 text-warning" />
              <p className="text-lg font-bold">{stats.products}</p>
              <p className="text-[10px] text-muted-foreground">Products</p>
            </Card>
          )}
          {permissions.can_view_users && (
            <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("users")}>
              <Users className="h-5 w-5 mx-auto mb-1 text-secondary" />
              <p className="text-lg font-bold">{stats.users}</p>
              <p className="text-[10px] text-muted-foreground">Users</p>
            </Card>
          )}
          {permissions.can_manage_study_materials && (
            <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("materials")}>
              <BookOpen className="h-5 w-5 mx-auto mb-1 text-success" />
              <p className="text-lg font-bold">{stats.materials}</p>
              <p className="text-[10px] text-muted-foreground">Materials</p>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-max gap-1 p-1 bg-muted/50 backdrop-blur-sm">
              {availableTabs.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm px-2 sm:px-3 gap-1">
                  <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel || tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Your Permissions</CardTitle>
                  <CardDescription>Features you can access and manage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {permissions.can_manage_events && <Badge>Events</Badge>}
                    {permissions.can_manage_jobs && <Badge>Jobs</Badge>}
                    {permissions.can_manage_hackathons && <Badge>Hackathons</Badge>}
                    {permissions.can_manage_bounties && <Badge>Bounties</Badge>}
                    {permissions.can_manage_scholarships && <Badge>Scholarships</Badge>}
                    {permissions.can_manage_reels && <Badge variant="secondary">Reels</Badge>}
                    {permissions.can_manage_store && <Badge variant="secondary">Store</Badge>}
                    {permissions.can_manage_study_materials && <Badge variant="secondary">Materials</Badge>}
                    {permissions.can_view_users && <Badge variant="outline">View Users</Badge>}
                    {permissions.can_assign_tasks && <Badge variant="outline">Tasks</Badge>}
                    {permissions.can_view_analytics && <Badge variant="outline">Analytics</Badge>}
                    {permissions.can_send_announcements && <Badge variant="outline">Announcements</Badge>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Quick Stats</CardTitle>
                  <CardDescription>Content you can manage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {permissions.can_manage_events && (
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                        <span className="text-sm">Events</span>
                        <Badge>{stats.events}</Badge>
                      </div>
                    )}
                    {permissions.can_manage_jobs && (
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                        <span className="text-sm">Jobs</span>
                        <Badge>{stats.jobs}</Badge>
                      </div>
                    )}
                    {permissions.can_view_users && (
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                        <span className="text-sm">Users</span>
                        <Badge>{stats.users}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {permissions.can_assign_tasks && (
            <TabsContent value="tasks">
              <TaskManager />
            </TabsContent>
          )}

          {permissions.can_manage_events && (
            <TabsContent value="events">
              <Card className="p-4 sm:p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Event Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <p className="text-sm text-muted-foreground">
                    You have permission to manage events. Use the main Admin Dashboard for full event creation and editing.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {permissions.can_manage_jobs && (
            <TabsContent value="jobs">
              <Card className="p-4 sm:p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-info" />
                    Job Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <p className="text-sm text-muted-foreground">
                    You have permission to manage jobs. Use the main Admin Dashboard for full job posting and editing.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {permissions.can_manage_reels && (
            <TabsContent value="reels">
              <ReelsModerationManager />
            </TabsContent>
          )}

          {permissions.can_manage_store && (
            <TabsContent value="store">
              <MarketplaceManager />
            </TabsContent>
          )}

          {permissions.can_manage_study_materials && (
            <TabsContent value="materials">
              <StudyMaterialsManager />
            </TabsContent>
          )}

          {permissions.can_view_users && (
            <TabsContent value="users">
              <UserManager />
            </TabsContent>
          )}

          {permissions.can_send_announcements && (
            <TabsContent value="announcements">
              <AnnouncementManager />
            </TabsContent>
          )}

          {permissions.can_view_analytics && (
            <TabsContent value="analytics">
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-accent" />
                    Analytics Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <p className="text-muted-foreground">Analytics data will be displayed here based on your permissions.</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

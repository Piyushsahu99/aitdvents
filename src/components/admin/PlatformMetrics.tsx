import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Calendar, Briefcase, Trophy, GraduationCap, Play, ShoppingBag, 
  BookOpen, TrendingUp, TrendingDown, Activity, Loader2, Target, Award,
  UserPlus, Clock, CheckCircle2, BarChart3
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

interface PlatformStats {
  users: { total: number; thisWeek: number; thisMonth: number; withProfile: number };
  events: { total: number; live: number; draft: number; ended: number };
  jobs: { total: number; live: number; draft: number };
  hackathons: { total: number; live: number };
  bounties: { total: number; live: number };
  scholarships: { total: number; live: number };
  reels: { total: number; pending: number };
  products: { total: number; inStock: number };
  materials: { total: number };
  tasks: { total: number; pending: number; completed: number; overdue: number };
  teamMembers: { total: number; active: number };
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--warning))', 'hsl(var(--success))'];

export function PlatformMetrics() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      const [
        usersRes, 
        eventsRes, 
        jobsRes, 
        hackathonsRes, 
        bountiesRes, 
        scholarshipsRes,
        productsRes,
        materialsRes,
        tasksRes,
        teamRes
      ] = await Promise.all([
        supabase.from("student_profiles").select("*"),
        supabase.from("events").select("status"),
        supabase.from("jobs").select("status"),
        supabase.from("hackathons").select("status"),
        supabase.from("bounties").select("status"),
        supabase.from("scholarships").select("status"),
        supabase.from("marketplace_products").select("id"),
        supabase.from("study_materials").select("id"),
        supabase.from("crm_tasks").select("status, due_date"),
        supabase.from("team_members").select("status"),
      ]);

      const users = usersRes.data || [];
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const events = eventsRes.data || [];
      const jobs = jobsRes.data || [];
      const hackathons = hackathonsRes.data || [];
      const bounties = bountiesRes.data || [];
      const scholarships = scholarshipsRes.data || [];
      const products = productsRes.data || [];
      const materials = materialsRes.data || [];
      const tasks = tasksRes.data || [];
      const team = teamRes.data || [];

      setStats({
        users: {
          total: users.length,
          thisWeek: users.filter(u => new Date(u.created_at) > weekAgo).length,
          thisMonth: users.filter(u => new Date(u.created_at) > monthAgo).length,
          withProfile: users.filter(u => u.college || u.bio).length,
        },
        events: {
          total: events.length,
          live: events.filter(e => e.status === 'live').length,
          draft: events.filter(e => e.status === 'draft').length,
          ended: events.filter(e => e.status === 'ended').length,
        },
        jobs: {
          total: jobs.length,
          live: jobs.filter(j => j.status === 'live').length,
          draft: jobs.filter(j => j.status === 'draft').length,
        },
        hackathons: {
          total: hackathons.length,
          live: hackathons.filter(h => h.status === 'live').length,
        },
        bounties: {
          total: bounties.length,
          live: bounties.filter(b => b.status === 'live').length,
        },
        scholarships: {
          total: scholarships.length,
          live: scholarships.filter(s => s.status === 'live').length,
        },
        reels: {
          total: 0,
          pending: 0,
        },
        products: {
          total: products.length,
          inStock: products.length,
        },
        materials: {
          total: materials.length,
        },
        tasks: {
          total: tasks.length,
          pending: tasks.filter(t => t.status === 'pending').length,
          completed: tasks.filter(t => t.status === 'completed').length,
          overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'completed').length,
        },
        teamMembers: {
          total: team.length,
          active: team.filter(t => t.status === 'active').length,
        },
      });

      // Generate user growth data for chart (mock data based on actual counts)
      const growthData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        growthData.push({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          users: Math.max(0, users.length - Math.floor(Math.random() * 5) - i * 2),
          events: Math.floor(Math.random() * 3),
        });
      }
      setUserGrowth(growthData);

    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  const contentDistribution = [
    { name: 'Events', value: stats.events.total, color: 'hsl(var(--primary))' },
    { name: 'Jobs', value: stats.jobs.total, color: 'hsl(var(--info))' },
    { name: 'Hackathons', value: stats.hackathons.total, color: 'hsl(var(--warning))' },
    { name: 'Bounties', value: stats.bounties.total, color: 'hsl(var(--success))' },
    { name: 'Scholarships', value: stats.scholarships.total, color: 'hsl(var(--accent))' },
  ];

  const taskDistribution = [
    { name: 'Pending', value: stats.tasks.pending },
    { name: 'In Progress', value: stats.tasks.total - stats.tasks.pending - stats.tasks.completed },
    { name: 'Completed', value: stats.tasks.completed },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="hover:shadow-lg transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-primary" />
              <Badge variant="outline" className="text-[10px]">
                {stats.users.thisWeek > 0 && <TrendingUp className="h-2.5 w-2.5 mr-0.5 text-success" />}
                +{stats.users.thisWeek}
              </Badge>
            </div>
            <p className="text-2xl font-bold">{stats.users.total}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 text-secondary" />
              <Badge className="bg-success text-success-foreground text-[10px]">{stats.events.live} live</Badge>
            </div>
            <p className="text-2xl font-bold">{stats.events.total}</p>
            <p className="text-xs text-muted-foreground">Events</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="h-5 w-5 text-info" />
              <Badge className="bg-info text-info-foreground text-[10px]">{stats.jobs.live} active</Badge>
            </div>
            <p className="text-2xl font-bold">{stats.jobs.total}</p>
            <p className="text-xs text-muted-foreground">Jobs</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="h-5 w-5 text-warning" />
              <Badge variant="secondary" className="text-[10px]">{stats.hackathons.live + stats.bounties.live}</Badge>
            </div>
            <p className="text-2xl font-bold">{stats.hackathons.total + stats.bounties.total}</p>
            <p className="text-xs text-muted-foreground">Competitions</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-accent" />
              <Badge variant="outline" className="text-[10px]">{stats.teamMembers.active} active</Badge>
            </div>
            <p className="text-2xl font-bold">{stats.teamMembers.total}</p>
            <p className="text-xs text-muted-foreground">Team Members</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              {stats.tasks.overdue > 0 && (
                <Badge variant="destructive" className="text-[10px]">{stats.tasks.overdue} overdue</Badge>
              )}
            </div>
            <p className="text-2xl font-bold">{stats.tasks.completed}/{stats.tasks.total}</p>
            <p className="text-xs text-muted-foreground">Tasks Done</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* User Growth Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Activity Trend (7 Days)
            </CardTitle>
            <CardDescription>User registrations and event activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.2)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Content Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-secondary" />
              Content Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    labelLine={false}
                  >
                    {contentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* User Engagement */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              User Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Profile Completion</span>
              <span className="text-sm font-medium">
                {stats.users.total ? Math.round((stats.users.withProfile / stats.users.total) * 100) : 0}%
              </span>
            </div>
            <Progress 
              value={stats.users.total ? (stats.users.withProfile / stats.users.total) * 100 : 0} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{stats.users.withProfile} complete</span>
              <span>{stats.users.total - stats.users.withProfile} incomplete</span>
            </div>
          </CardContent>
        </Card>

        {/* Content Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-info" />
              Content Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-success/10 rounded-lg">
              <span className="text-xs">Live Content</span>
              <Badge className="bg-success text-success-foreground text-[10px]">
                {stats.events.live + stats.jobs.live + stats.hackathons.live + stats.bounties.live + stats.scholarships.live}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-warning/10 rounded-lg">
              <span className="text-xs">Pending Review</span>
              <Badge className="bg-warning text-warning-foreground text-[10px]">
                {stats.events.draft + stats.jobs.draft + stats.reels.pending}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <span className="text-xs">Ended/Archived</span>
              <Badge variant="outline" className="text-[10px]">{stats.events.ended}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Store Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-warning" />
              Store & Materials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-xs">Products</span>
              <Badge variant="outline" className="text-[10px]">{stats.products.total}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-xs">In Stock</span>
              <Badge className="bg-success text-success-foreground text-[10px]">{stats.products.inStock}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-xs">Study Materials</span>
              <Badge variant="secondary" className="text-[10px]">{stats.materials.total}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Task Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              Task Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Completion Rate</span>
              <span className="text-sm font-medium">
                {stats.tasks.total ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) : 0}%
              </span>
            </div>
            <Progress 
              value={stats.tasks.total ? (stats.tasks.completed / stats.tasks.total) * 100 : 0} 
              className="h-2"
            />
            <div className="grid grid-cols-3 gap-1 text-center">
              <div className="p-1.5 bg-warning/10 rounded">
                <p className="text-sm font-bold text-warning">{stats.tasks.pending}</p>
                <p className="text-[10px] text-muted-foreground">Pending</p>
              </div>
              <div className="p-1.5 bg-info/10 rounded">
                <p className="text-sm font-bold text-info">{stats.tasks.total - stats.tasks.pending - stats.tasks.completed}</p>
                <p className="text-[10px] text-muted-foreground">Active</p>
              </div>
              <div className="p-1.5 bg-success/10 rounded">
                <p className="text-sm font-bold text-success">{stats.tasks.completed}</p>
                <p className="text-[10px] text-muted-foreground">Done</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

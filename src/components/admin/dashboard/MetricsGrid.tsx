import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/admin/shared/StatCard";
import {
  Users,
  Calendar,
  Briefcase,
  Trophy,
  DollarSign,
  Activity,
  FileText,
  AlertCircle,
  HardDrive,
  CheckCircle,
  Award,
  TrendingUp,
} from "lucide-react";

interface MetricsData {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  liveEvents: number;
  totalJobs: number;
  activeJobs: number;
  totalBounties: number;
  pendingContent: number;
  completedTasks: number;
  totalTasks: number;
  ambassadorActivity: number;
  revenue: number;
}

export function MetricsGrid() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    
    // Set up real-time subscription for key tables
    const channel = supabase
      .channel('admin-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_profiles' }, fetchMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetchMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, fetchMetrics)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMetrics = async () => {
    try {
      const [
        usersRes,
        eventsRes,
        jobsRes,
        bountiesRes,
        tasksRes,
      ] = await Promise.all([
        supabase.from("student_profiles").select("id, created_at", { count: "exact" }),
        supabase.from("events").select("id, status", { count: "exact" }),
        supabase.from("jobs").select("id, status", { count: "exact" }),
        supabase.from("bounties").select("id, status", { count: "exact" }),
        supabase.from("crm_tasks").select("id, status", { count: "exact" }),
      ]);

      const users = usersRes.data || [];
      const events = eventsRes.data || [];
      const jobs = jobsRes.data || [];
      const bounties = bountiesRes.data || [];
      const tasks = tasksRes.data || [];

      // Calculate active users (joined in last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const activeUsers = users.filter(u => new Date(u.created_at) > weekAgo).length;

      // Count live events and active jobs
      const liveEvents = events.filter(e => e.status === 'live').length;
      const activeJobs = jobs.filter(j => j.status === 'live').length;

      // Count pending content (draft status)
      const pendingContent = 
        events.filter(e => e.status === 'draft').length +
        jobs.filter(j => j.status === 'draft').length +
        bounties.filter(b => b.status === 'draft').length;

      // Task completion
      const completedTasks = tasks.filter(t => t.status === 'completed').length;

      setMetrics({
        totalUsers: users.length,
        activeUsers,
        totalEvents: events.length,
        liveEvents,
        totalJobs: jobs.length,
        activeJobs,
        totalBounties: bounties.length,
        pendingContent,
        completedTasks,
        totalTasks: tasks.length,
        ambassadorActivity: 0, // Placeholder
        revenue: 0, // Placeholder
      });
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!metrics && isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <StatCard
            key={i}
            title="Loading..."
            value={0}
            icon={Activity}
            isLoading
          />
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <StatCard
        title="Total Users"
        value={metrics.totalUsers}
        icon={Users}
        color="from-cyan-500 to-blue-600"
        bgColor="bg-cyan-500/10"
        textColor="text-cyan-600 dark:text-cyan-400"
        badge={{ label: `+${metrics.activeUsers} this week`, variant: "outline" }}
      />

      <StatCard
        title="Active Users"
        value={metrics.activeUsers}
        icon={Activity}
        color="from-emerald-500 to-teal-600"
        bgColor="bg-emerald-500/10"
        textColor="text-emerald-600 dark:text-emerald-400"
        badge={{ label: "Last 7 days", variant: "secondary" }}
      />

      <StatCard
        title="Total Events"
        value={metrics.totalEvents}
        icon={Calendar}
        color="from-violet-500 to-purple-600"
        bgColor="bg-violet-500/10"
        textColor="text-violet-600 dark:text-violet-400"
        badge={{ label: `${metrics.liveEvents} live`, variant: "outline" }}
      />

      <StatCard
        title="Live Events"
        value={metrics.liveEvents}
        icon={TrendingUp}
        color="from-green-500 to-emerald-600"
        bgColor="bg-green-500/10"
        textColor="text-green-600 dark:text-green-400"
      />

      <StatCard
        title="Total Jobs"
        value={metrics.totalJobs}
        icon={Briefcase}
        color="from-blue-500 to-indigo-600"
        bgColor="bg-blue-500/10"
        textColor="text-blue-600 dark:text-blue-400"
        badge={{ label: `${metrics.activeJobs} active`, variant: "outline" }}
      />

      <StatCard
        title="Bounties"
        value={metrics.totalBounties}
        icon={Trophy}
        color="from-amber-500 to-orange-600"
        bgColor="bg-amber-500/10"
        textColor="text-amber-600 dark:text-amber-400"
      />

      <StatCard
        title="Pending Review"
        value={metrics.pendingContent}
        icon={AlertCircle}
        color="from-yellow-500 to-amber-600"
        bgColor="bg-yellow-500/10"
        textColor="text-yellow-600 dark:text-yellow-400"
        badge={metrics.pendingContent > 0 ? { label: "Action needed", variant: "destructive" } : undefined}
      />

      <StatCard
        title="Tasks Completed"
        value={`${metrics.completedTasks}/${metrics.totalTasks}`}
        icon={CheckCircle}
        color="from-green-500 to-teal-600"
        bgColor="bg-green-500/10"
        textColor="text-green-600 dark:text-green-400"
        trend={{
          value: metrics.totalTasks > 0 ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0,
          isPositive: true,
        }}
      />

      <StatCard
        title="Ambassador Activity"
        value={metrics.ambassadorActivity}
        icon={Award}
        color="from-pink-500 to-rose-600"
        bgColor="bg-pink-500/10"
        textColor="text-pink-600 dark:text-pink-400"
      />

      <StatCard
        title="Revenue"
        value={`₹${metrics.revenue.toLocaleString()}`}
        icon={DollarSign}
        color="from-indigo-500 to-violet-600"
        bgColor="bg-indigo-500/10"
        textColor="text-indigo-600 dark:text-indigo-400"
      />

      <StatCard
        title="Content Items"
        value={metrics.totalEvents + metrics.totalJobs + metrics.totalBounties}
        icon={FileText}
        color="from-rose-500 to-pink-600"
        bgColor="bg-rose-500/10"
        textColor="text-rose-600 dark:text-rose-400"
      />

      <StatCard
        title="System Health"
        value="Operational"
        icon={HardDrive}
        color="from-teal-500 to-cyan-600"
        bgColor="bg-teal-500/10"
        textColor="text-teal-600 dark:text-teal-400"
        badge={{ label: "All systems", variant: "outline" }}
      />
    </div>
  );
}

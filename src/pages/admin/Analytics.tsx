import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, FileText, Activity, DollarSign, Download, TrendingUp, TrendingDown, Calendar, Eye, MousePointer, Clock } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function Analytics() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [usersRes, eventsRes, jobsRes] = await Promise.all([
        supabase.from("student_profiles").select("id, created_at"),
        supabase.from("events").select("id, created_at, status"),
        supabase.from("jobs").select("id, created_at, status"),
      ]);

      const users = usersRes.data || [];
      const events = eventsRes.data || [];
      const jobs = jobsRes.data || [];

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      setStats({
        totalUsers: users.length,
        newUsersWeek: users.filter(u => new Date(u.created_at) > weekAgo).length,
        newUsersMonth: users.filter(u => new Date(u.created_at) > monthAgo).length,
        totalEvents: events.length,
        liveEvents: events.filter(e => e.status === 'live').length,
        totalJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'live').length,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Deep insights and comprehensive reporting
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="engagement">
            <Activity className="h-4 w-4 mr-2" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <DollarSign className="h-4 w-4 mr-2" />
            Revenue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center justify-between">
                  <span>Total Users</span>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{isLoading ? "..." : stats?.totalUsers || 0}</div>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{isLoading ? "..." : stats?.newUsersWeek || 0} this week
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center justify-between">
                  <span>Active Events</span>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{isLoading ? "..." : stats?.liveEvents || 0}</div>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  of {stats?.totalEvents || 0} total
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center justify-between">
                  <span>Active Jobs</span>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{isLoading ? "..." : stats?.activeJobs || 0}</div>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  of {stats?.totalJobs || 0} total
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center justify-between">
                  <span>Growth Rate</span>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoading ? "..." : stats?.totalUsers > 0 ? Math.round((stats.newUsersMonth / stats.totalUsers) * 100) : 0}%
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  last 30 days
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  User Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Active Users</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Event Participation</span>
                      <span className="text-sm font-medium">72%</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Profile Completion</span>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  Top Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Event RSVP</span>
                    <Badge>1,234</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Job Apply</span>
                    <Badge variant="secondary">856</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Course Enroll</span>
                    <Badge variant="outline">632</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quiz Play</span>
                    <Badge variant="outline">421</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Avg. Session Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-4xl font-bold">8m 34s</div>
                  <p className="text-sm text-muted-foreground mt-2">per session</p>
                  <Badge variant="outline" className="mt-4 bg-green-500/10 text-green-600 border-green-500/20">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% from last week
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">User Registration Trend</CardTitle>
                <CardDescription>Monthly signups over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div>
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Chart will display user registration trends</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">User Demographics</CardTitle>
                <CardDescription>By college and graduation year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">College Students</span>
                      <span className="text-sm font-medium">76%</span>
                    </div>
                    <Progress value={76} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Professionals</span>
                      <span className="text-sm font-medium">18%</span>
                    </div>
                    <Progress value={18} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Others</span>
                      <span className="text-sm font-medium">6%</span>
                    </div>
                    <Progress value={6} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Analytics</CardTitle>
              <CardDescription>Content performance and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Content analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Analytics</CardTitle>
              <CardDescription>Platform engagement and activity metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Engagement analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Revenue and financial metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Revenue analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

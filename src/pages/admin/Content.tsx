import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Calendar, Briefcase, Trophy, GraduationCap, Play, FileCheck, Eye, Edit, CheckCircle, XCircle, Clock } from "lucide-react";

export default function Content() {
  const [pendingCounts, setPendingCounts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingCounts();
  }, []);

  const fetchPendingCounts = async () => {
    try {
      const [eventsRes, jobsRes, bountiesRes] = await Promise.all([
        supabase.from("events").select("id, status", { count: "exact" }),
        supabase.from("jobs").select("id, status", { count: "exact" }),
        supabase.from("bounties").select("id, status", { count: "exact" }),
      ]);

      const events = eventsRes.data || [];
      const jobs = jobsRes.data || [];
      const bounties = bountiesRes.data || [];

      setPendingCounts({
        events: {
          total: events.length,
          pending: events.filter(e => e.status === 'draft').length,
          live: events.filter(e => e.status === 'live').length,
        },
        jobs: {
          total: jobs.length,
          pending: jobs.filter(j => j.status === 'draft').length,
          live: jobs.filter(j => j.status === 'live').length,
        },
        bounties: {
          total: bounties.length,
          pending: bounties.filter(b => b.status === 'draft').length,
          live: bounties.filter(b => b.status === 'live').length,
        },
      });
    } catch (error) {
      console.error("Error fetching pending counts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPending = pendingCounts ? 
    pendingCounts.events.pending + pendingCounts.jobs.pending + pendingCounts.bounties.pending : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground mt-1">
            Moderate and manage all platform content
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
          <Button>
            <FileCheck className="h-4 w-4 mr-2" />
            Review Queue
            {totalPending > 0 && (
              <Badge variant="destructive" className="ml-2">{totalPending}</Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Events</span>
              <Calendar className="h-5 w-5 text-violet-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-bold">{isLoading ? "..." : pendingCounts?.events.total || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Live</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-600">
                  {isLoading ? "..." : pendingCounts?.events.live || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                  {isLoading ? "..." : pendingCounts?.events.pending || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Jobs</span>
              <Briefcase className="h-5 w-5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-bold">{isLoading ? "..." : pendingCounts?.jobs.total || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-600">
                  {isLoading ? "..." : pendingCounts?.jobs.live || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                  {isLoading ? "..." : pendingCounts?.jobs.pending || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Bounties</span>
              <Trophy className="h-5 w-5 text-amber-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-bold">{isLoading ? "..." : pendingCounts?.bounties.total || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-600">
                  {isLoading ? "..." : pendingCounts?.bounties.live || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                  {isLoading ? "..." : pendingCounts?.bounties.pending || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="events">
            <Calendar className="h-4 w-4 mr-2 hidden sm:inline" />
            Events
          </TabsTrigger>
          <TabsTrigger value="jobs">
            <Briefcase className="h-4 w-4 mr-2 hidden sm:inline" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="blogs">
            <FileText className="h-4 w-4 mr-2 hidden sm:inline" />
            Blogs
          </TabsTrigger>
          <TabsTrigger value="bounties">
            <Trophy className="h-4 w-4 mr-2 hidden sm:inline" />
            Bounties
          </TabsTrigger>
          <TabsTrigger value="scholarships">
            <GraduationCap className="h-4 w-4 mr-2 hidden sm:inline" />
            Scholarships
          </TabsTrigger>
          <TabsTrigger value="reels">
            <Play className="h-4 w-4 mr-2 hidden sm:inline" />
            Reels
          </TabsTrigger>
          <TabsTrigger value="pending">
            <FileCheck className="h-4 w-4 mr-2 hidden sm:inline" />
            Pending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Events Management</CardTitle>
              <CardDescription>Manage and moderate events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Events management interface coming soon</p>
                <p className="text-sm mt-2">Use existing AdminDashboard for now</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Jobs Management</CardTitle>
              <CardDescription>Manage and moderate job postings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Jobs management interface coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Review</CardTitle>
                  <CardDescription>Content waiting for approval</CardDescription>
                </div>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  <Clock className="h-3 w-3 mr-1" />
                  {totalPending} pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {totalPending === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-50 text-green-500" />
                  <p className="text-lg font-medium">All caught up!</p>
                  <p className="text-sm mt-2">No content pending review</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingCounts?.events.pending > 0 && (
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-medium">Events</p>
                          <p className="text-sm text-muted-foreground">{pendingCounts.events.pending} awaiting review</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  )}
                  {pendingCounts?.jobs.pending > 0 && (
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Jobs</p>
                          <p className="text-sm text-muted-foreground">{pendingCounts.jobs.pending} awaiting review</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  )}
                  {pendingCounts?.bounties.pending > 0 && (
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">Bounties</p>
                          <p className="text-sm text-muted-foreground">{pendingCounts.bounties.pending} awaiting review</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

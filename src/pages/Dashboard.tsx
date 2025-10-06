import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Zap, Award, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    await fetchUserData(session.user.id);
  };

  const fetchUserData = async (userId: string) => {
    try {
      const { data: submissionsData } = await supabase
        .from("bounty_submissions")
        .select(`
          *,
          bounties (
            title,
            prize_amount,
            category
          )
        `)
        .eq("user_id", userId)
        .order("submitted_at", { ascending: false });

      setSubmissions(submissionsData || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalSubmissions: submissions.length,
    approvedSubmissions: submissions.filter(s => s.status === "approved").length,
    pendingSubmissions: submissions.filter(s => s.status === "pending").length,
    totalEarnings: submissions
      .filter(s => s.status === "approved")
      .reduce((sum, s) => sum + (parseFloat(s.bounties?.prize_amount || 0)), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Student Dashboard
        </h1>
        <p className="text-muted-foreground">Track your progress and earnings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-[var(--shadow-hover)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-[var(--shadow-hover)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Trophy className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.approvedSubmissions}</div>
            <Progress value={(stats.approvedSubmissions / Math.max(stats.totalSubmissions, 1)) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-[var(--shadow-hover)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Zap className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-[var(--shadow-hover)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">From approved bounties</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="submissions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="submissions">My Submissions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-4">
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No submissions yet</p>
                <Button onClick={() => navigate("/bounties")}>Browse Bounties</Button>
              </CardContent>
            </Card>
          ) : (
            submissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-[var(--shadow-hover)] transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{submission.bounties?.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(submission.status)}>
                      {submission.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{submission.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-medium">₹{submission.bounties?.prize_amount}</span>
                    </div>
                    <Badge variant="outline">{submission.bounties?.category}</Badge>
                    {submission.score && (
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-accent" />
                        <span className="font-medium">{submission.score}/100</span>
                      </div>
                    )}
                  </div>
                  {submission.feedback && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Feedback:</p>
                      <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submissions.slice(0, 5).map((submission) => (
                  <div key={submission.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{submission.bounties?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(submission.status)} className="text-xs">
                      {submission.status}
                    </Badge>
                  </div>
                ))}
                {submissions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No activity yet. Start by submitting to bounties!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

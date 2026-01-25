import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Zap, Award, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
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
    setIsEmailVerified(!!session.user.email_confirmed_at);
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
      .reduce((sum, s) => {
        const bounty = Array.isArray(s.bounties) ? s.bounties[0] : s.bounties;
        const amount = bounty?.prize_amount || "0";
        return sum + parseFloat(amount.replace(/[^0-9.-]/g, '') || "0");
      }, 0),
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
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex justify-center py-12">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Email Verification Banner */}
      {!isEmailVerified && user?.email && (
        <div className="mb-4 sm:mb-6">
          <EmailVerificationBanner email={user.email} />
        </div>
      )}

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Student Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Track your progress and earnings</p>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        <Card className="hover:shadow-[var(--shadow-hover)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Submissions</CardTitle>
            <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-[var(--shadow-hover)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Approved</CardTitle>
            <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-accent">{stats.approvedSubmissions}</div>
            <Progress value={(stats.approvedSubmissions / Math.max(stats.totalSubmissions, 1)) * 100} className="mt-1.5 sm:mt-2 h-1.5 sm:h-2" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-[var(--shadow-hover)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-secondary" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-secondary">{stats.pendingSubmissions}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-[var(--shadow-hover)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">₹{stats.totalEarnings.toLocaleString()}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">From bounties</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="submissions" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex sm:w-[300px] lg:w-[400px]">
          <TabsTrigger value="submissions" className="text-xs sm:text-sm">My Submissions</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-3 sm:space-y-4">
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                <Award className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">No submissions yet</p>
                <Button onClick={() => navigate("/bounties")} size="sm" className="text-xs sm:text-sm">Browse Bounties</Button>
              </CardContent>
            </Card>
          ) : (
            submissions.map((submission) => {
              const bounty = Array.isArray(submission.bounties) ? submission.bounties[0] : submission.bounties;
              return (
                <Card key={submission.id} className="hover:shadow-[var(--shadow-hover)] transition-all">
                  <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm sm:text-lg mb-0.5 sm:mb-1 truncate">{bounty?.title || "Untitled Bounty"}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">Submitted {new Date(submission.submitted_at).toLocaleDateString()}</span>
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusColor(submission.status)} className="text-[10px] sm:text-xs flex-shrink-0">
                        {submission.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">{submission.description}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        <span className="font-medium">{bounty?.prize_amount || "N/A"}</span>
                      </div>
                      {bounty?.category && <Badge variant="outline" className="text-[10px] sm:text-xs">{bounty.category}</Badge>}
                      {submission.score && (
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
                          <span className="font-medium">{submission.score}/100</span>
                        </div>
                      )}
                    </div>
                    {submission.feedback && (
                      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-muted rounded-lg">
                        <p className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">Feedback:</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{submission.feedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="space-y-2 sm:space-y-4">
                {submissions.slice(0, 5).map((submission) => {
                  const bounty = Array.isArray(submission.bounties) ? submission.bounties[0] : submission.bounties;
                  return (
                    <div key={submission.id} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg bg-muted/50">
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium truncate">{bounty?.title || "Untitled Bounty"}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(submission.status)} className="text-[10px] sm:text-xs flex-shrink-0">
                        {submission.status}
                      </Badge>
                    </div>
                  );
                })}
                {submissions.length === 0 && (
                  <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
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

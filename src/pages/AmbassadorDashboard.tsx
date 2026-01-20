import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Gift, 
  TrendingUp, 
  Award, 
  Target,
  Star,
  Trophy,
  Calendar,
  CheckCircle,
  Clock,
  ClipboardList,
  PartyPopper,
  UserCheck,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { TaskBoard } from '@/components/ambassador/TaskBoard';
import { TeamManager } from '@/components/ambassador/TeamManager';

interface AmbassadorData {
  id: string;
  full_name: string;
  email: string;
  college: string;
  status: string;
  user_id: string;
  created_at: string;
}

interface AmbassadorPointsData {
  id: string;
  total_points: number;
  tasks_completed: number;
  team_size: number;
  rank: number;
  cycle_id: string;
}

interface ProgramCycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const AmbassadorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ambassador, setAmbassador] = useState<AmbassadorData | null>(null);
  const [points, setPoints] = useState<AmbassadorPointsData | null>(null);
  const [activeCycle, setActiveCycle] = useState<ProgramCycle | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAmbassadorData();
  }, []);

  const fetchAmbassadorData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // Fetch ambassador data
      const { data: ambassadorData, error: ambassadorError } = await supabase
        .from('campus_ambassadors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (ambassadorError) throw ambassadorError;

      if (!ambassadorData || ambassadorData.status !== 'approved') {
        toast.error('Access denied. Only approved ambassadors can view this dashboard.');
        navigate('/campus-ambassador');
        return;
      }

      setAmbassador(ambassadorData);

      // Fetch active program cycle
      const { data: cycleData } = await supabase
        .from('ambassador_program_cycles')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      setActiveCycle(cycleData);

      // Fetch ambassador points for active cycle
      if (cycleData) {
        const { data: pointsData } = await supabase
          .from('ambassador_points')
          .select('*')
          .eq('ambassador_id', ambassadorData.id)
          .eq('cycle_id', cycleData.id)
          .maybeSingle();

        setPoints(pointsData);

        // Fetch submissions
        const { data: submissionsData } = await supabase
          .from('ambassador_task_submissions')
          .select('*, ambassador_tasks(*)')
          .eq('ambassador_id', ambassadorData.id)
          .order('created_at', { ascending: false });

        setSubmissions(submissionsData || []);

        // Fetch team members
        const { data: teamData } = await supabase
          .from('ambassador_team_members')
          .select('*')
          .eq('ambassador_id', ambassadorData.id)
          .eq('cycle_id', cycleData.id);

        setTeamMembers(teamData || []);

        // Fetch leaderboard
        const { data: leaderboardData } = await supabase
          .from('ambassador_points')
          .select('*, campus_ambassadors(full_name, college)')
          .eq('cycle_id', cycleData.id)
          .order('total_points', { ascending: false })
          .limit(20);

        setLeaderboard(leaderboardData || []);

        // Fetch rewards
        const { data: rewardsData } = await supabase
          .from('ambassador_rewards')
          .select('*')
          .eq('is_active', true)
          .order('points_required', { ascending: true });

        setRewards(rewardsData || []);

        // Fetch events
        const { data: eventsData } = await supabase
          .from('ambassador_events')
          .select('*')
          .eq('cycle_id', cycleData.id)
          .eq('is_active', true)
          .order('event_date', { ascending: true });

        setEvents(eventsData || []);
      }

    } catch (error) {
      console.error('Error fetching ambassador data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate program progress
  const calculateProgramProgress = () => {
    if (!activeCycle) return 0;
    const start = new Date(activeCycle.start_date).getTime();
    const end = new Date(activeCycle.end_date).getTime();
    const now = Date.now();
    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!activeCycle) return 0;
    const end = new Date(activeCycle.end_date).getTime();
    const now = Date.now();
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  };

  // Get tier based on rank
  const getTier = () => {
    const rank = points?.rank || 999;
    if (rank <= 3) return { name: 'Diamond', color: 'bg-cyan-500', icon: '💎' };
    if (rank <= 10) return { name: 'Gold', color: 'bg-yellow-500', icon: '🥇' };
    if (rank <= 25) return { name: 'Silver', color: 'bg-gray-400', icon: '🥈' };
    return { name: 'Bronze', color: 'bg-amber-600', icon: '🥉' };
  };

  const tier = getTier();
  const coreTeamCount = teamMembers.filter(m => m.role === 'core_team').length;
  const volunteerCount = teamMembers.filter(m => m.role === 'volunteer').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Ambassador Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {ambassador?.full_name}! {activeCycle?.name || 'No active program'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${tier.color} text-white px-4 py-2 text-lg`}>
                <span className="mr-2">{tier.icon}</span>
                {tier.name} Ambassador
              </Badge>
              {points?.rank && (
                <Badge variant="outline" className="px-4 py-2 text-lg">
                  Rank #{points.rank}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Program Progress */}
        {activeCycle && (
          <Card className="mb-8 bg-gradient-to-r from-primary/5 via-background to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{activeCycle.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {new Date(activeCycle.start_date).toLocaleDateString()} - {new Date(activeCycle.end_date).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <Clock className="w-4 h-4 mr-2" />
                  {getDaysRemaining()} days remaining
                </Badge>
              </div>
              <Progress value={calculateProgramProgress()} className="h-3" />
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-3xl font-bold text-foreground">{points?.total_points || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tasks Completed</p>
                  <p className="text-3xl font-bold text-foreground">{points?.tasks_completed || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Size</p>
                  <p className="text-3xl font-bold text-foreground">{teamMembers.length}</p>
                  <p className="text-xs text-muted-foreground">{coreTeamCount} core + {volunteerCount} volunteers</p>
                </div>
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Submissions</p>
                  <p className="text-3xl font-bold text-foreground">
                    {submissions.filter(s => s.status === 'pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              <Target className="w-4 h-4 mr-1 hidden sm:block" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs sm:text-sm">
              <ClipboardList className="w-4 h-4 mr-1 hidden sm:block" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="submissions" className="text-xs sm:text-sm">
              <CheckCircle className="w-4 h-4 mr-1 hidden sm:block" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="team" className="text-xs sm:text-sm">
              <Users className="w-4 h-4 mr-1 hidden sm:block" />
              Team
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-xs sm:text-sm">
              <Trophy className="w-4 h-4 mr-1 hidden sm:block" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="rewards" className="text-xs sm:text-sm">
              <Gift className="w-4 h-4 mr-1 hidden sm:block" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="events" className="text-xs sm:text-sm">
              <PartyPopper className="w-4 h-4 mr-1 hidden sm:block" />
              Events
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Submissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Recent Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {submissions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No submissions yet. Complete your first task!</p>
                  ) : (
                    <div className="space-y-3">
                      {submissions.slice(0, 5).map((submission) => (
                        <div key={submission.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{submission.report_title}</p>
                            <p className="text-xs text-muted-foreground">
                              {submission.ambassador_tasks?.title} • {new Date(submission.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={
                            submission.status === 'approved' ? 'default' :
                            submission.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {submission.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Points to next reward</span>
                    <span className="font-semibold">
                      {rewards.find(r => r.points_required > (points?.total_points || 0))?.points_required - (points?.total_points || 0) || 'All unlocked!'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Approved submissions</span>
                    <span className="font-semibold">{submissions.filter(s => s.status === 'approved').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total points earned</span>
                    <span className="font-semibold">{submissions.filter(s => s.status === 'approved').reduce((acc, s) => acc + (s.points_awarded || 0), 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Available events</span>
                    <span className="font-semibold">{events.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            {ambassador && activeCycle && (
              <TaskBoard 
                ambassadorId={ambassador.id} 
                cycleId={activeCycle.id}
                onSubmissionComplete={fetchAmbassadorData}
              />
            )}
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>My Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                    <p className="text-muted-foreground mb-4">Complete tasks to earn points!</p>
                    <Button onClick={() => setActiveTab('tasks')}>View Tasks</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <div key={submission.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{submission.report_title}</h4>
                            <p className="text-sm text-muted-foreground">{submission.ambassador_tasks?.title}</p>
                          </div>
                          <Badge variant={
                            submission.status === 'approved' ? 'default' :
                            submission.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {submission.status}
                            {submission.status === 'approved' && ` (+${submission.points_awarded} pts)`}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{submission.report_content}</p>
                        {submission.admin_feedback && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <strong>Feedback:</strong> {submission.admin_feedback}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Submitted: {new Date(submission.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            {ambassador && activeCycle && (
              <TeamManager 
                ambassadorId={ambassador.id} 
                cycleId={activeCycle.id}
                onTeamUpdate={fetchAmbassadorData}
              />
            )}
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Ambassador Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div 
                      key={entry.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        entry.ambassador_id === ambassador?.id ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-yellow-950' :
                          index === 1 ? 'bg-gray-400 text-gray-900' :
                          index === 2 ? 'bg-amber-600 text-amber-950' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{entry.campus_ambassadors?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{entry.campus_ambassadors?.college}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{entry.total_points} pts</p>
                        <p className="text-xs text-muted-foreground">{entry.tasks_completed} tasks</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  Available Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {rewards.map((reward) => {
                    const isUnlocked = (points?.total_points || 0) >= reward.points_required;
                    const meetsRankRequirement = !reward.rank_required || (points?.rank || 999) <= reward.rank_required;
                    const canClaim = isUnlocked && meetsRankRequirement;
                    
                    return (
                      <div 
                        key={reward.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          canClaim ? 'bg-primary/5 border-primary/30' : 'bg-muted/50 border-border'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            canClaim ? 'bg-primary/20' : 'bg-muted'
                          }`}>
                            <Award className={`w-6 h-6 ${canClaim ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className={`font-medium ${canClaim ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {reward.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {reward.points_required} points
                              {reward.rank_required && ` • Top ${reward.rank_required} required`}
                            </p>
                            {reward.description && (
                              <p className="text-xs text-muted-foreground mt-1">{reward.description}</p>
                            )}
                          </div>
                        </div>
                        {canClaim ? (
                          <Button size="sm">Claim Reward</Button>
                        ) : (
                          <Badge variant="outline">
                            {!isUnlocked ? `${reward.points_required - (points?.total_points || 0)} more pts` : 
                             `Rank ${reward.rank_required} needed`}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PartyPopper className="w-5 h-5 text-primary" />
                  Ambassador Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
                    <p className="text-muted-foreground">Check back later for exciting ambassador events!</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {events.map((event) => {
                      const isEligible = (!event.eligible_min_points || (points?.total_points || 0) >= event.eligible_min_points) &&
                                        (!event.eligible_min_rank || (points?.rank || 999) <= event.eligible_min_rank);
                      
                      return (
                        <div key={event.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{event.event_type}</Badge>
                                {event.food_coupon_value && (
                                  <Badge className="bg-green-500">₹{event.food_coupon_value} Food Coupon</Badge>
                                )}
                              </div>
                              <h4 className="font-semibold text-lg">{event.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(event.event_date).toLocaleDateString()}
                                </span>
                                {event.location && <span>📍 {event.location}</span>}
                              </div>
                            </div>
                            <Button disabled={!isEligible}>
                              {isEligible ? 'Register' : 'Not Eligible'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ambassador Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your Ambassador Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">College</p>
                <p className="font-medium text-foreground">{ambassador?.college}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{ambassador?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium text-foreground">
                  {ambassador?.created_at ? new Date(ambassador.created_at).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="bg-green-500">{ambassador?.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AmbassadorDashboard;

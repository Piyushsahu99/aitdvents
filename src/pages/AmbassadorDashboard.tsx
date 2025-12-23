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
  Copy, 
  Share2, 
  Target,
  Star,
  Trophy,
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface AmbassadorData {
  id: string;
  full_name: string;
  email: string;
  college: string;
  status: string;
  created_at: string;
}

interface ReferralData {
  id: string;
  referral_code: string;
  status: string;
  created_at: string;
  converted_at: string | null;
}

interface PointsData {
  total_points: number;
  monthly_points: number;
  referrals_count: number;
  shares_count: number;
}

const AmbassadorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ambassador, setAmbassador] = useState<AmbassadorData | null>(null);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [points, setPoints] = useState<PointsData | null>(null);
  const [referralCode, setReferralCode] = useState('');

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

      // Fetch referrals
      const { data: referralData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      setReferrals(referralData || []);

      // Get or create referral code
      if (referralData && referralData.length > 0) {
        setReferralCode(referralData[0].referral_code);
      } else {
        const newCode = `AMB${user.id.slice(0, 8).toUpperCase()}`;
        setReferralCode(newCode);
      }

      // Fetch points
      const { data: pointsData } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setPoints(pointsData || {
        total_points: 0,
        monthly_points: 0,
        referrals_count: 0,
        shares_count: 0
      });

    } catch (error) {
      console.error('Error fetching ambassador data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied to clipboard!');
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied to clipboard!');
  };

  const successfulReferrals = referrals.filter(r => r.status === 'converted').length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
  const conversionRate = referrals.length > 0 ? (successfulReferrals / referrals.length) * 100 : 0;

  // Calculate tier based on successful referrals
  const getTier = () => {
    if (successfulReferrals >= 50) return { name: 'Diamond', color: 'bg-cyan-500', next: null, progress: 100 };
    if (successfulReferrals >= 25) return { name: 'Gold', color: 'bg-yellow-500', next: 50, progress: (successfulReferrals / 50) * 100 };
    if (successfulReferrals >= 10) return { name: 'Silver', color: 'bg-gray-400', next: 25, progress: (successfulReferrals / 25) * 100 };
    return { name: 'Bronze', color: 'bg-amber-600', next: 10, progress: (successfulReferrals / 10) * 100 };
  };

  const tier = getTier();

  const rewards = [
    { name: 'Welcome Goodies Kit', points: 100, claimed: (points?.total_points || 0) >= 100 },
    { name: 'Exclusive T-Shirt', points: 250, claimed: (points?.total_points || 0) >= 250 },
    { name: 'Premium Merchandise', points: 500, claimed: (points?.total_points || 0) >= 500 },
    { name: 'Tech Accessories', points: 1000, claimed: (points?.total_points || 0) >= 1000 },
    { name: 'Internship Referral', points: 2000, claimed: (points?.total_points || 0) >= 2000 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
                Welcome back, {ambassador?.full_name}! Track your performance and rewards.
              </p>
            </div>
            <Badge className={`${tier.color} text-white px-4 py-2 text-lg`}>
              <Trophy className="w-5 h-5 mr-2" />
              {tier.name} Ambassador
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  <p className="text-3xl font-bold text-foreground">{referrals.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Successful Referrals</p>
                  <p className="text-3xl font-bold text-foreground">{successfulReferrals}</p>
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
                  <p className="text-sm text-muted-foreground">Points Earned</p>
                  <p className="text-3xl font-bold text-foreground">{points?.total_points || 0}</p>
                </div>
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-3xl font-bold text-foreground">{conversionRate.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code Section */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 via-background to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Your Referral Code</h3>
                <p className="text-muted-foreground text-sm">Share this code to earn rewards for each successful referral</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-muted px-6 py-3 rounded-lg border-2 border-dashed border-primary/50">
                  <span className="text-2xl font-mono font-bold text-primary">{referralCode}</span>
                </div>
                <Button variant="outline" size="icon" onClick={copyReferralCode}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button onClick={copyReferralLink}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Link
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tier Progress */}
        {tier.next && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Progress to Next Tier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {successfulReferrals} / {tier.next} referrals
                  </span>
                  <span className="text-foreground font-medium">
                    {tier.next - successfulReferrals} more to go
                  </span>
                </div>
                <Progress value={tier.progress} className="h-3" />
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="referrals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>Your Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No referrals yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Share your referral code to start earning rewards!
                    </p>
                    <Button onClick={copyReferralLink}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Your Link
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {referrals.map((referral) => (
                      <div 
                        key={referral.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            referral.status === 'converted' ? 'bg-green-500/20' : 'bg-amber-500/20'
                          }`}>
                            {referral.status === 'converted' ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Clock className="w-5 h-5 text-amber-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              Referral #{referral.id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(referral.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={referral.status === 'converted' ? 'default' : 'secondary'}>
                          {referral.status === 'converted' ? 'Converted' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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
                  {rewards.map((reward, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        reward.claimed 
                          ? 'bg-primary/5 border-primary/30' 
                          : 'bg-muted/50 border-border'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          reward.claimed ? 'bg-primary/20' : 'bg-muted'
                        }`}>
                          <Award className={`w-6 h-6 ${reward.claimed ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <p className={`font-medium ${reward.claimed ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {reward.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{reward.points} points required</p>
                        </div>
                      </div>
                      {reward.claimed ? (
                        <Badge className="bg-primary">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Unlocked
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          {reward.points - (points?.total_points || 0)} more points
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Ambassador Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon!</h3>
                  <p className="text-muted-foreground">
                    Compete with other ambassadors and see your ranking.
                  </p>
                </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">College</p>
                <p className="font-medium text-foreground">{ambassador?.college}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {ambassador?.created_at && new Date(ambassador.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="bg-green-500 mt-1">Approved</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AmbassadorDashboard;

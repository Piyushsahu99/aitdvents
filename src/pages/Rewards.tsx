import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Coins, Gift, Trophy, Flame, Star, ShoppingBag, CreditCard, Wrench,
  Calendar, TrendingUp, Award, Target, ChevronRight, Sparkles, Lock,
  CheckCircle, Clock, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGamification } from "@/hooks/useGamification";
import React from "react";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  merchandise: ShoppingBag,
  gift_card: CreditCard,
  service: Wrench,
};

const CATEGORY_LABELS: Record<string, string> = {
  merchandise: "Merchandise",
  gift_card: "Gift Cards",
  service: "Services",
};

const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, name: "Newcomer" },
  { level: 5, xp: 500, name: "Explorer" },
  { level: 10, xp: 1500, name: "Contributor" },
  { level: 15, xp: 3000, name: "Rising Star" },
  { level: 20, xp: 5000, name: "Champion" },
  { level: 25, xp: 8000, name: "Expert" },
  { level: 30, xp: 12000, name: "Master" },
  { level: 40, xp: 20000, name: "Legend" },
  { level: 50, xp: 35000, name: "Icon" },
];

const getLevelInfo = (xp: number) => {
  let currentLevel = LEVEL_THRESHOLDS[0];
  let nextLevel = LEVEL_THRESHOLDS[1];

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      currentLevel = LEVEL_THRESHOLDS[i];
      nextLevel = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i];
    }
  }

  const xpProgress = xp - currentLevel.xp;
  const xpNeeded = nextLevel.xp - currentLevel.xp;
  const progressPercent = xpNeeded > 0 ? (xpProgress / xpNeeded) * 100 : 100;

  return {
    level: currentLevel.level,
    name: currentLevel.name,
    nextLevel: nextLevel.level,
    nextName: nextLevel.name,
    progressPercent: Math.min(progressPercent, 100),
    xpToNext: nextLevel.xp - xp,
  };
};

const EARN_ACTIONS = [
  { action: "Complete your profile", coins: 15, icon: CheckCircle, link: "/profile" },
  { action: "Submit an event", coins: 20, icon: Calendar, link: "/events" },
  { action: "Complete a bounty", coins: 50, icon: Target, link: "/bounties" },
  { action: "Refer a friend", coins: 25, icon: Sparkles, link: "/profile" },
  { action: "Daily login streak", coins: "2-50", icon: Flame, link: "/" },
];

export default function Rewards() {
  const navigate = useNavigate();
  const { 
    points, 
    achievements, 
    userAchievements, 
    transactions, 
    rewards, 
    loading, 
    userId,
    redeemReward,
    getUnlockedAchievementIds,
    getAchievementProgress,
  } = useGamification();
  
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [redeeming, setRedeeming] = useState(false);

  const unlockedIds = getUnlockedAchievementIds();
  const levelInfo = getLevelInfo(points?.xp || 0);

  const handleRedeem = async () => {
    if (!selectedReward) return;
    setRedeeming(true);
    const success = await redeemReward(selectedReward.id);
    setRedeeming(false);
    if (success) setSelectedReward(null);
  };

  const canAfford = (cost: number) => (points?.total_points || 0) >= cost;

  // Group rewards by category
  const rewardsByCategory = rewards.reduce((acc, reward) => {
    if (!acc[reward.category]) acc[reward.category] = [];
    acc[reward.category].push(reward);
    return acc;
  }, {} as Record<string, typeof rewards>);

  // Group achievements by category
  const achievementsByCategory = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) acc[achievement.category] = [];
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, typeof achievements>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl" />
          <Coins className="h-20 w-20 text-yellow-500 relative" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Earn & Redeem Rewards</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Join AITD to start earning coins through daily activities, completing bounties, and more!
        </p>
        <Link to="/auth">
          <Button size="lg" className="rounded-xl">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="relative py-12 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left - Balance & Level */}
              <div className="space-y-6">
                <Badge variant="secondary" className="text-sm">
                  <Trophy className="h-3 w-3 mr-1" />
                  Level {levelInfo.level} • {levelInfo.name}
                </Badge>
                
                <h1 className="text-4xl lg:text-5xl font-bold">
                  Your AITD Coins
                </h1>
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400/40 rounded-full blur-lg animate-pulse" />
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center relative shadow-xl">
                      <Coins className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-5xl lg:text-6xl font-bold">
                      {points?.total_points?.toLocaleString() || 0}
                    </p>
                    <p className="text-muted-foreground">Available Coins</p>
                  </div>
                </div>

                {/* Level Progress */}
                <Card className="bg-card/50 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Level Progress</span>
                      <span className="text-xs text-muted-foreground">
                        {levelInfo.xpToNext} XP to Level {levelInfo.nextLevel}
                      </span>
                    </div>
                    <Progress value={levelInfo.progressPercent} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Next: {levelInfo.nextName}
                    </p>
                  </CardContent>
                </Card>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-card/50 backdrop-blur">
                    <CardContent className="p-4 text-center">
                      <Flame className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{points?.daily_login_streak || 0}</p>
                      <p className="text-xs text-muted-foreground">Day Streak</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 backdrop-blur">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{points?.lifetime_points?.toLocaleString() || 0}</p>
                      <p className="text-xs text-muted-foreground">Lifetime</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 backdrop-blur">
                    <CardContent className="p-4 text-center">
                      <Award className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold">{userAchievements.length}</p>
                      <p className="text-xs text-muted-foreground">Achievements</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right - Quick Earn */}
              <Card className="bg-card/50 backdrop-blur border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Quick Ways to Earn
                  </CardTitle>
                  <CardDescription>Complete actions to earn more coins</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {EARN_ACTIONS.map((action, idx) => {
                    const Icon = action.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => navigate(action.link)}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium">{action.action}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
                            <Coins className="h-3 w-3 mr-1" />
                            +{action.coins}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-4 pb-20">
          <Tabs defaultValue="rewards" className="space-y-8">
            <TabsList className="w-full max-w-lg mx-auto grid grid-cols-3 h-12">
              <TabsTrigger value="rewards" className="text-sm">
                <Gift className="h-4 w-4 mr-2" />
                Rewards
              </TabsTrigger>
              <TabsTrigger value="achievements" className="text-sm">
                <Trophy className="h-4 w-4 mr-2" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="history" className="text-sm">
                <Clock className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Rewards Tab */}
            <TabsContent value="rewards" className="space-y-8">
              {/* Featured Rewards */}
              {rewards.some(r => r.is_featured) && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-500" />
                    Featured Rewards
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {rewards.filter(r => r.is_featured).map((reward) => {
                      const affordable = canAfford(reward.points_cost);
                      const CategoryIcon = CATEGORY_ICONS[reward.category] || Gift;
                      return (
                        <Card 
                          key={reward.id} 
                          className={`relative overflow-hidden transition-all hover:shadow-lg cursor-pointer group ${
                            affordable ? 'border-primary/30' : 'opacity-75'
                          }`}
                          onClick={() => setSelectedReward(reward)}
                        >
                          <div className="absolute top-2 right-2 z-10">
                            <Badge className="bg-yellow-500 text-white">Featured</Badge>
                          </div>
                          <CardContent className="p-4">
                            <div className="h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg mb-4 flex items-center justify-center">
                              <CategoryIcon className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                              {reward.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {reward.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
                                <Coins className="h-3 w-3 mr-1" />
                                {reward.points_cost}
                              </Badge>
                              {!affordable && <Lock className="h-4 w-4 text-muted-foreground" />}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Rewards by Category */}
              {Object.entries(rewardsByCategory).map(([category, categoryRewards]) => {
                const Icon = CATEGORY_ICONS[category] || Gift;
                return (
                  <div key={category}>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {CATEGORY_LABELS[category] || category}
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {categoryRewards.map((reward) => {
                        const affordable = canAfford(reward.points_cost);
                        const coinsNeeded = reward.points_cost - (points?.total_points || 0);
                        return (
                          <Card 
                            key={reward.id} 
                            className={`relative overflow-hidden transition-all hover:shadow-md cursor-pointer ${
                              affordable ? '' : 'opacity-60'
                            }`}
                            onClick={() => setSelectedReward(reward)}
                          >
                            <CardContent className="p-4">
                              <div className="h-20 bg-muted rounded-lg mb-3 flex items-center justify-center">
                                <Icon className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <h3 className="font-medium mb-1">{reward.name}</h3>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline">
                                  <Coins className="h-3 w-3 mr-1" />
                                  {reward.points_cost}
                                </Badge>
                                {!affordable && (
                                  <span className="text-xs text-muted-foreground">
                                    {coinsNeeded} more needed
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-8">
              {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
                <div key={category}>
                  <h2 className="text-xl font-bold mb-4 capitalize">
                    {category.replace('_', ' ')}
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryAchievements.map((achievement) => {
                      const isUnlocked = unlockedIds.includes(achievement.id);
                      const progress = getAchievementProgress(achievement);
                      return (
                        <Card 
                          key={achievement.id} 
                          className={`relative ${isUnlocked ? 'border-primary/50 bg-primary/5' : ''}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                isUnlocked 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {isUnlocked ? (
                                  <CheckCircle className="h-6 w-6" />
                                ) : (
                                  <Lock className="h-5 w-5" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold">{achievement.name}</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {achievement.description}
                                </p>
                                {!isUnlocked && (
                                  <Progress value={progress} className="h-2" />
                                )}
                                <Badge 
                                  variant={isUnlocked ? "default" : "secondary"} 
                                  className="mt-2"
                                >
                                  <Coins className="h-3 w-3 mr-1" />
                                  +{achievement.points_reward}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Your recent coin earnings and spendings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {transactions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No transactions yet. Start earning coins!
                        </p>
                      ) : (
                        transactions.map((tx) => (
                          <div 
                            key={tx.id} 
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                tx.amount > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                              }`}>
                                {tx.amount > 0 ? (
                                  <TrendingUp className="h-5 w-5 text-green-500" />
                                ) : (
                                  <Gift className="h-5 w-5 text-red-500" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{tx.description || tx.action_type}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(tx.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {tx.amount > 0 ? '+' : ''}{tx.amount}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      {/* Redeem Dialog */}
      <Dialog open={!!selectedReward} onOpenChange={(open) => !open && setSelectedReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem Reward</DialogTitle>
            <DialogDescription>
              {selectedReward?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-muted-foreground mb-4">{selectedReward?.description}</p>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <span>Cost</span>
              <Badge variant="secondary" className="text-lg">
                <Coins className="h-4 w-4 mr-2" />
                {selectedReward?.points_cost}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted mt-2">
              <span>Your Balance</span>
              <span className="font-bold">{points?.total_points || 0} coins</span>
            </div>
            
            {selectedReward && !canAfford(selectedReward.points_cost) && (
              <p className="text-red-500 text-sm mt-4">
                You need {selectedReward.points_cost - (points?.total_points || 0)} more coins to redeem this reward.
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReward(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRedeem} 
              disabled={!selectedReward || !canAfford(selectedReward.points_cost) || redeeming}
            >
              {redeeming ? "Redeeming..." : "Confirm Redemption"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

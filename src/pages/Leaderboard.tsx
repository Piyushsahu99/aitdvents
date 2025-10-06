import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("bounty_submissions")
        .select(`
          user_id,
          status,
          score,
          bounties (
            prize_amount
          )
        `)
        .eq("status", "approved");

      if (error) throw error;

      // Aggregate data by user
      const userStats = data?.reduce((acc: any, submission: any) => {
        const userId = submission.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            totalSubmissions: 0,
            totalEarnings: 0,
            averageScore: 0,
            scores: [],
          };
        }
        acc[userId].totalSubmissions += 1;
        acc[userId].totalEarnings += parseFloat(submission.bounties?.prize_amount || 0);
        if (submission.score) {
          acc[userId].scores.push(submission.score);
        }
        return acc;
      }, {});

      // Calculate average scores and sort
      const leaderboardData = Object.values(userStats || {}).map((user: any) => {
        const avgScore = user.scores.length > 0
          ? user.scores.reduce((a: number, b: number) => a + b, 0) / user.scores.length
          : 0;
        return {
          ...user,
          averageScore: Math.round(avgScore),
          initials: `U${user.user_id.substring(0, 2).toUpperCase()}`,
        };
      });

      setLeaders(leaderboardData.sort((a, b) => b.totalEarnings - a.totalEarnings));
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return "gold";
    if (index === 1) return "silver";
    if (index === 2) return "bronze";
    return "default";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="text-muted-foreground">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <p className="text-muted-foreground">Top performing students on the platform</p>
      </div>

      <Tabs defaultValue="earnings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="earnings">Top Earners</TabsTrigger>
          <TabsTrigger value="performance">Best Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="space-y-4">
          {leaders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No submissions yet. Be the first!</p>
              </CardContent>
            </Card>
          ) : (
            leaders.map((leader, index) => (
              <Card
                key={leader.user_id}
                className={`hover:shadow-[var(--shadow-hover)] transition-all ${
                  index < 3 ? "border-2 border-primary/20" : ""
                }`}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex-shrink-0 w-12 flex items-center justify-center">
                    {getRankIcon(index)}
                  </div>

                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                      {leader.initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">Student #{leader.user_id.substring(0, 8)}</h3>
                      {index < 3 && (
                        <Badge variant={getRankBadge(index) as any} className="capitalize">
                          {getRankBadge(index)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span>{leader.totalSubmissions} submissions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-accent" />
                        <span>Avg Score: {leader.averageScore}/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      ₹{leader.totalEarnings.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Earnings</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {leaders
            .sort((a, b) => b.averageScore - a.averageScore)
            .map((leader, index) => (
              <Card
                key={leader.user_id}
                className={`hover:shadow-[var(--shadow-hover)] transition-all ${
                  index < 3 ? "border-2 border-accent/20" : ""
                }`}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex-shrink-0 w-12 flex items-center justify-center">
                    {getRankIcon(index)}
                  </div>

                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-accent to-secondary text-white">
                      {leader.initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">Student #{leader.user_id.substring(0, 8)}</h3>
                      {index < 3 && (
                        <Badge variant="outline" className="capitalize">
                          Top Performer
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span>{leader.totalSubmissions} submissions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-accent" />
                        <span>₹{leader.totalEarnings.toLocaleString()} earned</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-accent">
                      {leader.averageScore}/100
                    </div>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

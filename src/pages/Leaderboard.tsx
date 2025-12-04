import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp, Users, GraduationCap, Gift, Crown, Star, Sparkles, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeaderboardEntry {
  id: string;
  user_id: string;
  total_points: number;
  monthly_points: number;
  shares_count: number;
  referrals_count: number;
  bounties_completed: number;
  courses_completed: number;
  profile?: {
    full_name: string;
    college: string | null;
    avatar_url: string | null;
    skills: string[] | null;
    is_looking_for_team: boolean | null;
  };
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Fetch user points
      const { data: pointsData, error: pointsError } = await supabase
        .from("user_points")
        .select("*")
        .order("total_points", { ascending: false });

      if (pointsError) throw pointsError;

      // Fetch profiles for users with points
      const userIds = (pointsData || []).map(p => p.user_id);
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("student_profiles")
          .select("user_id, full_name, college, avatar_url, skills, is_looking_for_team")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
        
        const entriesWithProfiles = (pointsData || []).map(entry => ({
          ...entry,
          profile: profileMap.get(entry.user_id) || null,
        })).filter(e => e.profile); // Only show entries with profiles

        setEntries(entriesWithProfiles);
      } else {
        // Fallback to student profiles if no points data
        const { data: fallbackProfiles, error } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("is_public", true)
          .order("created_at", { ascending: true });

        if (!error && fallbackProfiles) {
          const fallbackEntries = fallbackProfiles.map((p, index) => ({
            id: p.id,
            user_id: p.user_id,
            total_points: 100 - index * 5, // Mock points based on join order
            monthly_points: Math.floor(Math.random() * 50),
            shares_count: 0,
            referrals_count: 0,
            bounties_completed: 0,
            courses_completed: 0,
            profile: {
              full_name: p.full_name,
              college: p.college,
              avatar_url: p.avatar_url,
              skills: p.skills,
              is_looking_for_team: p.is_looking_for_team,
            },
          }));
          setEntries(fallbackEntries);
        }
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="relative">
            <Crown className="h-7 w-7 text-yellow-500" />
            <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
        );
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground w-6 text-center">#{index + 1}</span>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCardStyle = (index: number) => {
    switch (index) {
      case 0:
        return "border-2 border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-transparent shadow-lg shadow-yellow-500/10";
      case 1:
        return "border-2 border-gray-400/50 bg-gradient-to-r from-gray-400/10 via-gray-300/5 to-transparent";
      case 2:
        return "border-2 border-amber-600/50 bg-gradient-to-r from-amber-600/10 via-orange-500/5 to-transparent";
      default:
        return "";
    }
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
        <p className="text-muted-foreground">Top performers on the platform - Earn points by sharing, referring, and completing tasks!</p>
      </div>

      {/* Merchandise Reward Banner */}
      <Card className="mb-8 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-primary/30 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Gift className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold">🏆 Monthly Merchandise Giveaway!</h2>
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                  <Star className="h-3 w-3 mr-1" />
                  Limited
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">
                Top 3 performers each month win exclusive <span className="font-semibold text-primary">AITD Events merchandise</span>! 
                Earn points by sharing your certificate, referring friends, and being active on the platform.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400">
                  <Crown className="h-3 w-3 mr-1" />
                  1st: Premium Hoodie + Stickers
                </Badge>
                <Badge variant="outline" className="bg-gray-400/10 border-gray-400/30">
                  <Medal className="h-3 w-3 mr-1" />
                  2nd: T-Shirt + Stickers
                </Badge>
                <Badge variant="outline" className="bg-amber-600/10 border-amber-600/30 text-amber-700 dark:text-amber-400">
                  <Award className="h-3 w-3 mr-1" />
                  3rd: Stickers Pack
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Earn Points */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            How to Earn Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-primary/5">
              <p className="text-2xl font-bold text-primary">+10</p>
              <p className="text-sm text-muted-foreground">Share Certificate</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-500/5">
              <p className="text-2xl font-bold text-green-500">+25</p>
              <p className="text-sm text-muted-foreground">Successful Referral</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-500/5">
              <p className="text-2xl font-bold text-orange-500">+50</p>
              <p className="text-sm text-muted-foreground">Complete Bounty</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-500/5">
              <p className="text-2xl font-bold text-blue-500">+20</p>
              <p className="text-sm text-muted-foreground">Complete Course</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="all">
            <Trophy className="h-4 w-4 mr-2" />
            All Time
          </TabsTrigger>
          <TabsTrigger value="team">
            <TrendingUp className="h-4 w-4 mr-2" />
            Looking for Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {entries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No students yet. Be the first to join!</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Top 3 Highlight */}
              {entries.length >= 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {entries.slice(0, 3).map((entry, index) => (
                    <Card key={entry.id} className={`text-center p-6 ${getCardStyle(index)}`}>
                      <div className="flex justify-center mb-3">
                        {getRankIcon(index)}
                      </div>
                      <Avatar className="h-16 w-16 mx-auto mb-3 border-4 border-primary/20">
                        <AvatarImage src={entry.profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold text-lg">
                          {getInitials(entry.profile?.full_name || "?")}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold mb-1">{entry.profile?.full_name}</h3>
                      {entry.profile?.college && (
                        <p className="text-sm text-muted-foreground truncate">{entry.profile.college}</p>
                      )}
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold text-lg">{entry.total_points}</span>
                        <span className="text-sm text-muted-foreground">pts</span>
                      </div>
                      <Badge className="mt-3" variant="secondary">
                        {index === 0 ? "🏆 Champion" : index === 1 ? "🥈 Runner-up" : "🥉 3rd Place"}
                      </Badge>
                    </Card>
                  ))}
                </div>
              )}

              {/* Full List */}
              {entries.map((entry, index) => (
                <Card
                  key={entry.id}
                  className={`hover:shadow-lg transition-all ${getCardStyle(index)}`}
                >
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex-shrink-0 w-10 flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>

                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src={entry.profile?.avatar_url || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                        {getInitials(entry.profile?.full_name || "?")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{entry.profile?.full_name}</h3>
                        {index < 3 && (
                          <Badge variant="secondary" className="text-xs">
                            {index === 0 ? "🏆 Champion" : index === 1 ? "🥈 Runner-up" : "🥉 3rd Place"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {entry.profile?.college && (
                          <div className="flex items-center gap-1 truncate">
                            <GraduationCap className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{entry.profile.college}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Points Display */}
                    <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold">{entry.total_points}</span>
                      <span className="text-sm text-muted-foreground">pts</span>
                    </div>

                    {entry.profile?.skills && entry.profile.skills.length > 0 && (
                      <div className="hidden md:flex gap-2">
                        {entry.profile.skills.slice(0, 2).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {entry.profile.skills.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{entry.profile.skills.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {index < 3 && (
                      <Badge className="hidden sm:flex bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30">
                        <Gift className="h-3 w-3 mr-1" />
                        Wins Merch!
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          {entries.filter(e => e.profile?.is_looking_for_team).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No students looking for a team right now</p>
              </CardContent>
            </Card>
          ) : (
            entries
              .filter(e => e.profile?.is_looking_for_team)
              .map((entry, index) => (
                <Card key={entry.id} className="hover:shadow-lg transition-all">
                  <CardContent className="flex items-center gap-4 p-6">
                    <Avatar className="h-12 w-12 border-2 border-accent/20">
                      <AvatarImage src={entry.profile?.avatar_url || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-accent to-primary text-white font-bold">
                        {getInitials(entry.profile?.full_name || "?")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{entry.profile?.full_name}</h3>
                        <Badge className="bg-success/10 text-success border-success/20 text-xs">
                          Looking for Team
                        </Badge>
                      </div>
                      {entry.profile?.college && (
                        <p className="text-sm text-muted-foreground truncate">{entry.profile.college}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold">{entry.total_points}</span>
                      <span className="text-sm text-muted-foreground">pts</span>
                    </div>

                    {entry.profile?.skills && entry.profile.skills.length > 0 && (
                      <div className="hidden md:flex gap-2">
                        {entry.profile.skills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
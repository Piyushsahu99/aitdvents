import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award, Coins, TrendingUp, Crown, RefreshCw } from "lucide-react";

interface LeaderboardUser {
  user_id: string;
  total_points: number;
  lifetime_points: number;
  level: number;
  full_name: string;
  avatar_url: string | null;
  college: string | null;
}

export function ContributorLeaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      
      // Fetch top users by lifetime points
      const { data: pointsData, error: pointsError } = await supabase
        .from("user_points")
        .select("user_id, total_points, lifetime_points, level")
        .order("lifetime_points", { ascending: false })
        .limit(10);

      if (pointsError) throw pointsError;

      if (!pointsData || pointsData.length === 0) {
        setLeaders([]);
        return;
      }

      // Fetch profiles for these users
      const userIds = pointsData.map((p) => p.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("student_profiles")
        .select("user_id, full_name, avatar_url, college")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Combine data
      const combined = pointsData.map((points) => {
        const profile = profilesData?.find((p) => p.user_id === points.user_id);
        return {
          user_id: points.user_id,
          total_points: points.total_points || 0,
          lifetime_points: points.lifetime_points || 0,
          level: points.level || 1,
          full_name: profile?.full_name || "Anonymous",
          avatar_url: profile?.avatar_url || null,
          college: profile?.college || null,
        };
      });

      setLeaders(combined);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Real-time subscription for user_points changes
  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_points',
        },
        () => {
          // Refresh leaderboard when points change
          fetchLeaderboard(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeaderboard]);

  // Periodic refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard(true);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  const formatLastUpdated = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    
    if (diff < 5) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastUpdated.toLocaleTimeString();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30";
      case 2:
        return "bg-gradient-to-r from-gray-300/10 to-gray-400/10 border-gray-400/30";
      case 3:
        return "bg-gradient-to-r from-amber-600/10 to-orange-500/10 border-amber-600/30";
      default:
        return "bg-card hover:bg-muted/50";
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (leaders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No contributors yet</p>
            <p className="text-sm">Be the first to earn coins!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Top Contributors
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-normal">
              {formatLastUpdated()}
            </span>
            <button
              onClick={() => fetchLeaderboard(true)}
              disabled={isRefreshing}
              className="p-1 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
              title="Refresh leaderboard"
            >
              <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <Badge variant="secondary">
              <Coins className="h-3 w-3 mr-1" />
              Lifetime
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {leaders.map((user, index) => (
            <div
              key={user.user_id}
              className={`flex items-center gap-3 p-4 transition-colors ${getRankBg(index + 1)}`}
            >
              <div className="flex items-center justify-center w-8">
                {getRankIcon(index + 1)}
              </div>

              <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                <AvatarImage src={user.avatar_url || undefined} alt={user.full_name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.full_name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {user.college && (
                    <span className="truncate max-w-[150px]">{user.college}</span>
                  )}
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    Lv. {user.level}
                  </Badge>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 font-bold text-primary">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  {user.lifetime_points.toLocaleString()}
                </div>
                <p className="text-[10px] text-muted-foreground">coins earned</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

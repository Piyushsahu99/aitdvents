import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Coins, Flame, Trophy, TrendingUp, Gift, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UserPoints {
  total_points: number;
  lifetime_points: number;
  daily_login_streak: number;
  level: number;
  xp: number;
}

interface DailyLoginResult {
  streak: number;
  points_earned: number;
  is_new_day: boolean;
}

// Level thresholds
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

  const xpForCurrentLevel = currentLevel.xp;
  const xpForNextLevel = nextLevel.xp;
  const xpProgress = xp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = xpNeeded > 0 ? (xpProgress / xpNeeded) * 100 : 100;

  return {
    level: currentLevel.level,
    name: currentLevel.name,
    nextLevel: nextLevel.level,
    progressPercent: Math.min(progressPercent, 100),
    xpToNext: xpForNextLevel - xp,
  };
};

export const PointsWidget = () => {
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      // Check daily login
      const { data: loginResult, error: loginError } = await supabase
        .rpc('check_daily_login', { p_user_id: session.user.id });

      if (loginError) {
        console.error("Daily login check error:", loginError);
      } else if (loginResult) {
        const result = loginResult as unknown as DailyLoginResult;
        if (result.is_new_day && result.points_earned > 0) {
          setEarnedPoints(result.points_earned);
          setShowCoinAnimation(true);
          toast({
            title: `🔥 Day ${result.streak} Streak!`,
            description: `You earned ${result.points_earned} AITD Coins!`,
          });
          setTimeout(() => setShowCoinAnimation(false), 3000);
        }
      }

      // Fetch user points
      const { data, error } = await supabase
        .from("user_points")
        .select("total_points, lifetime_points, daily_login_streak, level, xp")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) throw error;
      
      setPoints(data || {
        total_points: 0,
        lifetime_points: 0,
        daily_login_streak: 0,
        level: 1,
        xp: 0,
      });
    } catch (error) {
      console.error("Error fetching points:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-9 w-20 bg-muted/50 animate-pulse rounded-xl" />
    );
  }

  if (!points) {
    return null;
  }

  const levelInfo = getLevelInfo(points.xp || 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="relative px-3 py-2 h-9 rounded-xl hover:bg-primary/10 group"
        >
          {/* Coin Animation */}
          {showCoinAnimation && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 animate-bounce">
              <span className="text-xs font-bold text-primary">+{earnedPoints}</span>
            </div>
          )}
          
          {/* Coin Icon with glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-md group-hover:bg-yellow-400/50 transition-all" />
            <Coins className="h-5 w-5 text-yellow-500 relative z-10 group-hover:scale-110 transition-transform" />
          </div>
          
          {/* Points Display */}
          <span className="ml-2 font-bold text-foreground group-hover:text-primary transition-colors">
            {points.total_points?.toLocaleString() || 0}
          </span>
          
          {/* Streak Badge */}
          {(points.daily_login_streak || 0) >= 3 && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs bg-orange-500/20 text-orange-500 border-orange-500/30">
              <Flame className="h-3 w-3 mr-0.5" />
              {points.daily_login_streak}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-72 p-0" align="end">
        <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-b">
          {/* Balance */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-sm" />
                <Coins className="h-6 w-6 text-yellow-500 relative" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">AITD Coins</p>
                <p className="text-xl font-bold">{points.total_points?.toLocaleString() || 0}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-background">
              <Trophy className="h-3 w-3 mr-1" />
              Lvl {levelInfo.level}
            </Badge>
          </div>
          
          {/* Level Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{levelInfo.name}</span>
              <span className="text-muted-foreground">{levelInfo.xpToNext} XP to Lvl {levelInfo.nextLevel}</span>
            </div>
            <Progress value={levelInfo.progressPercent} className="h-2" />
          </div>
        </div>
        
        <div className="p-3 space-y-2">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Flame className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="text-sm font-semibold">{points.daily_login_streak || 0} days</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Lifetime</p>
                <p className="text-sm font-semibold">{points.lifetime_points?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="pt-2 space-y-1">
            <Link to="/rewards">
              <Button variant="ghost" className="w-full justify-between h-9 text-sm">
                <span className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  Redeem Rewards
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/bounties">
              <Button variant="ghost" className="w-full justify-between h-9 text-sm">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Earn More Coins
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

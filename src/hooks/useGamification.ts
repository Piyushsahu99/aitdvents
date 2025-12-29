import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UserPoints {
  total_points: number;
  lifetime_points: number;
  daily_login_streak: number;
  level: number;
  xp: number;
  bounties_completed: number;
  courses_completed: number;
  referrals_count: number;
  events_submitted: number;
  reels_uploaded: number;
  study_materials_uploaded: number;
  profile_completeness: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
  is_active: boolean;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

interface Transaction {
  id: string;
  amount: number;
  action_type: string;
  description: string;
  created_at: string;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  category: string;
  type: string;
  image_url: string | null;
  stock_quantity: number | null;
  is_featured: boolean;
}

export const useGamification = () => {
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }
      
      setUserId(session.user.id);

      // Fetch all data in parallel
      const [pointsRes, achievementsRes, userAchievementsRes, transactionsRes, rewardsRes] = await Promise.all([
        supabase
          .from("user_points")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle(),
        supabase
          .from("achievements")
          .select("*")
          .eq("is_active", true)
          .order("category"),
        supabase
          .from("user_achievements")
          .select("*, achievement:achievements(*)")
          .eq("user_id", session.user.id),
        supabase
          .from("points_transactions")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("rewards_catalog")
          .select("*")
          .eq("is_active", true)
          .order("points_cost"),
      ]);

      if (pointsRes.data) setPoints(pointsRes.data);
      if (achievementsRes.data) setAchievements(achievementsRes.data);
      if (userAchievementsRes.data) setUserAchievements(userAchievementsRes.data);
      if (transactionsRes.data) setTransactions(transactionsRes.data);
      if (rewardsRes.data) setRewards(rewardsRes.data);
    } catch (error) {
      console.error("Error fetching gamification data:", error);
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (rewardId: string) => {
    if (!userId) {
      toast({
        title: "Please login",
        description: "You need to be logged in to redeem rewards.",
        variant: "destructive",
      });
      return false;
    }

    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return false;

    if (!points || points.total_points < reward.points_cost) {
      toast({
        title: "Insufficient coins",
        description: `You need ${reward.points_cost - (points?.total_points || 0)} more coins.`,
        variant: "destructive",
      });
      return false;
    }

    try {
      // Spend points
      const { data: success, error: spendError } = await supabase
        .rpc('spend_points', {
          p_user_id: userId,
          p_amount: reward.points_cost,
          p_action_type: 'redemption',
          p_description: `Redeemed: ${reward.name}`,
          p_reference_id: reward.id,
        });

      if (spendError) throw spendError;
      if (!success) {
        toast({
          title: "Redemption failed",
          description: "Insufficient coins or an error occurred.",
          variant: "destructive",
        });
        return false;
      }

      // Create redemption record
      const { error: redemptionError } = await supabase
        .from("reward_redemptions")
        .insert({
          user_id: userId,
          reward_name: reward.name,
          reward_description: reward.description,
          points_spent: reward.points_cost,
          status: "pending",
        });

      if (redemptionError) throw redemptionError;

      toast({
        title: "🎉 Reward Redeemed!",
        description: `You've redeemed ${reward.name}. We'll process your request soon!`,
      });

      // Refresh data
      fetchAllData();
      return true;
    } catch (error) {
      console.error("Redemption error:", error);
      toast({
        title: "Error",
        description: "Failed to redeem reward. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getUnlockedAchievementIds = () => {
    return userAchievements.map(ua => ua.achievement_id);
  };

  const getAchievementProgress = (achievement: Achievement) => {
    if (!points) return 0;
    
    const typeToField: Record<string, keyof UserPoints> = {
      'profile_complete': 'profile_completeness',
      'login_streak': 'daily_login_streak',
      'connections': 'referrals_count',
      'events_submitted': 'events_submitted',
      'reels_uploaded': 'reels_uploaded',
      'materials_uploaded': 'study_materials_uploaded',
      'bounties_completed': 'bounties_completed',
      'courses_enrolled': 'courses_completed',
      'courses_completed': 'courses_completed',
      'referrals': 'referrals_count',
    };

    const field = typeToField[achievement.requirement_type];
    if (!field) return 0;

    const current = (points[field] as number) || 0;
    return Math.min((current / achievement.requirement_value) * 100, 100);
  };

  return {
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
    refetch: fetchAllData,
  };
};

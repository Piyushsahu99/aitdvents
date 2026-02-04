import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WheelSegment {
  id: string;
  label: string;
  color: string;
  prize_type: string;
  prize_value: number;
  probability_weight: number;
  is_jackpot: boolean;
}

interface SpinWheel {
  id: string;
  title: string;
  description: string | null;
  cost_per_spin: number;
  daily_spin_limit: number;
  theme_color: string;
  segments: WheelSegment[];
}

export function useSpinWheel() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheel, setWheel] = useState<SpinWheel | null>(null);
  const [todaySpins, setTodaySpins] = useState(0);
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number | null>(null);
  const [result, setResult] = useState<WheelSegment | null>(null);
  const { toast } = useToast();

  const fetchActiveWheel = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch active wheel
      const { data: wheelData, error: wheelError } = await supabase
        .from("spin_wheels")
        .select("*")
        .eq("is_active", true)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (wheelError) {
        // No wheel found, use demo wheel
        setWheel(getDemoWheel());
        return;
      }

      // Fetch segments
      const { data: segmentsData, error: segmentsError } = await supabase
        .from("spin_wheel_segments")
        .select("*")
        .eq("wheel_id", wheelData.id)
        .order("order_index");

      if (segmentsError || !segmentsData?.length) {
        setWheel(getDemoWheel());
        return;
      }

      setWheel({
        ...wheelData,
        segments: segmentsData,
      });

      // Fetch today's spins for this user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const today = new Date().toISOString().split("T")[0];
        const { count } = await supabase
          .from("spin_results")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("wheel_id", wheelData.id)
          .gte("spun_at", today);
        
        setTodaySpins(count || 0);
      }
    } catch (error) {
      console.error("Error fetching wheel:", error);
      setWheel(getDemoWheel());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const spin = useCallback(async () => {
    if (!wheel || isSpinning) return;

    // Check daily limit
    if (todaySpins >= wheel.daily_spin_limit) {
      toast({
        title: "Daily limit reached",
        description: "Come back tomorrow for more spins!",
        variant: "destructive",
      });
      return;
    }

    setIsSpinning(true);
    setResult(null);

    try {
      // Calculate winner based on probability weights
      const totalWeight = wheel.segments.reduce((sum, s) => sum + s.probability_weight, 0);
      let random = Math.random() * totalWeight;
      let winningIndex = 0;

      for (let i = 0; i < wheel.segments.length; i++) {
        random -= wheel.segments[i].probability_weight;
        if (random <= 0) {
          winningIndex = i;
          break;
        }
      }

      const winningSegment = wheel.segments[winningIndex];
      setSelectedSegmentIndex(winningIndex);

      // Record the spin in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("spin_results").insert({
          user_id: user.id,
          wheel_id: wheel.id,
          segment_id: winningSegment.id,
          prize_type: winningSegment.prize_type,
          prize_value: winningSegment.prize_value,
          is_jackpot: winningSegment.is_jackpot,
        });

        // Award coins if prize type is coins
        if (winningSegment.prize_type === "coins" && winningSegment.prize_value > 0) {
          // Log the spin win - points will be shown in UI
          console.log(`Won ${winningSegment.prize_value} coins from Spin & Win!`);
        }

        setTodaySpins((prev) => prev + 1);
      }

      // Store result to show after animation
      setTimeout(() => {
        setResult(winningSegment);
      }, 5000); // Match animation duration

    } catch (error) {
      console.error("Error during spin:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsSpinning(false);
    }
  }, [wheel, isSpinning, todaySpins, toast]);

  const onSpinComplete = useCallback(() => {
    setIsSpinning(false);
  }, []);

  const closeResult = useCallback(() => {
    setResult(null);
    setSelectedSegmentIndex(null);
  }, []);

  return {
    wheel,
    isLoading,
    isSpinning,
    todaySpins,
    selectedSegmentIndex,
    result,
    fetchActiveWheel,
    spin,
    onSpinComplete,
    closeResult,
  };
}

// Demo wheel for when no database wheel exists
function getDemoWheel(): SpinWheel {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
    "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"
  ];

  return {
    id: "demo",
    title: "Daily Spin & Win",
    description: "Spin the wheel to win AITD Coins!",
    cost_per_spin: 0,
    daily_spin_limit: 3,
    theme_color: "#F97316",
    segments: [
      { id: "1", label: "10 Coins", color: colors[0], prize_type: "coins", prize_value: 10, probability_weight: 25, is_jackpot: false },
      { id: "2", label: "Better Luck", color: colors[1], prize_type: "nothing", prize_value: 0, probability_weight: 20, is_jackpot: false },
      { id: "3", label: "25 Coins", color: colors[2], prize_type: "coins", prize_value: 25, probability_weight: 20, is_jackpot: false },
      { id: "4", label: "Try Again", color: colors[3], prize_type: "nothing", prize_value: 0, probability_weight: 15, is_jackpot: false },
      { id: "5", label: "50 Coins", color: colors[4], prize_type: "coins", prize_value: 50, probability_weight: 10, is_jackpot: false },
      { id: "6", label: "5 Coins", color: colors[5], prize_type: "coins", prize_value: 5, probability_weight: 5, is_jackpot: false },
      { id: "7", label: "100 Coins", color: colors[6], prize_type: "coins", prize_value: 100, probability_weight: 4, is_jackpot: false },
      { id: "8", label: "🎉 JACKPOT 500", color: colors[7], prize_type: "coins", prize_value: 500, probability_weight: 1, is_jackpot: true },
    ],
  };
}

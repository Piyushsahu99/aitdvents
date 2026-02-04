import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LuckyDraw {
  id: string;
  title: string;
  description: string | null;
  status: string;
  scheduled_draw_at: string | null;
  winner_count: number;
  entry_cost: number;
  max_entries: number | null;
  prizes: Array<{ name: string; value: string }>;
  banner_image: string | null;
}

interface DrawEntry {
  draw_id: string;
  user_id: string;
  entry_count: number;
}

interface DrawWinner {
  id: string;
  user_id: string;
  prize_rank: number;
  prize_details: { name: string; value: string } | null;
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export function useLuckyDraw() {
  const [draws, setDraws] = useState<LuckyDraw[]>([]);
  const [selectedDraw, setSelectedDraw] = useState<LuckyDraw | null>(null);
  const [entries, setEntries] = useState<Record<string, number>>({});
  const [myEntries, setMyEntries] = useState<Set<string>>(new Set());
  const [winners, setWinners] = useState<DrawWinner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const { toast } = useToast();

  const fetchDraws = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("lucky_draws")
        .select("*")
        .eq("is_public", true)
        .order("scheduled_draw_at", { ascending: true });

      if (error) throw error;

      // Transform prizes from JSONB
      const transformedDraws = (data || []).map((draw) => ({
        ...draw,
        prizes: Array.isArray(draw.prizes) 
          ? (draw.prizes as Array<{ name: string; value: string }>)
          : [],
      }));

      setDraws(transformedDraws as LuckyDraw[]);

      // Fetch entry counts for each draw
      const entryCounts: Record<string, number> = {};
      for (const draw of transformedDraws) {
        const { count } = await supabase
          .from("lucky_draw_entries")
          .select("*", { count: "exact", head: true })
          .eq("draw_id", draw.id);
        entryCounts[draw.id] = count || 0;
      }
      setEntries(entryCounts);

      // Fetch user's entries
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userEntries } = await supabase
          .from("lucky_draw_entries")
          .select("draw_id")
          .eq("user_id", user.id);
        
        setMyEntries(new Set((userEntries || []).map((e) => e.draw_id)));
      }
    } catch (error) {
      console.error("Error fetching draws:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const enterDraw = useCallback(async (drawId: string) => {
    setIsEntering(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login required",
          description: "Please login to enter the draw",
          variant: "destructive",
        });
        return false;
      }

      const draw = draws.find((d) => d.id === drawId);
      if (!draw) return false;

      // Check entry cost
      if (draw.entry_cost > 0) {
        // Check user's coin balance
        const { data: userPoints } = await supabase
          .from("user_points")
          .select("total_points")
          .eq("user_id", user.id)
          .single();

        if (!userPoints || userPoints.total_points < draw.entry_cost) {
          toast({
            title: "Insufficient coins",
            description: `You need ${draw.entry_cost} coins to enter this draw`,
            variant: "destructive",
          });
          return false;
        }

        // Deduct coins using spend_points
        const { data: spent } = await supabase.rpc("spend_points", {
          p_user_id: user.id,
          p_amount: draw.entry_cost,
          p_action_type: "lucky_draw_entry",
          p_description: `Entry for ${draw.title}`,
          p_reference_id: drawId,
        });

        if (!spent) {
          toast({
            title: "Error",
            description: "Failed to process entry fee",
            variant: "destructive",
          });
          return false;
        }
      }

      // Insert entry
      const { error } = await supabase.from("lucky_draw_entries").insert({
        draw_id: drawId,
        user_id: user.id,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already entered",
            description: "You have already entered this draw",
          });
        } else {
          throw error;
        }
        return false;
      }

      // Update local state
      setMyEntries((prev) => new Set([...prev, drawId]));
      setEntries((prev) => ({
        ...prev,
        [drawId]: (prev[drawId] || 0) + 1,
      }));

      toast({
        title: "Entry confirmed! 🎫",
        description: "Good luck in the draw!",
      });

      return true;
    } catch (error) {
      console.error("Error entering draw:", error);
      toast({
        title: "Error",
        description: "Failed to enter the draw. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsEntering(false);
    }
  }, [draws, toast]);

  const fetchWinners = useCallback(async (drawId: string) => {
    try {
      const { data, error } = await supabase
        .from("lucky_draw_winners")
        .select(`
          *,
          profile:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq("draw_id", drawId)
        .order("prize_rank");

      if (error) throw error;

      // Since we can't directly join to student_profiles, we'll fetch profiles separately
      const winnersWithProfiles: DrawWinner[] = [];
      
      for (const winner of data || []) {
        const { data: profile } = await supabase
          .from("student_profiles")
          .select("full_name, avatar_url")
          .eq("user_id", winner.user_id)
          .single();
        
        winnersWithProfiles.push({
          ...winner,
          prize_details: winner.prize_details as { name: string; value: string } | null,
          profile: profile || undefined,
        });
      }

      setWinners(winnersWithProfiles);
    } catch (error) {
      console.error("Error fetching winners:", error);
    }
  }, []);

  const selectDraw = useCallback((draw: LuckyDraw | null) => {
    setSelectedDraw(draw);
    if (draw) {
      fetchWinners(draw.id);
    }
  }, [fetchWinners]);

  return {
    draws,
    selectedDraw,
    entries,
    myEntries,
    winners,
    isLoading,
    isEntering,
    fetchDraws,
    enterDraw,
    selectDraw,
  };
}

// Demo draws for when no database draws exist
export function getDemoDraws(): LuckyDraw[] {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return [
    {
      id: "demo-1",
      title: "Weekly Mega Draw",
      description: "Enter for a chance to win 1000 AITD Coins and exclusive merchandise!",
      status: "upcoming",
      scheduled_draw_at: nextWeek.toISOString(),
      winner_count: 3,
      entry_cost: 0,
      max_entries: 1000,
      prizes: [
        { name: "1000 AITD Coins", value: "₹500 worth" },
        { name: "500 AITD Coins", value: "₹250 worth" },
        { name: "Premium T-Shirt", value: "Exclusive merch" },
      ],
      banner_image: null,
    },
    {
      id: "demo-2",
      title: "Daily Lucky Draw",
      description: "Quick daily draw - enter free and win coins!",
      status: "live",
      scheduled_draw_at: tomorrow.toISOString(),
      winner_count: 5,
      entry_cost: 0,
      max_entries: null,
      prizes: [
        { name: "100 AITD Coins", value: "" },
        { name: "50 AITD Coins", value: "" },
      ],
      banner_image: null,
    },
  ];
}

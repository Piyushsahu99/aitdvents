import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { iplPlayers, IPLPlayer } from "@/data/iplPlayers";

interface Auction {
  id: string;
  title: string;
  status: string;
  initial_budget: number;
  bid_increment: number;
  time_per_player: number;
  current_player_id: string | null;
  current_bid: number | null;
  current_bidder_id: string | null;
  join_code: string;
  max_teams: number;
  max_overseas: number;
  min_team_size: number;
  max_team_size: number;
  created_by: string;
}

interface Team {
  id: string;
  auction_id: string;
  user_id: string;
  team_name: string;
  remaining_budget: number;
  players_count: number;
  overseas_count: number;
  is_ready: boolean;
}

interface SoldPlayer {
  player_id: string;
  team_id: string;
  sold_price: number;
}

export function useAuctionRealtime(auctionId: string | null) {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [soldPlayers, setSoldPlayers] = useState<SoldPlayer[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<IPLPlayer | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch auction data
  const fetchAuction = useCallback(async () => {
    if (!auctionId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ipl_auctions")
        .select("*")
        .eq("id", auctionId)
        .single();

      if (error) throw error;
      setAuction(data);

      // Fetch teams
      const { data: teamsData } = await supabase
        .from("auction_teams")
        .select("*")
        .eq("auction_id", auctionId);
      
      setTeams(teamsData || []);

      // Check if user has a team
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const myTeamData = teamsData?.find((t) => t.user_id === user.id);
        setMyTeam(myTeamData || null);
      }

      // Fetch sold players
      const { data: soldData } = await supabase
        .from("auction_sold_players")
        .select("player_id, team_id, sold_price")
        .eq("auction_id", auctionId);
      
      setSoldPlayers(soldData || []);

    } catch (error) {
      console.error("Error fetching auction:", error);
    } finally {
      setIsLoading(false);
    }
  }, [auctionId]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!auctionId) return;

    fetchAuction();

    // Subscribe to auction changes
    const auctionChannel = supabase
      .channel(`auction-${auctionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ipl_auctions",
          filter: `id=eq.${auctionId}`,
        },
        (payload) => {
          if (payload.new) {
            setAuction(payload.new as Auction);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "auction_teams",
          filter: `auction_id=eq.${auctionId}`,
        },
        () => {
          // Refetch teams on any change
          supabase
            .from("auction_teams")
            .select("*")
            .eq("auction_id", auctionId)
            .then(({ data }) => {
              setTeams(data || []);
            });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "auction_bids",
          filter: `auction_id=eq.${auctionId}`,
        },
        (payload) => {
          // Show bid notification
          const bid = payload.new as { bid_amount: number; team_id: string };
          const team = teams.find((t) => t.id === bid.team_id);
          toast({
            title: "New Bid! 🔨",
            description: `${team?.team_name || "A team"} bid ₹${(bid.bid_amount / 10000000).toFixed(2)} Cr`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(auctionChannel);
    };
  }, [auctionId, fetchAuction, teams, toast]);

  // Update current player when auction changes
  useEffect(() => {
    if (auction?.current_player_id) {
      const player = iplPlayers.find((p) => p.name === auction.current_player_id);
      // Since we're using local data, match by name or use the first available
      const playerIndex = soldPlayers.length;
      if (playerIndex < iplPlayers.length) {
        setCurrentPlayer({
          ...iplPlayers[playerIndex],
          id: `player-${playerIndex}`,
        });
      }
    }
  }, [auction?.current_player_id, soldPlayers.length]);

  // Timer countdown
  useEffect(() => {
    if (auction?.status !== "active") return;

    setTimeRemaining(auction.time_per_player);
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [auction?.status, auction?.current_player_id, auction?.time_per_player]);

  // Join auction
  const joinAuction = useCallback(async (teamName: string) => {
    if (!auctionId || !auction) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login required",
          description: "Please login to join the auction",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase.from("auction_teams").insert({
        auction_id: auctionId,
        user_id: user.id,
        team_name: teamName,
        remaining_budget: auction.initial_budget,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already joined",
            description: "You have already joined this auction",
          });
        } else {
          throw error;
        }
        return false;
      }

      toast({
        title: "Team created! 🏏",
        description: `Welcome to ${teamName}!`,
      });

      await fetchAuction();
      return true;
    } catch (error) {
      console.error("Error joining auction:", error);
      toast({
        title: "Error",
        description: "Failed to join auction",
        variant: "destructive",
      });
      return false;
    }
  }, [auctionId, auction, toast, fetchAuction]);

  // Toggle ready status
  const toggleReady = useCallback(async () => {
    if (!myTeam) return;

    try {
      await supabase
        .from("auction_teams")
        .update({ is_ready: !myTeam.is_ready })
        .eq("id", myTeam.id);

      setMyTeam((prev) => prev ? { ...prev, is_ready: !prev.is_ready } : null);
    } catch (error) {
      console.error("Error toggling ready:", error);
    }
  }, [myTeam]);

  // Start auction (host only)
  const startAuction = useCallback(async () => {
    if (!auctionId) return false;

    try {
      // Get first player
      const firstPlayer = iplPlayers[0];

      await supabase
        .from("ipl_auctions")
        .update({
          status: "active",
          current_player_id: firstPlayer.name,
          current_bid: firstPlayer.base_price * 100000, // Convert lakhs to actual value
          started_at: new Date().toISOString(),
        })
        .eq("id", auctionId);

      return true;
    } catch (error) {
      console.error("Error starting auction:", error);
      return false;
    }
  }, [auctionId]);

  // Place bid
  const placeBid = useCallback(async (amount: number) => {
    if (!auctionId || !myTeam || !currentPlayer) return false;

    try {
      // Insert bid
      await supabase.from("auction_bids").insert({
        auction_id: auctionId,
        player_id: currentPlayer.id,
        team_id: myTeam.id,
        bid_amount: amount,
      });

      // Update auction current bid
      await supabase
        .from("ipl_auctions")
        .update({
          current_bid: amount,
          current_bidder_id: myTeam.id,
        })
        .eq("id", auctionId);

      return true;
    } catch (error) {
      console.error("Error placing bid:", error);
      return false;
    }
  }, [auctionId, myTeam, currentPlayer]);

  return {
    auction,
    teams,
    myTeam,
    soldPlayers,
    currentPlayer,
    timeRemaining,
    isLoading,
    joinAuction,
    toggleReady,
    startAuction,
    placeBid,
    refetch: fetchAuction,
  };
}

// Hook to fetch auction by join code
export function useAuctionByCode(code: string | null) {
  const [auctionId, setAuctionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setAuctionId(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    supabase
      .from("ipl_auctions")
      .select("id")
      .eq("join_code", code.toUpperCase())
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError("Auction not found");
          setAuctionId(null);
        } else {
          setAuctionId(data.id);
        }
        setIsLoading(false);
      });
  }, [code]);

  return { auctionId, isLoading, error };
}

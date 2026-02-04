import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuctionLobby } from "@/components/games/AuctionLobby";
import { PlayerCard, PlayerCardLarge } from "@/components/games/PlayerCard";
import { BidPanel } from "@/components/games/BidPanel";
import { TeamRoster } from "@/components/games/TeamRoster";
import { useAuctionRealtime, useAuctionByCode } from "@/hooks/useAuctionRealtime";
import { iplPlayers, formatPrice, IPLPlayer } from "@/data/iplPlayers";
import { fireConfetti } from "@/components/quiz/ConfettiEffect";
import {
  ArrowLeft,
  Gavel,
  Loader2,
  Plus,
  Search,
  Trophy,
  Users,
  Filter,
  Sparkles,
} from "lucide-react";

export default function IPLAuction() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const codeFromUrl = searchParams.get("code");

  const [inputCode, setInputCode] = useState(codeFromUrl || "");
  const [activeCode, setActiveCode] = useState(codeFromUrl || "");
  const [viewMode, setViewMode] = useState<"hub" | "auction">("hub");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const { auctionId, isLoading: isLoadingCode, error: codeError } = useAuctionByCode(activeCode);
  const {
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
  } = useAuctionRealtime(auctionId);

  const [isStarting, setIsStarting] = useState(false);
  const [isBidding, setIsBidding] = useState(false);

  // Handle code submit
  const handleCodeSubmit = () => {
    if (inputCode.trim()) {
      setActiveCode(inputCode.trim().toUpperCase());
      navigate(`/ipl-auction?code=${inputCode.trim().toUpperCase()}`, { replace: true });
      setViewMode("auction");
    }
  };

  // Handle start auction
  const handleStart = async () => {
    setIsStarting(true);
    await startAuction();
    setIsStarting(false);
  };

  // Handle bid
  const handleBid = async (amount: number) => {
    setIsBidding(true);
    await placeBid(amount);
    setIsBidding(false);
  };

  // Filter players
  const filteredPlayers = iplPlayers.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.team_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || player.category === selectedCategory;
    const matchesRole = selectedRole === "all" || player.role === selectedRole;
    return matchesSearch && matchesCategory && matchesRole;
  });

  // Get my team's players
  const myTeamPlayers = myTeam ? soldPlayers
    .filter((sp) => sp.team_id === myTeam.id)
    .map((sp) => {
      const player = iplPlayers.find((p) => p.name === sp.player_id);
      return player ? { player: { ...player, id: sp.player_id }, soldPrice: sp.sold_price } : null;
    })
    .filter(Boolean) as Array<{ player: IPLPlayer; soldPrice: number }> : [];

  // Trigger celebration on player sold
  useEffect(() => {
    if (soldPlayers.length > 0) {
      fireConfetti("celebration");
    }
  }, [soldPlayers.length]);

  // Hub view - no active auction
  if (viewMode === "hub" && !activeCode) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-500/10 via-background to-cyan-500/10 py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link to="/quiz">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Gavel className="h-6 w-6 text-blue-500" />
                IPL Auction
              </h1>
              <p className="text-sm text-muted-foreground">
                Build your dream cricket team!
              </p>
            </div>
          </div>

          {/* Join Card */}
          <Card className="max-w-md mx-auto mb-8 border-2 border-blue-500/30">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Join an Auction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter 6-digit code"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleCodeSubmit()}
                className="text-center text-2xl font-mono tracking-[0.3em] h-14 uppercase"
                maxLength={6}
              />
              <Button
                onClick={handleCodeSubmit}
                disabled={inputCode.length < 6}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                Join Auction
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>
              <Link to="/create-auction">
                <Button variant="outline" className="w-full h-12">
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Auction
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Players Database Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Players Database ({iplPlayers.length}+)
                </CardTitle>
                <Badge variant="outline">{filteredPlayers.length} shown</Badge>
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search players..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-10 px-3 rounded-md border bg-background text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Bronze">Bronze</option>
                </select>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="h-10 px-3 rounded-md border bg-background text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-rounder">All-rounder</option>
                  <option value="Wicket-keeper">Wicket-keeper</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-2">
                {filteredPlayers.slice(0, 30).map((player, index) => (
                  <motion.div
                    key={`${player.name}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <PlayerCard
                      player={{ ...player, id: `player-${index}` }}
                    />
                  </motion.div>
                ))}
              </div>
              {filteredPlayers.length > 30 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Showing 30 of {filteredPlayers.length} players
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || isLoadingCode) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  // Auction not found
  if (codeError || !auction) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 text-center">
        <Gavel className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Auction Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The auction code "{activeCode}" doesn't exist.
        </p>
        <Button onClick={() => {
          setActiveCode("");
          setViewMode("hub");
          navigate("/ipl-auction", { replace: true });
        }}>
          Try Another Code
        </Button>
      </div>
    );
  }

  // Lobby state
  if (auction.status === "lobby") {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-500/10 via-background to-cyan-500/10 py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setActiveCode("");
                setViewMode("hub");
                navigate("/ipl-auction", { replace: true });
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Badge variant="outline">Lobby</Badge>
          </div>

          <AuctionLobby
            auctionId={auction.id}
            auctionTitle={auction.title}
            joinCode={auction.join_code}
            initialBudget={auction.initial_budget}
            maxTeams={auction.max_teams}
            teams={teams}
            isHost={myTeam?.user_id === auction.created_by}
            isJoined={!!myTeam}
            onJoin={joinAuction}
            onStart={handleStart}
            onToggleReady={toggleReady}
            isStarting={isStarting}
            myTeamReady={myTeam?.is_ready || false}
          />
        </div>
      </div>
    );
  }

  // Active auction
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-500/10 via-background to-cyan-500/10 py-4 sm:py-6">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/ipl-auction")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">{auction.title}</h1>
              <Badge className="bg-green-500/20 text-green-600">
                <Sparkles className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-1.5">
            {soldPlayers.length}/{iplPlayers.length} Sold
          </Badge>
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Main auction area */}
          <div className="space-y-6">
            {/* Current player on block */}
            {currentPlayer && (
              <PlayerCardLarge
                player={currentPlayer}
                currentBid={auction.current_bid || currentPlayer.base_price * 100000}
              />
            )}

            {/* Bid panel */}
            {myTeam && currentPlayer && (
              <BidPanel
                currentBid={auction.current_bid || currentPlayer.base_price * 100000}
                minBidIncrement={auction.bid_increment}
                timeRemaining={timeRemaining}
                maxTime={auction.time_per_player}
                remainingBudget={myTeam.remaining_budget}
                isMyTurn={true} // Simplified - in real app would track turn order
                currentBidder={teams.find((t) => t.id === auction.current_bidder_id)?.team_name || null}
                onBid={handleBid}
                onPass={() => {}}
                isProcessing={isBidding}
              />
            )}
          </div>

          {/* Sidebar - Team roster */}
          {myTeam && (
            <TeamRoster
              teamName={myTeam.team_name}
              players={myTeamPlayers}
              totalBudget={auction.initial_budget}
              remainingBudget={myTeam.remaining_budget}
              maxTeamSize={auction.max_team_size}
              maxOverseas={auction.max_overseas}
            />
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Coins,
  Users,
  Timer,
  TrendingUp,
  Award,
  Shield,
  Zap,
  Crown,
  ArrowUp,
  DollarSign,
} from "lucide-react";

interface Player {
  id: string;
  name: string;
  role: "Batsman" | "Bowler" | "All-Rounder" | "Wicket-Keeper";
  basePrice: number;
  rating: number;
  country: string;
  image: string;
  specialty: string;
}

interface Team {
  id: string;
  name: string;
  owner: string;
  budget: number;
  players: Player[];
  totalValue: number;
}

const STARTING_BUDGET = 1000; // AITD Coins
const AUCTION_TIME = 30; // seconds per player

export default function CricketAuction() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [timer, setTimer] = useState(AUCTION_TIME);
  const [currentBid, setCurrentBid] = useState(0);
  const [bidAmount, setBidAmount] = useState(10);
  const [myTeam, setMyTeam] = useState<Team>({
    id: "my-team",
    name: "My Team",
    owner: "You",
    budget: STARTING_BUDGET,
    players: [],
    totalValue: 0,
  });
  const [highestBidder, setHighestBidder] = useState<string | null>(null);
  const [auctionComplete, setAuctionComplete] = useState(false);

  const players: Player[] = [
    {
      id: "1",
      name: "Virat Kohli",
      role: "Batsman",
      basePrice: 150,
      rating: 98,
      country: "🇮🇳 India",
      image: "🏏",
      specialty: "Chase Master",
    },
    {
      id: "2",
      name: "Jasprit Bumrah",
      role: "Bowler",
      basePrice: 140,
      rating: 97,
      country: "🇮🇳 India",
      image: "⚡",
      specialty: "Death Bowling",
    },
    {
      id: "3",
      name: "MS Dhoni",
      role: "Wicket-Keeper",
      basePrice: 120,
      rating: 95,
      country: "🇮🇳 India",
      image: "🧤",
      specialty: "Captain Cool",
    },
    {
      id: "4",
      name: "Ravindra Jadeja",
      role: "All-Rounder",
      basePrice: 130,
      rating: 94,
      country: "🇮🇳 India",
      image: "🎯",
      specialty: "3-in-1 Player",
    },
    {
      id: "5",
      name: "KL Rahul",
      role: "Batsman",
      basePrice: 110,
      rating: 92,
      country: "🇮🇳 India",
      image: "🏏",
      specialty: "Versatile Opener",
    },
    {
      id: "6",
      name: "Rashid Khan",
      role: "Bowler",
      basePrice: 100,
      rating: 93,
      country: "🇦🇫 Afghanistan",
      image: "🌪️",
      specialty: "Spin Wizard",
    },
    {
      id: "7",
      name: "Andre Russell",
      role: "All-Rounder",
      basePrice: 105,
      rating: 91,
      country: "🇯🇲 Jamaica",
      image: "💪",
      specialty: "Power Hitter",
    },
    {
      id: "8",
      name: "Babar Azam",
      role: "Batsman",
      basePrice: 115,
      rating: 93,
      country: "🇵🇰 Pakistan",
      image: "👑",
      specialty: "Consistency King",
    },
  ];

  const currentPlayer = players[currentPlayerIndex];

  useEffect(() => {
    if (!gameStarted || auctionComplete) return;

    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      handleAuctionEnd();
    }
  }, [timer, gameStarted, auctionComplete]);

  const handleBid = () => {
    const newBid = currentBid + bidAmount;

    if (newBid > myTeam.budget) {
      toast({
        title: "Insufficient Budget!",
        description: `You only have ${myTeam.budget} coins left`,
        variant: "destructive",
      });
      return;
    }

    setCurrentBid(newBid);
    setHighestBidder("You");
    setTimer(Math.min(timer + 5, AUCTION_TIME)); // Add 5 seconds, max 30

    // Celebration effect
    import('canvas-confetti').then((confetti) => {
      confetti.default({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#14b8a6']
      });
    });

    toast({
      title: "Bid Placed! 🏏",
      description: `Your bid: ${newBid} coins`,
    });

    // Simulate AI bidding (50% chance)
    setTimeout(() => {
      if (Math.random() > 0.5 && newBid < currentPlayer.basePrice * 2) {
        const aiBid = newBid + Math.floor(Math.random() * 20) + 10;
        setCurrentBid(aiBid);
        setHighestBidder("AI Team");
        toast({
          title: "AI Bid!",
          description: `AI team bid: ${aiBid} coins`,
        });
      }
    }, 2000);
  };

  const handleAuctionEnd = () => {
    if (highestBidder === "You") {
      // Player won by user
      const newTeam = {
        ...myTeam,
        budget: myTeam.budget - currentBid,
        players: [...myTeam.players, currentPlayer],
        totalValue: myTeam.totalValue + currentPlayer.rating,
      };
      setMyTeam(newTeam);

      toast({
        title: "Player Acquired! 🎉",
        description: `${currentPlayer.name} joined your team for ${currentBid} coins!`,
      });
    } else if (highestBidder === "AI Team") {
      toast({
        title: "Player Lost",
        description: `AI team acquired ${currentPlayer.name}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "No Bids",
        description: `${currentPlayer.name} went unsold`,
      });
    }

    // Move to next player or end auction
    if (currentPlayerIndex < players.length - 1) {
      setTimeout(() => {
        setCurrentPlayerIndex(currentPlayerIndex + 1);
        setCurrentBid(players[currentPlayerIndex + 1].basePrice);
        setTimer(AUCTION_TIME);
        setHighestBidder(null);
      }, 2000);
    } else {
      setAuctionComplete(true);
    }
  };

  const startAuction = () => {
    setGameStarted(true);
    setCurrentBid(players[0].basePrice);
    toast({
      title: "Auction Started! 🏏",
      description: "Build your dream cricket team!",
    });
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-4xl py-12">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-8 text-white text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-2">Cricket Auction Game</h1>
              <p className="text-lg opacity-90">Build Your Dream Cricket Team!</p>
            </div>

            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Game Rules */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">How to Play</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Coins className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Starting Budget</h3>
                        <p className="text-sm text-muted-foreground">
                          You start with {STARTING_BUDGET} AITD Coins
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Timer className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Auction Time</h3>
                        <p className="text-sm text-muted-foreground">
                          {AUCTION_TIME} seconds per player. Each bid adds 5 seconds!
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Build Your Squad</h3>
                        <p className="text-sm text-muted-foreground">
                          Compete with AI teams to acquire the best players
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Win Rewards</h3>
                        <p className="text-sm text-muted-foreground">
                          Best team wins up to 100 AITD Coins!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Players Preview */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Players Available</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {players.map((player) => (
                      <Card key={player.id} className="text-center p-3">
                        <div className="text-3xl mb-2">{player.image}</div>
                        <div className="font-semibold text-sm">{player.name}</div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {player.role}
                        </Badge>
                      </Card>
                    ))}
                  </div>
                </div>

                <Button onClick={startAuction} size="lg" className="w-full">
                  <Trophy className="h-5 w-5 mr-2" />
                  Start Auction
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (auctionComplete) {
    const teamRating = myTeam.players.reduce((sum, p) => sum + p.rating, 0);
    const avgRating = teamRating / myTeam.players.length || 0;
    const coinsEarned = Math.floor(avgRating);

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-4xl py-12">
          <Card>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-8 text-white text-center">
              <Trophy className="h-20 w-20 mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-2">Auction Complete!</h1>
              <p className="text-lg">Your Dream Team</p>
            </div>

            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Team Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
                    <CardContent className="pt-6 text-center">
                      <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                      <div className="text-3xl font-bold">{myTeam.players.length}</div>
                      <div className="text-sm text-muted-foreground">Players</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-accent/10 to-primary/10">
                    <CardContent className="pt-6 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2" />
                      <div className="text-3xl font-bold">{avgRating.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">Avg Rating</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
                    <CardContent className="pt-6 text-center">
                      <Coins className="h-8 w-8 mx-auto text-primary mb-2" />
                      <div className="text-3xl font-bold">{myTeam.budget}</div>
                      <div className="text-sm text-muted-foreground">Remaining</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Team Players */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Your Squad</h2>
                  {myTeam.players.length > 0 ? (
                    <div className="grid gap-4">
                      {myTeam.players.map((player) => (
                        <Card key={player.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-4xl">{player.image}</div>
                              <div>
                                <h3 className="font-bold text-lg">{player.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Badge variant="outline">{player.role}</Badge>
                                  <span>{player.country}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {player.specialty}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-primary font-bold">
                                <Award className="h-4 w-4" />
                                {player.rating}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      You didn't acquire any players
                    </p>
                  )}
                </div>

                {/* Rewards */}
                {myTeam.players.length > 0 && (
                  <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-400/10 border-emerald-500/20">
                    <CardContent className="p-6 text-center">
                      <Crown className="h-12 w-12 mx-auto text-primary mb-3" />
                      <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
                      <p className="text-muted-foreground mb-4">
                        You've earned rewards based on your team's quality
                      </p>
                      <div className="text-4xl font-bold text-primary">
                        +{coinsEarned} AITD Coins
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.location.reload()}
                  >
                    Play Again
                  </Button>
                  <Button className="flex-1" onClick={() => navigate("/games")}>
                    <Trophy className="h-4 w-4 mr-2" />
                    More Games
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Auction Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer & Status */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="text-lg px-4 py-2">
                    Player {currentPlayerIndex + 1} of {players.length}
                  </Badge>
                  <div className="flex items-center gap-2 text-2xl font-bold">
                    <Timer className="h-6 w-6 text-primary" />
                    {timer}s
                  </div>
                </div>
                <Progress value={(timer / AUCTION_TIME) * 100} className="h-2" />
              </CardContent>
            </Card>

            {/* Current Player */}
            <Card className="overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 animate-pulse" />
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {currentPlayer.role}
                    </Badge>
                    <h2 className="text-3xl font-bold mb-1">{currentPlayer.name}</h2>
                    <p className="opacity-90">{currentPlayer.country}</p>
                  </div>
                  <div className="text-6xl">{currentPlayer.image}</div>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Base Price</div>
                    <div className="font-bold text-lg">{currentPlayer.basePrice}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Rating</div>
                    <div className="font-bold text-lg flex items-center justify-center gap-1">
                      <Award className="h-4 w-4 text-primary" />
                      {currentPlayer.rating}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Specialty</div>
                    <Badge variant="outline">{currentPlayer.specialty}</Badge>
                  </div>
                </div>

                {/* Current Bid */}
                <Card className="bg-gradient-to-br from-primary/10 to-accent/10 mb-6">
                  <CardContent className="p-6 text-center">
                    <div className="text-sm text-muted-foreground mb-2">Current Bid</div>
                    <div className="text-4xl font-bold text-primary mb-2">{currentBid}</div>
                    {highestBidder && (
                      <Badge className="text-sm">
                        {highestBidder === "You" ? "🎯 Your Bid" : "🤖 AI Bid"}
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                {/* Bidding Controls */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBidAmount(10)}
                      className={bidAmount === 10 ? "bg-primary/10" : ""}
                    >
                      +10
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBidAmount(25)}
                      className={bidAmount === 25 ? "bg-primary/10" : ""}
                    >
                      +25
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBidAmount(50)}
                      className={bidAmount === 50 ? "bg-primary/10" : ""}
                    >
                      +50
                    </Button>
                    <Input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className="w-24"
                      min="1"
                    />
                  </div>

                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleBid}
                    disabled={currentBid + bidAmount > myTeam.budget}
                  >
                    <ArrowUp className="h-5 w-5 mr-2" />
                    Bid {currentBid + bidAmount} Coins
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Sidebar */}
          <div className="space-y-6">
            {/* Budget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Your Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">{myTeam.budget}</div>
                <p className="text-sm text-muted-foreground">AITD Coins remaining</p>
                <Progress
                  value={(myTeam.budget / STARTING_BUDGET) * 100}
                  className="mt-4"
                />
              </CardContent>
            </Card>

            {/* My Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  My Squad ({myTeam.players.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myTeam.players.length > 0 ? (
                  <div className="space-y-3">
                    {myTeam.players.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg"
                      >
                        <div className="text-2xl">{player.image}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{player.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {player.role}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No players yet. Start bidding!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

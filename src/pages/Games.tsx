import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Gamepad2,
  Trophy,
  Target,
  Brain,
  Users,
  Coins,
} from "lucide-react";

interface Game {
  id: string;
  title: string;
  description: string;
  icon: typeof Gamepad2;
  path: string;
  coinsReward: number;
  players: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: "Strategy" | "Trivia" | "Action" | "Auction" | "Puzzle";
  status: "Live" | "Coming Soon";
  gradient: string;
}

export default function Games() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const games: Game[] = [
    {
      id: "quiz",
      title: "Live Quiz Battle",
      description: "Real-time quiz competition with players across India. Test your knowledge and win!",
      icon: Brain,
      path: "/quiz",
      coinsReward: 50,
      players: "2-50",
      difficulty: "Medium",
      category: "Trivia",
      status: "Live",
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      id: "spin-wheel",
      title: "Lucky Spin Wheel",
      description: "Spin the colorful wheel and win prizes! Test your luck with 3 free spins every game.",
      icon: Target,
      path: "/games/spin-wheel",
      coinsReward: 1000,
      players: "1",
      difficulty: "Easy",
      category: "Action",
      status: "Live",
      gradient: "from-purple-500 to-pink-400",
    },
    {
      id: "cricket-auction",
      title: "Cricket Auction Game",
      description: "Build your dream cricket team! Bid on players with your coins and compete against others.",
      icon: Trophy,
      path: "/games/cricket-auction",
      coinsReward: 100,
      players: "2-10",
      difficulty: "Medium",
      category: "Auction",
      status: "Live",
      gradient: "from-emerald-500 to-teal-400",
    },
    {
      id: "random-picker",
      title: "Random Winner Picker",
      description: "Randomly select winners from a list! Perfect for giveaways, contests, and events.",
      icon: Users,
      path: "/games/random-picker",
      coinsReward: 0,
      players: "1+",
      difficulty: "Easy",
      category: "Strategy",
      status: "Live",
      gradient: "from-indigo-500 to-purple-400",
    },
    {
      id: "target-master",
      title: "Target Master",
      description: "Click the targets as they appear! Improve your reaction time and compete on leaderboards.",
      icon: Target,
      path: "/games/target-master",
      coinsReward: 30,
      players: "1",
      difficulty: "Easy",
      category: "Action",
      status: "Live",
      gradient: "from-red-500 to-rose-400",
    },
  ];

  const categories = ["All", "Trivia", "Auction", "Strategy", "Action", "Puzzle"];

  const filteredGames = selectedCategory === "All" 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const liveGames = games.filter(g => g.status === "Live").length;
  const totalPlayers = "5,234"; // Mock data
  const totalRewards = "125,000"; // Mock data

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 px-4 overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        
        {/* Animated background blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float-delayed" />
        
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-base px-6 py-2 animate-bounce-in">
            <Gamepad2 className="h-4 w-4 mr-2" />
            AITD Games Arena
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in-up">
            PLAY. COMPETE.{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient" style={{backgroundSize: '200% 200%'}}>
              EARN
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            Multiple interactive games to test your skills, compete with others, and earn AITD Coins!
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">{liveGames}</div>
                <div className="text-sm text-muted-foreground">Live Games</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-accent/5 to-primary/5">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">{totalPlayers}</div>
                <div className="text-sm text-muted-foreground">Active Players</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">{totalRewards}</div>
                <div className="text-sm text-muted-foreground">Coins Awarded</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 px-4 border-b">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => {
              const Icon = game.icon;
              return (
                <Card
                  key={game.id}
                  className="group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden border-border/50 hover:border-primary/30 backdrop-blur-sm"
                >
                  {/* Gradient Background */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${game.gradient} transition-all duration-300 group-hover:h-3`}
                  />
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <CardHeader className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${game.gradient} bg-opacity-10 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-6`}>
                        <Icon className="h-8 w-8 text-primary group-hover:animate-bounce" />
                      </div>
                      <Badge variant={game.status === "Live" ? "default" : "secondary"} className="group-hover:scale-110 transition-transform duration-300">
                        {game.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">{game.title}</CardTitle>
                    <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">{game.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      {/* Game Info */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{game.players} Players</span>
                        </div>
                        <Badge variant="outline">{game.difficulty}</Badge>
                      </div>

                      {/* Reward */}
                      <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                        <Coins className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Up to {game.coinsReward} Coins</span>
                      </div>

                      {/* Action Button */}
                      <Button
                        className="w-full group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 relative overflow-hidden"
                        onClick={() => navigate(game.path)}
                        disabled={game.status === "Coming Soon"}
                      >
                        {game.status === "Live" ? (
                          <>
                            <Gamepad2 className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                            Play Now
                          </>
                        ) : (
                          <>
                            <Timer className="h-4 w-4 mr-2" />
                            Coming Soon
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Choose Your Game</h3>
              <p className="text-sm text-muted-foreground">
                Pick from various game types based on your interests and skills
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Play & Compete</h3>
              <p className="text-sm text-muted-foreground">
                Battle against others or challenge yourself to beat high scores
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Earn Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Win AITD Coins based on your performance and rankings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Playing?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of students already playing and earning on AITD Events!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Sign Up Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/leaderboard")}>
              View Leaderboard
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

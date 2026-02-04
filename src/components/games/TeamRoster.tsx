import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatPrice, IPLPlayer } from "@/data/iplPlayers";
import { 
  Coins, 
  Flag, 
  Users, 
  User,
  Trophy,
  AlertTriangle
} from "lucide-react";

interface TeamRosterProps {
  teamName: string;
  players: Array<{
    player: IPLPlayer;
    soldPrice: number;
  }>;
  totalBudget: number;
  remainingBudget: number;
  maxTeamSize: number;
  maxOverseas: number;
}

export function TeamRoster({
  teamName,
  players,
  totalBudget,
  remainingBudget,
  maxTeamSize,
  maxOverseas,
}: TeamRosterProps) {
  const overseasCount = players.filter((p) => p.player.is_overseas).length;
  const budgetUsed = totalBudget - remainingBudget;
  const budgetPercent = (budgetUsed / totalBudget) * 100;

  // Group players by role
  const batsmen = players.filter((p) => p.player.role === "Batsman");
  const bowlers = players.filter((p) => p.player.role === "Bowler");
  const allRounders = players.filter((p) => p.player.role === "All-rounder");
  const keepers = players.filter((p) => p.player.role === "Wicket-keeper");

  const roleGroups = [
    { name: "Batsmen", players: batsmen, icon: "🏏" },
    { name: "Bowlers", players: bowlers, icon: "🎯" },
    { name: "All-rounders", players: allRounders, icon: "⚡" },
    { name: "Wicket-keepers", players: keepers, icon: "🧤" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {teamName}
          </CardTitle>
          <Badge variant="outline">
            {players.length}/{maxTeamSize} Players
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Budget info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Coins className="h-4 w-4" />
              Budget Used
            </span>
            <span className="font-semibold">
              {formatPrice(budgetUsed)} / {formatPrice(totalBudget)}
            </span>
          </div>
          <Progress value={budgetPercent} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            Remaining: <span className="font-semibold text-green-500">{formatPrice(remainingBudget)}</span>
          </p>
        </div>

        {/* Team stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold">{players.length}</p>
            <p className="text-xs text-muted-foreground">Total Players</p>
          </div>
          <div className={`p-3 rounded-lg text-center ${
            overseasCount >= maxOverseas ? "bg-yellow-500/10" : "bg-muted/50"
          }`}>
            <Flag className="h-4 w-4 mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-bold">{overseasCount}/{maxOverseas}</p>
            <p className="text-xs text-muted-foreground">Overseas</p>
          </div>
        </div>

        {/* Overseas warning */}
        {overseasCount >= maxOverseas && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 text-yellow-600 text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Overseas slots full!</span>
          </div>
        )}

        {/* Players list by role */}
        <ScrollArea className="h-[300px] pr-2">
          <div className="space-y-4">
            {roleGroups.map((group) => (
              group.players.length > 0 && (
                <div key={group.name}>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <span>{group.icon}</span>
                    {group.name} ({group.players.length})
                  </p>
                  <div className="space-y-2">
                    {group.players.map(({ player, soldPrice }, index) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={player.photo_url} alt={player.name} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-sm truncate">{player.name}</p>
                            {player.is_overseas && (
                              <Flag className="h-3 w-3 text-blue-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {player.nationality}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-green-500/10 text-green-600 shrink-0"
                        >
                          {formatPrice(soldPrice)}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            ))}

            {players.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No players yet</p>
                <p className="text-xs">Start bidding to build your team!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

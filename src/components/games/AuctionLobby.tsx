import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatPrice } from "@/data/iplPlayers";
import { 
  Users, 
  Trophy, 
  Coins, 
  Copy, 
  Check,
  Play,
  Loader2,
  User,
  Crown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Team {
  id: string;
  team_name: string;
  user_id: string;
  is_ready: boolean;
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface AuctionLobbyProps {
  auctionId: string;
  auctionTitle: string;
  joinCode: string;
  initialBudget: number;
  maxTeams: number;
  teams: Team[];
  isHost: boolean;
  isJoined: boolean;
  onJoin: (teamName: string) => void;
  onStart: () => void;
  onToggleReady: () => void;
  isStarting: boolean;
  myTeamReady: boolean;
}

export function AuctionLobby({
  auctionId,
  auctionTitle,
  joinCode,
  initialBudget,
  maxTeams,
  teams,
  isHost,
  isJoined,
  onJoin,
  onStart,
  onToggleReady,
  isStarting,
  myTeamReady,
}: AuctionLobbyProps) {
  const [teamName, setTeamName] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    toast({ title: "Code copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = () => {
    if (teamName.trim()) {
      onJoin(teamName.trim());
    }
  };

  const readyCount = teams.filter((t) => t.is_ready).length;
  const canStart = teams.length >= 2 && readyCount === teams.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25 mb-4">
          <Trophy className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-1">{auctionTitle}</h1>
        <p className="text-muted-foreground">Waiting for players to join...</p>
      </motion.div>

      {/* Join Code Card */}
      <Card className="border-2 border-dashed border-primary/30">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Share this code to invite players</p>
          <div className="flex items-center justify-center gap-3">
            <div className="text-3xl font-mono font-bold tracking-[0.3em] bg-muted px-6 py-3 rounded-xl">
              {joinCode}
            </div>
            <Button variant="outline" size="icon" onClick={handleCopyCode}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Join form (if not joined) */}
      {!isJoined && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create Your Team</CardTitle>
              <CardDescription>Choose a team name to join the auction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter team name (e.g., Royal Strikers)"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="text-lg h-12"
              />
              <Button
                onClick={handleJoin}
                disabled={!teamName.trim() || teams.length >= maxTeams}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                <Users className="h-5 w-5 mr-2" />
                Join Auction
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Auction info */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center p-4">
          <Coins className="h-5 w-5 mx-auto mb-2 text-yellow-500" />
          <p className="text-sm text-muted-foreground">Budget</p>
          <p className="font-bold">{formatPrice(initialBudget / 10000000)} Cr</p>
        </Card>
        <Card className="text-center p-4">
          <Users className="h-5 w-5 mx-auto mb-2 text-blue-500" />
          <p className="text-sm text-muted-foreground">Teams</p>
          <p className="font-bold">{teams.length}/{maxTeams}</p>
        </Card>
        <Card className="text-center p-4">
          <Trophy className="h-5 w-5 mx-auto mb-2 text-green-500" />
          <p className="text-sm text-muted-foreground">Ready</p>
          <p className="font-bold">{readyCount}/{teams.length}</p>
        </Card>
      </div>

      {/* Teams list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Joined Teams</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {teams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/30">
                  {team.profile?.avatar_url ? (
                    <img src={team.profile.avatar_url} alt="" />
                  ) : (
                    <AvatarFallback className="bg-primary/10">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{team.team_name}</p>
                    {index === 0 && isHost && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {team.profile?.full_name || "Player"}
                  </p>
                </div>
              </div>
              <Badge
                className={team.is_ready 
                  ? "bg-green-500/20 text-green-600 border-green-500/30" 
                  : "bg-muted text-muted-foreground"
                }
              >
                {team.is_ready ? "Ready" : "Not Ready"}
              </Badge>
            </motion.div>
          ))}

          {teams.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No teams have joined yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action buttons */}
      {isJoined && (
        <div className="flex gap-3">
          <Button
            variant={myTeamReady ? "outline" : "default"}
            onClick={onToggleReady}
            className="flex-1 h-12"
          >
            {myTeamReady ? "Not Ready" : "Ready Up!"}
          </Button>
          
          {isHost && (
            <Button
              onClick={onStart}
              disabled={!canStart || isStarting}
              className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500"
            >
              {isStarting ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Play className="h-5 w-5 mr-2" />
              )}
              Start Auction
            </Button>
          )}
        </div>
      )}

      {isJoined && !canStart && (
        <p className="text-center text-sm text-muted-foreground">
          {teams.length < 2 
            ? "Need at least 2 teams to start" 
            : "All teams must be ready to start"}
        </p>
      )}
    </div>
  );
}

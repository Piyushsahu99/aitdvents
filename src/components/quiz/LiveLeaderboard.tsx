import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  participant_name: string;
  total_score: number;
  previousRank?: number;
}

interface LiveLeaderboardProps {
  participants: Participant[];
  currentUserId?: string;
  showTop?: number;
  compact?: boolean;
}

export function LiveLeaderboard({
  participants,
  currentUserId,
  showTop = 10,
  compact = false,
}: LiveLeaderboardProps) {
  const sortedParticipants = [...participants]
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, showTop);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getRankChange = (currentRank: number, previousRank?: number) => {
    if (!previousRank) return null;
    const change = previousRank - currentRank;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const rankColors = [
    "from-yellow-500/20 to-amber-500/20 border-yellow-500/50",
    "from-gray-300/20 to-gray-400/20 border-gray-400/50",
    "from-amber-600/20 to-orange-600/20 border-amber-600/50",
  ];

  if (compact) {
    return (
      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {sortedParticipants.map((p, idx) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: idx * 0.03 }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg",
                p.id === currentUserId ? "bg-primary/20 border border-primary/50" : "bg-muted/50"
              )}
            >
              <span className="w-6 text-center font-bold text-sm">{idx + 1}</span>
              <span className="flex-1 text-sm font-medium truncate">{p.participant_name}</span>
              <span className="text-sm font-bold text-primary">{p.total_score}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {sortedParticipants.map((p, idx) => {
          const rank = idx + 1;
          const isCurrentUser = p.id === currentUserId;
          const isTopThree = rank <= 3;

          return (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ delay: idx * 0.05, type: "spring", stiffness: 200 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                isTopThree && rankColors[rank - 1],
                isCurrentUser && !isTopThree && "bg-primary/10 border-primary/50",
                !isTopThree && !isCurrentUser && "bg-muted/30 border-transparent"
              )}
            >
              {/* Rank */}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                isTopThree 
                  ? "bg-gradient-to-br from-primary to-purple-500 text-white"
                  : "bg-muted text-muted-foreground"
              )}>
                {getRankIcon(rank) || rank}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-semibold truncate",
                    isCurrentUser && "text-primary"
                  )}>
                    {p.participant_name}
                  </span>
                  {isCurrentUser && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      You
                    </span>
                  )}
                </div>
              </div>

              {/* Rank change indicator */}
              <div className="w-6 flex justify-center">
                {getRankChange(rank, p.previousRank)}
              </div>

              {/* Score */}
              <motion.div
                className={cn(
                  "text-lg font-bold min-w-[60px] text-right",
                  isTopThree ? "text-primary" : "text-foreground"
                )}
                key={p.total_score}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {p.total_score.toLocaleString()}
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

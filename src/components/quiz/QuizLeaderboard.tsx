import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  participant_name: string;
  total_score: number;
  final_rank: number | null;
}

interface QuizLeaderboardProps {
  participants: Participant[];
  currentParticipantId?: string;
  showTop?: number;
  compact?: boolean;
}

export function QuizLeaderboard({
  participants,
  currentParticipantId,
  showTop = 10,
  compact = false,
}: QuizLeaderboardProps) {
  const sortedParticipants = [...participants]
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, showTop);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center text-muted-foreground">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30";
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/30";
      default:
        return "bg-card border-border";
    }
  };

  if (sortedParticipants.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No participants yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedParticipants.map((participant, index) => {
        const rank = index + 1;
        const isCurrentUser = participant.id === currentParticipantId;

        return (
          <div
            key={participant.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all",
              getRankStyle(rank),
              isCurrentUser && "ring-2 ring-primary ring-offset-2",
              compact && "p-2"
            )}
          >
            <div className="flex items-center justify-center w-8">
              {getRankIcon(rank)}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "font-medium truncate",
                  compact ? "text-sm" : "text-base",
                  isCurrentUser && "text-primary"
                )}
              >
                {participant.participant_name}
                {isCurrentUser && " (You)"}
              </p>
            </div>
            <div
              className={cn(
                "font-bold",
                compact ? "text-sm" : "text-lg",
                rank === 1 && "text-yellow-500",
                rank === 2 && "text-gray-400",
                rank === 3 && "text-amber-600"
              )}
            >
              {participant.total_score}
            </div>
          </div>
        );
      })}
    </div>
  );
}

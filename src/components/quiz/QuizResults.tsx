import { Trophy, Medal, Award, Download, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  participant_name: string;
  total_score: number;
  final_rank: number | null;
}

interface QuizResultsProps {
  quizTitle: string;
  participants: Participant[];
  currentParticipantId?: string;
  onDownloadCertificate?: () => void;
  onShare?: () => void;
}

export function QuizResults({
  quizTitle,
  participants,
  currentParticipantId,
  onDownloadCertificate,
  onShare,
}: QuizResultsProps) {
  const sortedParticipants = [...participants].sort(
    (a, b) => b.total_score - a.total_score
  );
  const top3 = sortedParticipants.slice(0, 3);
  const currentParticipant = participants.find((p) => p.id === currentParticipantId);
  const currentRank =
    sortedParticipants.findIndex((p) => p.id === currentParticipantId) + 1;

  const podiumOrder = [1, 0, 2]; // Silver, Gold, Bronze positions

  return (
    <div className="flex flex-col items-center py-8 px-4">
      {/* Confetti effect placeholder - can be enhanced with a library */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              backgroundColor: ["#FFD700", "#C0C0C0", "#CD7F32", "#FF6B6B", "#4ECDC4"][
                Math.floor(Math.random() * 5)
              ],
              borderRadius: Math.random() > 0.5 ? "50%" : "0",
            }}
          />
        ))}
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">{quizTitle}</h1>
      <p className="text-muted-foreground mb-8">Final Results</p>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 mb-8">
        {podiumOrder.map((position) => {
          const participant = top3[position];
          if (!participant) return null;

          const rank = position + 1;
          const isFirst = rank === 1;
          const isSecond = rank === 2;
          const isThird = rank === 3;
          const isCurrent = participant.id === currentParticipantId;

          return (
            <div
              key={participant.id}
              className={cn(
                "flex flex-col items-center",
                isFirst && "order-2",
                isSecond && "order-1",
                isThird && "order-3"
              )}
            >
              {/* Medal icon */}
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-2",
                  isFirst && "bg-yellow-500",
                  isSecond && "bg-gray-400",
                  isThird && "bg-amber-600"
                )}
              >
                {isFirst && <Trophy className="h-8 w-8 text-white" />}
                {isSecond && <Medal className="h-8 w-8 text-white" />}
                {isThird && <Award className="h-8 w-8 text-white" />}
              </div>

              {/* Name */}
              <p
                className={cn(
                  "font-semibold text-center max-w-24 truncate",
                  isCurrent && "text-primary"
                )}
              >
                {participant.participant_name}
              </p>

              {/* Score */}
              <p className="text-sm text-muted-foreground">
                {participant.total_score} pts
              </p>

              {/* Podium block */}
              <div
                className={cn(
                  "w-24 mt-2 rounded-t-lg flex items-center justify-center",
                  isFirst && "h-32 bg-gradient-to-b from-yellow-400 to-yellow-600",
                  isSecond && "h-24 bg-gradient-to-b from-gray-300 to-gray-500",
                  isThird && "h-20 bg-gradient-to-b from-amber-500 to-amber-700"
                )}
              >
                <span className="text-4xl font-bold text-white">{rank}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current user's result (if not in top 3) */}
      {currentParticipant && currentRank > 3 && (
        <Card className="w-full max-w-md mb-6">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">Your Result</p>
              <p className="text-2xl font-bold text-primary">
                #{currentRank} of {participants.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-2xl font-bold">{currentParticipant.total_score}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions for winners */}
      {currentRank <= 3 && currentParticipant && (
        <div className="flex gap-4 mb-8">
          {onDownloadCertificate && (
            <Button onClick={onDownloadCertificate} className="gap-2">
              <Download className="h-4 w-4" />
              Download Certificate
            </Button>
          )}
          {onShare && (
            <Button variant="outline" onClick={onShare} className="gap-2">
              <Share2 className="h-4 w-4" />
              Share Result
            </Button>
          )}
        </div>
      )}

      {/* Full leaderboard */}
      <div className="w-full max-w-md">
        <h3 className="font-semibold mb-4">Full Leaderboard</h3>
        <div className="space-y-2">
          {sortedParticipants.slice(3).map((participant, index) => {
            const rank = index + 4;
            const isCurrent = participant.id === currentParticipantId;

            return (
              <div
                key={participant.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border bg-card",
                  isCurrent && "ring-2 ring-primary"
                )}
              >
                <span className="w-8 text-center text-muted-foreground font-medium">
                  {rank}
                </span>
                <span className="flex-1 truncate">
                  {participant.participant_name}
                  {isCurrent && " (You)"}
                </span>
                <span className="font-semibold">{participant.total_score}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

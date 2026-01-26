import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Download, Share2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConfettiEffect } from "./ConfettiEffect";

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>({});

  const sortedParticipants = [...participants].sort(
    (a, b) => b.total_score - a.total_score
  );
  const top3 = sortedParticipants.slice(0, 3);
  const currentParticipant = participants.find((p) => p.id === currentParticipantId);
  const currentRank =
    sortedParticipants.findIndex((p) => p.id === currentParticipantId) + 1;

  const podiumOrder = [1, 0, 2]; // Silver, Gold, Bronze positions

  // Trigger confetti for top 3 finishers
  useEffect(() => {
    if (currentRank > 0 && currentRank <= 3) {
      setTimeout(() => setShowConfetti(true), 500);
    }
  }, [currentRank]);

  // Animate scores counting up
  useEffect(() => {
    participants.forEach((p, index) => {
      const duration = 1500;
      const steps = 60;
      const increment = p.total_score / steps;
      let current = 0;

      const interval = setInterval(() => {
        current += increment;
        if (current >= p.total_score) {
          current = p.total_score;
          clearInterval(interval);
        }
        setAnimatedScores(prev => ({ ...prev, [p.id]: Math.round(current) }));
      }, duration / steps);

      setTimeout(() => {
        return () => clearInterval(interval);
      }, index * 100);
    });
  }, [participants]);

  return (
    <div className="flex flex-col items-center py-8 px-4 relative">
      {/* Confetti effect */}
      <ConfettiEffect 
        trigger={showConfetti} 
        type={currentRank === 1 ? "celebration" : "success"} 
      />

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6 sm:mb-8 px-2"
      >
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-yellow-500 animate-pulse" />
          <span className="break-words">{quizTitle}</span>
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-yellow-500 animate-pulse" />
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Final Results</p>
      </motion.div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 px-2">
        {podiumOrder.map((position) => {
          const participant = top3[position];
          if (!participant) return null;

          const rank = position + 1;
          const isFirst = rank === 1;
          const isSecond = rank === 2;
          const isThird = rank === 3;
          const isCurrent = participant.id === currentParticipantId;

          return (
            <motion.div
              key={participant.id}
              className={cn(
                "flex flex-col items-center",
                isFirst && "order-2",
                isSecond && "order-1",
                isThird && "order-3"
              )}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + position * 0.2, type: "spring", stiffness: 100 }}
            >
              {/* Medal icon */}
              <motion.div
                className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-1.5 sm:mb-2 shadow-lg",
                  isFirst && "bg-gradient-to-br from-yellow-400 to-yellow-600",
                  isSecond && "bg-gradient-to-br from-gray-300 to-gray-500",
                  isThird && "bg-gradient-to-br from-amber-400 to-amber-600"
                )}
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.5 + position * 0.2, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.1, rotate: 360 }}
              >
                {isFirst && <Trophy className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />}
                {isSecond && <Medal className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />}
                {isThird && <Award className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />}
              </motion.div>

              {/* Name */}
              <p
                className={cn(
                  "text-xs sm:text-sm font-semibold text-center max-w-16 sm:max-w-20 md:max-w-24 truncate",
                  isCurrent && "text-primary"
                )}
              >
                {participant.participant_name}
              </p>

              {/* Score */}
              <motion.p 
                className="text-[10px] sm:text-xs md:text-sm font-bold text-foreground"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + position * 0.2, type: "spring" }}
              >
                {animatedScores[participant.id] || 0} pts
              </motion.p>

              {/* Podium block */}
              <div
                className={cn(
                  "w-16 sm:w-20 md:w-24 mt-1.5 sm:mt-2 rounded-t-lg flex items-center justify-center",
                  isFirst && "h-24 sm:h-28 md:h-32 bg-gradient-to-b from-yellow-400 to-yellow-600",
                  isSecond && "h-18 sm:h-20 md:h-24 bg-gradient-to-b from-gray-300 to-gray-500",
                  isThird && "h-16 sm:h-18 md:h-20 bg-gradient-to-b from-amber-500 to-amber-700"
                )}
              >
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{rank}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Current user's result (if not in top 3) */}
      {currentParticipant && currentRank > 3 && (
        <Card className="w-full max-w-md mb-4 sm:mb-6 mx-2">
          <CardContent className="flex items-center justify-between p-3 sm:p-4">
            <div>
              <p className="text-sm sm:text-base font-semibold">Your Result</p>
              <p className="text-xl sm:text-2xl font-bold text-primary">
                #{currentRank} of {participants.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm text-muted-foreground">Score</p>
              <p className="text-xl sm:text-2xl font-bold">{currentParticipant.total_score}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions for winners */}
      {currentRank <= 3 && currentParticipant && (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8 w-full max-w-md px-2">
          {onDownloadCertificate && (
            <Button onClick={onDownloadCertificate} className="gap-1.5 sm:gap-2 text-xs sm:text-sm w-full sm:w-auto">
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              Download Certificate
            </Button>
          )}
          {onShare && (
            <Button variant="outline" onClick={onShare} className="gap-1.5 sm:gap-2 text-xs sm:text-sm w-full sm:w-auto">
              <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
              Share Result
            </Button>
          )}
        </div>
      )}

      {/* Full leaderboard */}
      <div className="w-full max-w-md px-2">
        <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Full Leaderboard</h3>
        <div className="space-y-1.5 sm:space-y-2">
          {sortedParticipants.slice(3).map((participant, index) => {
            const rank = index + 4;
            const isCurrent = participant.id === currentParticipantId;

            return (
              <div
                key={participant.id}
                className={cn(
                  "flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border bg-card",
                  isCurrent && "ring-1 sm:ring-2 ring-primary"
                )}
              >
                <span className="w-6 sm:w-8 text-center text-muted-foreground font-medium text-xs sm:text-sm">
                  {rank}
                </span>
                <span className="flex-1 truncate text-xs sm:text-sm">
                  {participant.participant_name}
                  {isCurrent && " (You)"}
                </span>
                <span className="font-semibold text-xs sm:text-sm">{participant.total_score}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

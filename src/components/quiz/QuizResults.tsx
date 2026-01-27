import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Award, Download, Share2, Sparkles, Crown, Star, Zap, PartyPopper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConfettiEffect, fireConfetti } from "./ConfettiEffect";

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
  const [showCelebration, setShowCelebration] = useState(false);

  const sortedParticipants = [...participants].sort(
    (a, b) => b.total_score - a.total_score
  );
  const top3 = sortedParticipants.slice(0, 3);
  const currentParticipant = participants.find((p) => p.id === currentParticipantId);
  const currentRank =
    sortedParticipants.findIndex((p) => p.id === currentParticipantId) + 1;

  const podiumOrder = [1, 0, 2]; // Silver, Gold, Bronze positions

  // Trigger massive celebration for winners
  useEffect(() => {
    const timer1 = setTimeout(() => setShowCelebration(true), 300);
    const timer2 = setTimeout(() => {
      setShowConfetti(true);
      if (currentRank <= 3) {
        fireConfetti("celebration");
      }
    }, 800);
    const timer3 = setTimeout(() => {
      if (currentRank === 1) {
        fireConfetti("fireworks");
      }
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [currentRank]);

  // Animate scores counting up
  useEffect(() => {
    participants.forEach((p, index) => {
      const duration = 2000;
      const steps = 80;
      const increment = p.total_score / steps;
      let current = 0;

      const timeout = setTimeout(() => {
        const interval = setInterval(() => {
          current += increment;
          if (current >= p.total_score) {
            current = p.total_score;
            clearInterval(interval);
          }
          setAnimatedScores(prev => ({ ...prev, [p.id]: Math.round(current) }));
        }, duration / steps);
      }, index * 50);

      return () => clearTimeout(timeout);
    });
  }, [participants]);

  return (
    <div className="flex flex-col items-center py-8 px-4 relative overflow-hidden">
      {/* Confetti effect */}
      <ConfettiEffect 
        trigger={showConfetti} 
        type={currentRank === 1 ? "celebration" : currentRank <= 3 ? "success" : "success"} 
      />

      {/* Animated background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {showCelebration && (
          <>
            <motion.div
              className="absolute top-0 left-1/4 w-2 h-2 rounded-full bg-yellow-400"
              animate={{ y: ["-20%", "120%"], opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="absolute top-0 left-1/2 w-3 h-3 rounded-full bg-pink-400"
              animate={{ y: ["-20%", "120%"], opacity: [0, 1, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="absolute top-0 right-1/4 w-2 h-2 rounded-full bg-purple-400"
              animate={{ y: ["-20%", "120%"], opacity: [0, 1, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
            />
          </>
        )}
      </div>

      {/* Title with celebration */}
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="text-center mb-8 sm:mb-10 px-2 relative"
      >
        <motion.div
          className="flex items-center justify-center gap-2 mb-3"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <PartyPopper className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500" />
          <Crown className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-500" />
          <PartyPopper className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500 scale-x-[-1]" />
        </motion.div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
          <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
            {quizTitle}
          </span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground flex items-center justify-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          Final Results
          <Star className="h-4 w-4 text-yellow-500" />
        </p>
      </motion.div>

      {/* Podium with enhanced animations */}
      <div className="flex items-end justify-center gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10 px-2">
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
                "flex flex-col items-center relative",
                isFirst && "order-2 z-10",
                isSecond && "order-1",
                isThird && "order-3"
              )}
              initial={{ opacity: 0, y: 100, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: 0.5 + position * 0.2, 
                type: "spring", 
                stiffness: 100,
                damping: 12 
              }}
            >
              {/* Winner crown for 1st place */}
              {isFirst && (
                <motion.div
                  className="absolute -top-8 sm:-top-10"
                  initial={{ opacity: 0, y: 20, rotate: -20 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ delay: 1.2, type: "spring" }}
                >
                  <Crown className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500 drop-shadow-lg" />
                </motion.div>
              )}

              {/* Medal icon with glow effect */}
              <div className="relative">
                {isFirst && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-yellow-400/50 blur-xl"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <motion.div
                  className={cn(
                    "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:w-20 rounded-full flex items-center justify-center mb-2 shadow-xl relative",
                    isFirst && "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600",
                    isSecond && "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-500",
                    isThird && "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700"
                  )}
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.7 + position * 0.2, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.15, rotate: 10 }}
                >
                  {isFirst && <Trophy className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white drop-shadow-md" />}
                  {isSecond && <Medal className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white drop-shadow-md" />}
                  {isThird && <Award className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white drop-shadow-md" />}
                </motion.div>
              </div>

              {/* Name */}
              <motion.p
                className={cn(
                  "text-sm sm:text-base font-bold text-center max-w-20 sm:max-w-24 md:max-w-28 truncate",
                  isCurrent && "text-primary"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 + position * 0.2 }}
              >
                {participant.participant_name}
              </motion.p>

              {/* Animated Score */}
              <motion.div 
                className={cn(
                  "text-sm sm:text-base md:text-lg font-extrabold",
                  isFirst && "text-yellow-600",
                  isSecond && "text-gray-500",
                  isThird && "text-amber-600"
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + position * 0.2, type: "spring" }}
              >
                {animatedScores[participant.id] || 0} pts
              </motion.div>

              {/* Podium block */}
              <motion.div
                className={cn(
                  "w-18 sm:w-22 md:w-28 mt-2 rounded-t-xl flex items-center justify-center shadow-xl overflow-hidden relative",
                  isFirst && "h-28 sm:h-32 md:h-40 bg-gradient-to-b from-yellow-400 to-yellow-600",
                  isSecond && "h-20 sm:h-24 md:h-28 bg-gradient-to-b from-gray-300 to-gray-500",
                  isThird && "h-16 sm:h-20 md:h-24 bg-gradient-to-b from-amber-500 to-amber-700"
                )}
                initial={{ height: 0 }}
                animate={{ height: isFirst ? "10rem" : isSecond ? "7rem" : "6rem" }}
                transition={{ delay: 0.8 + position * 0.1, duration: 0.6, type: "spring" }}
              >
                {isFirst && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent"
                    animate={{ y: ["100%", "-100%"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-lg">
                  {rank}
                </span>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Winner celebration message */}
      {currentRank === 1 && currentParticipant && (
        <motion.div
          className="mb-6 sm:mb-8 px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-pink-500/20 border-2 border-yellow-500/30 shadow-xl"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1.5, type: "spring" }}
        >
          <div className="flex items-center gap-3 text-yellow-600 dark:text-yellow-400">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            >
              <Trophy className="h-8 w-8" />
            </motion.div>
            <div>
              <p className="text-lg sm:text-xl font-bold">🎉 Congratulations!</p>
              <p className="text-sm">You're the Champion!</p>
            </div>
            <Zap className="h-6 w-6 animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* Current user's result (if not in top 3) */}
      {currentParticipant && currentRank > 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card className="w-full max-w-md mb-6 sm:mb-8 mx-2 border-2 border-primary/20 shadow-lg">
            <CardContent className="flex items-center justify-between p-4 sm:p-5">
              <div>
                <p className="text-sm sm:text-base font-semibold text-muted-foreground">Your Result</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">
                  #{currentRank} <span className="text-base text-muted-foreground">of {participants.length}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm text-muted-foreground">Score</p>
                <p className="text-2xl sm:text-3xl font-bold">{currentParticipant.total_score}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Actions for winners */}
      {currentRank <= 3 && currentParticipant && (
        <motion.div 
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 w-full max-w-md px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          {onDownloadCertificate && (
            <Button 
              onClick={onDownloadCertificate} 
              className="gap-2 text-sm w-full sm:w-auto bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
              size="lg"
            >
              <Download className="h-4 w-4" />
              Download Certificate
            </Button>
          )}
          {onShare && (
            <Button 
              variant="outline" 
              onClick={onShare} 
              className="gap-2 text-sm w-full sm:w-auto border-2"
              size="lg"
            >
              <Share2 className="h-4 w-4" />
              Share Result
            </Button>
          )}
        </motion.div>
      )}

      {/* Full leaderboard */}
      <motion.div 
        className="w-full max-w-md px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Full Leaderboard
        </h3>
        <div className="space-y-2">
          {sortedParticipants.slice(3).map((participant, index) => {
            const rank = index + 4;
            const isCurrent = participant.id === currentParticipantId;

            return (
              <motion.div
                key={participant.id}
                className={cn(
                  "flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 bg-card transition-all",
                  isCurrent && "ring-2 ring-primary border-primary/30 bg-primary/5"
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8 + index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
              >
                <span className="w-8 text-center text-muted-foreground font-bold text-sm">
                  {rank}
                </span>
                <span className="flex-1 truncate text-sm sm:text-base font-medium">
                  {participant.participant_name}
                  {isCurrent && <span className="text-primary ml-1">(You)</span>}
                </span>
                <span className="font-bold text-sm sm:text-base">{participant.total_score}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

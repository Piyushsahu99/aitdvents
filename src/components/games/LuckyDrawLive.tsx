import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { fireConfetti } from "@/components/quiz/ConfettiEffect";
import { Crown, Sparkles, Trophy, User } from "lucide-react";

interface Winner {
  id: string;
  user_id: string;
  prize_rank: number;
  prize_details: { name: string; value: string } | null;
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface LuckyDrawLiveProps {
  isRevealing: boolean;
  winners: Winner[];
  participantNames: string[];
  onClose?: () => void;
}

export function LuckyDrawLive({
  isRevealing,
  winners,
  participantNames,
  onClose,
}: LuckyDrawLiveProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showingWinner, setShowingWinner] = useState(false);
  const [shuffledName, setShuffledName] = useState("");

  // Shuffle animation effect
  useEffect(() => {
    if (!isRevealing || participantNames.length === 0) return;

    let interval: NodeJS.Timeout;
    let shuffleCount = 0;
    const maxShuffles = 30;

    interval = setInterval(() => {
      const randomName = participantNames[Math.floor(Math.random() * participantNames.length)];
      setShuffledName(randomName);
      shuffleCount++;

      if (shuffleCount >= maxShuffles) {
        clearInterval(interval);
        setTimeout(() => {
          setShowingWinner(true);
          fireConfetti("celebration");
        }, 500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRevealing, participantNames]);

  // Show winners one by one
  useEffect(() => {
    if (!showingWinner || currentIndex >= winners.length) return;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      if (currentIndex < winners.length - 1) {
        fireConfetti("success");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [showingWinner, currentIndex, winners.length]);

  if (!isRevealing && winners.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <Card className="w-full max-w-lg overflow-hidden">
        <CardContent className="p-6 sm:p-8 text-center">
          {/* Shuffling animation */}
          {isRevealing && !showingWinner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center gap-2 text-primary">
                <Sparkles className="h-6 w-6 animate-pulse" />
                <span className="text-lg font-semibold">Selecting Winner...</span>
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>

              <motion.div
                className="text-3xl sm:text-4xl font-bold p-6 rounded-2xl bg-gradient-to-r from-primary/20 to-purple-500/20 border-2 border-primary/30"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 0.1, repeat: Infinity }}
              >
                {shuffledName || "..."}
              </motion.div>

              <div className="flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-primary"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Winner reveal */}
          {showingWinner && (
            <AnimatePresence mode="wait">
              {winners.slice(0, currentIndex + 1).map((winner, index) => (
                <motion.div
                  key={winner.id}
                  initial={{ scale: 0, rotateY: 180 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`space-y-4 ${index < currentIndex ? "opacity-50" : ""}`}
                >
                  {index === currentIndex && (
                    <>
                      {/* Winner badge */}
                      <div className="flex justify-center">
                        <div className="relative">
                          <motion.div
                            className="p-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                          >
                            {winner.prize_rank === 1 ? (
                              <Crown className="h-12 w-12 text-white" />
                            ) : (
                              <Trophy className="h-12 w-12 text-white" />
                            )}
                          </motion.div>
                          <motion.div
                            className="absolute -top-2 -right-2 text-2xl"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          >
                            🎉
                          </motion.div>
                        </div>
                      </div>

                      {/* Rank */}
                      <p className="text-lg text-muted-foreground">
                        {winner.prize_rank === 1 ? "1st Place Winner!" : 
                         winner.prize_rank === 2 ? "2nd Place!" :
                         winner.prize_rank === 3 ? "3rd Place!" :
                         `${winner.prize_rank}th Place!`}
                      </p>

                      {/* Avatar and name */}
                      <div className="flex flex-col items-center gap-3">
                        <Avatar className="h-20 w-20 border-4 border-yellow-400">
                          {winner.profile?.avatar_url ? (
                            <img src={winner.profile.avatar_url} alt="" />
                          ) : (
                            <AvatarFallback className="bg-primary/20 text-2xl">
                              <User className="h-10 w-10" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                          {winner.profile?.full_name || "Lucky Winner"}
                        </h2>
                      </div>

                      {/* Prize */}
                      {winner.prize_details && (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                          <p className="text-sm text-muted-foreground mb-1">Prize Won</p>
                          <p className="text-xl font-bold">{winner.prize_details.name}</p>
                          {winner.prize_details.value && (
                            <p className="text-lg text-yellow-600 dark:text-yellow-400">
                              {winner.prize_details.value}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Close button */}
          {showingWinner && currentIndex >= winners.length - 1 && onClose && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6"
            >
              <Button onClick={onClose} size="lg">
                Close
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

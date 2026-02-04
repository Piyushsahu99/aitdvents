import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, Trophy, X, Coins } from "lucide-react";

interface SpinWheelResultProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    label: string;
    prize_type: string;
    prize_value: number;
    is_jackpot: boolean;
  } | null;
}

export function SpinWheelResult({ isOpen, onClose, result }: SpinWheelResultProps) {
  if (!result) return null;

  const isWin = result.prize_type !== "nothing" && result.prize_value > 0;
  const isJackpot = result.is_jackpot;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background card */}
            <div className={`rounded-3xl p-6 text-center ${
              isJackpot 
                ? "bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500" 
                : isWin 
                  ? "bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500"
                  : "bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800"
            }`}>
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>

              {/* Icon */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <div className={`inline-flex p-4 rounded-full ${
                  isJackpot 
                    ? "bg-yellow-300/30" 
                    : isWin 
                      ? "bg-white/20" 
                      : "bg-gray-500/30"
                }`}>
                  {isJackpot ? (
                    <Trophy className="h-12 w-12 text-yellow-100" />
                  ) : isWin ? (
                    <Gift className="h-12 w-12 text-white" />
                  ) : (
                    <Sparkles className="h-12 w-12 text-gray-300" />
                  )}
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-2xl sm:text-3xl font-bold text-white mb-2"
              >
                {isJackpot ? "🎉 JACKPOT! 🎉" : isWin ? "You Won!" : "Try Again!"}
              </motion.h2>

              {/* Prize */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-6"
              >
                <p className="text-lg text-white/80 mb-2">{result.label}</p>
                {isWin && (
                  <div className="flex items-center justify-center gap-2 text-3xl font-bold text-white">
                    <Coins className="h-8 w-8 text-yellow-300" />
                    <span>+{result.prize_value}</span>
                  </div>
                )}
              </motion.div>

              {/* Animated sparkles for jackpot */}
              {isJackpot && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-yellow-200 rounded-full"
                      initial={{
                        x: "50%",
                        y: "50%",
                        opacity: 0,
                      }}
                      animate={{
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Action button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={onClose}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                  size="lg"
                >
                  {isWin ? "Claim & Continue" : "Spin Again"}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakIndicatorProps {
  streak: number;
  showBonus?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StreakIndicator({ streak, showBonus = true, size = "md" }: StreakIndicatorProps) {
  if (streak < 2) return null;

  const sizeClasses = {
    sm: "text-xs gap-1 px-2 py-0.5",
    md: "text-sm gap-1.5 px-3 py-1",
    lg: "text-base gap-2 px-4 py-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const getStreakColor = () => {
    if (streak >= 10) return "from-red-500 to-orange-500";
    if (streak >= 5) return "from-orange-500 to-yellow-500";
    if (streak >= 3) return "from-yellow-500 to-amber-500";
    return "from-amber-500 to-yellow-600";
  };

  const getBonusMultiplier = () => {
    if (streak >= 10) return 2.0;
    if (streak >= 7) return 1.75;
    if (streak >= 5) return 1.5;
    if (streak >= 3) return 1.25;
    return 1.0;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="inline-flex items-center"
      >
        <motion.div
          className={cn(
            "inline-flex items-center rounded-full font-bold text-white bg-gradient-to-r shadow-lg",
            sizeClasses[size],
            getStreakColor()
          )}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 1 }}
          >
            <Flame className={cn(iconSizes[size], "drop-shadow-md")} />
          </motion.div>
          <span>{streak} Streak!</span>
          
          {showBonus && getBonusMultiplier() > 1 && (
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center ml-1"
            >
              <Zap className={cn(iconSizes[size], "text-white")} />
              <span className="text-white/90">{getBonusMultiplier()}x</span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Compact streak badge for leaderboards
export function StreakBadge({ streak }: { streak: number }) {
  if (streak < 2) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-[10px] font-bold"
    >
      <Flame className="h-2.5 w-2.5" />
      {streak}
    </motion.div>
  );
}

// Achievement unlock animation
export function StreakMilestone({ streak }: { streak: number }) {
  const milestones = [3, 5, 7, 10, 15, 20];
  const isMilestone = milestones.includes(streak);

  if (!isMilestone) return null;

  return (
    <motion.div
      initial={{ scale: 0, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0, y: -20 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 text-white shadow-2xl"
      >
        <div className="relative">
          <Star className="h-10 w-10 fill-yellow-300 text-yellow-300" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-white/50"
          />
        </div>
        <div>
          <p className="font-bold text-lg">🔥 {streak} Streak!</p>
          <p className="text-sm text-white/80">Amazing! Keep it up!</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

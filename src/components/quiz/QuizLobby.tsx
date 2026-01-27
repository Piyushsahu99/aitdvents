import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Loader2, Trophy, Sparkles, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { fireConfetti } from "./ConfettiEffect";

interface QuizLobbyProps {
  title: string;
  description?: string | null;
  participantCount: number;
  participantNames: string[];
  isJoined: boolean;
  maxParticipants?: number | null;
}

export function QuizLobby({
  title,
  description,
  participantCount,
  participantNames,
  isJoined,
  maxParticipants,
}: QuizLobbyProps) {
  const prevCount = useRef(participantCount);

  // Fire confetti when new player joins
  useEffect(() => {
    if (participantCount > prevCount.current) {
      fireConfetti("playerJoined");
    }
    prevCount.current = participantCount;
  }, [participantCount]);

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/20"
            style={{ left: `${10 + i * 15}%`, top: "20%" }}
            animate={{
              y: ["0%", "300%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Animated waiting indicator */}
      <div className="relative mb-8">
        <motion.div 
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 absolute -inset-2"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div 
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 absolute -inset-1"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        />
        <motion.div 
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center relative shadow-2xl shadow-primary/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Users className="h-12 w-12 sm:h-14 sm:w-14 text-white" />
        </motion.div>
        
        {/* Sparkle effects */}
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="h-6 w-6 text-yellow-400" />
        </motion.div>
      </div>

      {/* Title */}
      <motion.h1 
        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 px-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h1>
      {description && (
        <motion.p 
          className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {description}
        </motion.p>
      )}

      {/* Participant count with animation */}
      <motion.div 
        className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl md:text-3xl font-bold mb-3 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-2 border-primary/20 shadow-xl"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span 
            className="text-primary font-extrabold text-3xl sm:text-4xl md:text-5xl"
            key={participantCount}
            initial={{ scale: 2, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            {participantCount}
          </motion.span>
        </AnimatePresence>
        <span className="text-base sm:text-lg md:text-xl text-muted-foreground flex items-center gap-1">
          {maxParticipants ? `/ ${maxParticipants}` : ""} 
          <Users className="inline h-5 w-5 sm:h-6 sm:w-6" />
        </span>
      </motion.div>

      {/* Status message */}
      <motion.div 
        className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
        <span>Waiting for host to start...</span>
      </motion.div>

      {/* Participant names with staggered animation */}
      {participantNames.length > 0 && (
        <motion.div 
          className="w-full max-w-2xl overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-wrap gap-2 justify-center">
            <AnimatePresence>
              {participantNames.slice(0, 20).map((name, index) => {
                const avatarColors = [
                  "from-red-400 to-pink-500",
                  "from-blue-400 to-cyan-500",
                  "from-green-400 to-emerald-500",
                  "from-yellow-400 to-orange-500",
                  "from-purple-400 to-indigo-500",
                  "from-pink-400 to-rose-500",
                  "from-teal-400 to-cyan-500",
                ];
                const colorClass = avatarColors[index % avatarColors.length];
                
                return (
                  <motion.div
                    key={name + index}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-background to-muted/50 border-2 border-primary/20 shadow-lg"
                    initial={{ opacity: 0, scale: 0, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0, rotate: 10 }}
                    transition={{ delay: index * 0.03, type: "spring", stiffness: 300 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    layout
                  >
                    <div className={cn(
                      "w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md",
                      colorClass
                    )}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs sm:text-sm font-medium">
                      {name}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {participantNames.length > 20 && (
              <motion.span 
                className="px-4 py-2 rounded-full text-sm font-medium bg-muted text-muted-foreground border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                +{participantNames.length - 20} more
              </motion.span>
            )}
          </div>
        </motion.div>
      )}

      {/* Join confirmation */}
      {isJoined && (
        <motion.div 
          className="mt-8 sm:mt-10 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 shadow-xl shadow-green-500/10"
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.div>
            <span>✓ You're in! Get ready to play.</span>
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

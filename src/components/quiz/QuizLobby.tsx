import { motion } from "framer-motion";
import { Users, Loader2, Clock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

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
  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated waiting indicator */}
      <div className="relative mb-8">
        <motion.div 
          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 absolute"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div 
          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center relative shadow-xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Users className="h-12 w-12 text-primary" />
        </motion.div>
      </div>

      {/* Title */}
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 px-2">{title}</h1>
      {description && (
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md px-2">{description}</p>
      )}

      {/* Participant count */}
      <motion.div 
        className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-xl md:text-2xl font-bold mb-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 sm:border-2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <motion.span 
          className="text-primary font-extrabold text-2xl sm:text-3xl"
          key={participantCount}
          initial={{ scale: 1.5, color: "#22c55e" }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {participantCount}
        </motion.span>
        <span className="text-sm sm:text-base md:text-lg text-muted-foreground flex items-center gap-0.5 sm:gap-1">
          {maxParticipants ? `/ ${maxParticipants}` : ""} 
          <Users className="inline h-4 w-4 sm:h-5 sm:w-5" />
        </span>
      </motion.div>

      {/* Status message */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base text-muted-foreground mb-6 sm:mb-8">
        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
        <span>Waiting for host to start...</span>
      </div>

      {/* Participant names ticker */}
      {participantNames.length > 0 && (
        <motion.div 
          className="w-full max-w-2xl overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {participantNames.slice(0, 20).map((name, index) => {
              const avatarColors = [
                "from-red-400 to-pink-500",
                "from-blue-400 to-cyan-500",
                "from-green-400 to-emerald-500",
                "from-yellow-400 to-orange-500",
                "from-purple-400 to-indigo-500",
              ];
              const colorClass = avatarColors[index % avatarColors.length];
              
              return (
                <motion.div
                  key={index}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.05, type: "spring" }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={cn(
                    "w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[10px] sm:text-xs font-bold",
                    colorClass
                  )}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-primary">
                    {name}
                  </span>
                </motion.div>
              );
            })}
            {participantNames.length > 20 && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                +{participantNames.length - 20} more
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Join confirmation */}
      {isJoined && (
        <motion.div 
          className="mt-6 sm:mt-8 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 sm:border-2 text-green-600 font-semibold shadow-lg text-sm sm:text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring" }}
        >
          <Trophy className="inline h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
          ✓ You're in! Get ready to play.
        </motion.div>
      )}
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  className?: string;
}

export function QuizProgress({
  currentQuestion,
  totalQuestions,
  className,
}: QuizProgressProps) {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className={cn("w-full space-y-2", className)}>
      {/* Question counter */}
      <div className="flex items-center justify-between text-sm font-medium">
        <span className="text-muted-foreground">
          Question {currentQuestion} of {totalQuestions}
        </span>
        <span className="text-primary font-bold">{Math.round(progress)}%</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </motion.div>
      </div>

      {/* Question dots indicator */}
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const isCompleted = index < currentQuestion;
          const isCurrent = index === currentQuestion - 1;

          return (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "rounded-full transition-all duration-300",
                isCurrent && "w-3 h-3 bg-primary ring-2 ring-primary/30",
                isCompleted && "w-2 h-2 bg-primary/60",
                !isCompleted && !isCurrent && "w-2 h-2 bg-muted"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

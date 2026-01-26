import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QuizTimer } from "./QuizTimer";
import { Sparkles, Zap } from "lucide-react";

interface QuizQuestionProps {
  questionText: string;
  options: string[];
  timeLimit: number;
  points: number;
  imageUrl?: string | null;
  onAnswer: (optionIndex: number) => void;
  onTimeUp?: () => void;
  hasAnswered: boolean;
  selectedAnswer: number | null;
  correctAnswer?: number;
  showCorrectAnswer?: boolean;
}

const OPTION_COLORS = [
  "bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl",
  "bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl",
  "bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl",
  "bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl",
];

const OPTION_SHAPES = ["▲", "◆", "●", "■"];

export function QuizQuestion({
  questionText,
  options,
  timeLimit,
  points,
  imageUrl,
  onAnswer,
  onTimeUp,
  hasAnswered,
  selectedAnswer,
  correctAnswer,
  showCorrectAnswer = false,
}: QuizQuestionProps) {
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  // Trigger celebration on correct answer
  useEffect(() => {
    if (showCorrectAnswer && selectedAnswer === correctAnswer) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
  }, [showCorrectAnswer, selectedAnswer, correctAnswer]);

  // Keyboard shortcuts for answering
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (hasAnswered) return;
      
      const key = e.key;
      // Support both numbers (1-4) and letters (a-d)
      const keyMap: Record<string, number> = {
        '1': 0, 'a': 0,
        '2': 1, 'b': 1,
        '3': 2, 'c': 2,
        '4': 3, 'd': 3,
      };
      
      if (key in keyMap) {
        const optionIndex = keyMap[key];
        if (optionIndex < options.length) {
          e.preventDefault();
          handleAnswer(optionIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hasAnswered, options.length, handleAnswer]);

  const handleAnswer = (index: number) => {
    if (hasAnswered) return;
    setIsTimerActive(false);
    onAnswer(index);
  };

  const handleTimeUp = () => {
    setIsTimerActive(false);
    onTimeUp?.();
  };

  return (
    <motion.div 
      className="flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Celebration particles */}
      <AnimatePresence>
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ 
                  opacity: 1, 
                  x: "50%", 
                  y: "50%",
                  scale: 0
                }}
                animate={{
                  opacity: 0,
                  x: `${50 + (Math.random() - 0.5) * 100}%`,
                  y: `${50 + (Math.random() - 0.5) * 100}%`,
                  scale: Math.random() * 2 + 1,
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Keyboard hint banner */}
      {!hasAnswered && (
        <motion.div
          className="mb-2 px-3 py-1 text-xs text-muted-foreground text-center rounded-lg bg-muted/30 border border-border/50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          ⌨️ Press 1-4 or A-D to answer quickly
        </motion.div>
      )}

      {/* Header with timer and points */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <motion.div 
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          <span className="text-xs sm:text-sm font-bold text-primary">{points} pts</span>
        </motion.div>
        <QuizTimer
          seconds={timeLimit}
          onComplete={handleTimeUp}
          isActive={isTimerActive && !hasAnswered}
          size="sm"
        />
      </div>

      {/* Question */}
      <motion.div 
        className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-4 mb-4 sm:mb-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {imageUrl && (
          <motion.img
            src={imageUrl}
            alt="Question"
            className="max-h-32 sm:max-h-40 md:max-h-48 w-full rounded-lg mb-3 sm:mb-4 object-contain shadow-xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          />
        )}
        <motion.h2 
          className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold leading-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {questionText}
        </motion.h2>
      </motion.div>

      {/* Options grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = correctAnswer === index;
          const showAsCorrect = showCorrectAnswer && isCorrect;
          const showAsWrong = showCorrectAnswer && isSelected && !isCorrect;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, ease: "easeOut" }}
              whileHover={!hasAnswered ? { scale: 1.02 } : {}}
              whileTap={!hasAnswered ? { scale: 0.98 } : {}}
              style={{ willChange: "transform, opacity" }}
            >
              <Button
                onClick={() => handleAnswer(index)}
                disabled={hasAnswered}
                className={cn(
                  "min-h-[60px] h-auto sm:h-20 md:h-24 w-full text-sm sm:text-base md:text-lg lg:text-xl font-semibold relative transition-all duration-300 py-3 sm:py-4",
                  !hasAnswered && OPTION_COLORS[index % 4],
                  hasAnswered && "opacity-70",
                  isSelected && !showCorrectAnswer && "ring-2 sm:ring-4 ring-white ring-offset-1 sm:ring-offset-2 scale-[1.02] sm:scale-105",
                  showAsCorrect && "!bg-gradient-to-br !from-green-500 !to-emerald-600 ring-2 sm:ring-4 ring-green-300 animate-pulse",
                  showAsWrong && "!bg-gradient-to-br !from-red-500 !to-rose-600 ring-2 sm:ring-4 ring-red-300"
                )}
              >
                <span className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="text-lg sm:text-xl md:text-2xl opacity-70">{OPTION_SHAPES[index % 4]}</span>
                  <span className="text-[8px] sm:text-[10px] opacity-50 font-mono">{index + 1}</span>
                </span>
                <span className="pl-8 sm:pl-10 pr-2 text-left break-words">{option}</span>
                {showAsCorrect && (
                  <motion.span
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-xl sm:text-2xl"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    ✓
                  </motion.span>
                )}
                {showAsWrong && (
                  <motion.span
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-xl sm:text-2xl"
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    ✗
                  </motion.span>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {hasAnswered && !showCorrectAnswer && (
          <motion.div 
            className="text-center mt-4 text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center justify-center gap-2 animate-pulse">
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="ml-2">Waiting for time to end...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

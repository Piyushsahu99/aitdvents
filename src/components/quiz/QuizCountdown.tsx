import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sparkles } from "lucide-react";

interface QuizCountdownProps {
  seconds: number;
  questionNumber?: number;
  totalQuestions?: number;
  onComplete: () => void;
  message?: string;
}

export function QuizCountdown({
  seconds,
  questionNumber,
  totalQuestions,
  onComplete,
  message = "Get Ready!",
}: QuizCountdownProps) {
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/90 via-purple-600/90 to-pink-600/90 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
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

      <div className="text-center text-white relative">
        {/* Question number indicator */}
        {questionNumber && totalQuestions && (
          <motion.div
            className="mb-6 text-xl font-medium opacity-80"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 0.8 }}
          >
            Question {questionNumber} of {totalQuestions}
          </motion.div>
        )}

        {/* Message */}
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 flex items-center justify-center gap-3"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Zap className="h-8 w-8 sm:h-10 sm:w-10 animate-pulse" />
          {message}
          <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 animate-pulse" />
        </motion.h2>

        {/* Countdown number */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-8 border-white/30"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          
          {/* Inner pulsing ring */}
          <motion.div
            className="absolute inset-4 rounded-full border-4 border-white/50"
            animate={{ scale: [1, 1.15, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />

          {/* Center number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={count}
                className="text-8xl sm:text-9xl md:text-[10rem] font-black"
                initial={{ scale: 2, opacity: 0, rotateY: 90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotateY: -90 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ textShadow: "0 4px 30px rgba(0,0,0,0.3)" }}
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom hint */}
        <motion.p
          className="mt-8 text-lg opacity-70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.5 }}
        >
          Starting in {count} second{count !== 1 ? "s" : ""}...
        </motion.p>
      </div>
    </motion.div>
  );
}

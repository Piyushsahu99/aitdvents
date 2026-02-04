import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LiveLeaderboard } from "@/components/quiz/LiveLeaderboard";
import { 
  Maximize2, 
  Minimize2, 
  Users, 
  Timer, 
  Trophy,
  Volume2,
  VolumeX,
  Zap,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  participant_name: string;
  total_score: number;
  final_rank: number | null;
}

interface PresentationModeProps {
  quizCode: string;
  quizUrl: string;
  title: string;
  status: string;
  currentQuestionIdx: number;
  totalQuestions: number;
  currentQuestion?: {
    question_text: string;
    options: string[];
    time_limit_seconds: number;
    points: number;
  } | null;
  participants: Participant[];
  participantCount: number;
  timeRemaining?: number;
  onClose: () => void;
}

const OPTION_COLORS = [
  "from-red-500 to-red-600",
  "from-blue-500 to-blue-600",
  "from-yellow-500 to-yellow-600",
  "from-green-500 to-green-600",
];

export function PresentationMode({
  quizCode,
  quizUrl,
  title,
  status,
  currentQuestionIdx,
  totalQuestions,
  currentQuestion,
  participants,
  participantCount,
  timeRemaining,
  onClose,
}: PresentationModeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showParticles, setShowParticles] = useState(true);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const isLobby = status === "waiting" || status === "draft";
  const isQuestionActive = status === "question_active";
  const isQuestionEnded = status === "question_ended";
  const isCompleted = status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      {/* Background particles */}
      {showParticles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white/10"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-white/70 hover:text-white hover:bg-white/10"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white/70 hover:text-white hover:bg-white/10"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/70 hover:text-white hover:bg-white/10"
          onClick={onClose}
        >
          Exit
        </Button>
      </div>

      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <div className="flex items-center gap-3 mt-2">
          <Badge className="bg-white/20 text-white border-white/30">
            <Users className="h-3 w-3 mr-1" />
            {participantCount} players
          </Badge>
          {!isLobby && !isCompleted && (
            <Badge className="bg-primary/80 text-white">
              Q{currentQuestionIdx + 1}/{totalQuestions}
            </Badge>
          )}
        </div>
      </div>

      <div className="h-full flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {/* Lobby View */}
          {isLobby && (
            <motion.div
              key="lobby"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-8"
              >
                <Sparkles className="h-20 w-20 text-yellow-400 mx-auto mb-4" />
              </motion.div>
              
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Join the Quiz!
              </h2>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-12">
                <div className="p-6 bg-white rounded-2xl shadow-2xl">
                  <QRCodeSVG value={quizUrl} size={200} level="H" />
                </div>
                
                <div className="text-left">
                  <p className="text-xl text-white/70 mb-2">Or enter code:</p>
                  <div className="text-6xl md:text-8xl font-mono font-bold text-white tracking-wider">
                    {quizCode}
                  </div>
                  <p className="text-lg text-white/50 mt-4">at {window.location.origin}/quiz</p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12"
              >
                <p className="text-2xl text-white/80">
                  <span className="text-4xl font-bold text-yellow-400">{participantCount}</span> players joined
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Question View */}
          {(isQuestionActive || isQuestionEnded) && currentQuestion && (
            <motion.div
              key="question"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="w-full max-w-5xl"
            >
              {/* Timer */}
              {isQuestionActive && timeRemaining !== undefined && (
                <div className="absolute top-1/2 right-8 -translate-y-1/2">
                  <motion.div
                    className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white",
                      timeRemaining <= 5 ? "bg-red-500" : "bg-white/20"
                    )}
                    animate={timeRemaining <= 5 ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: timeRemaining <= 5 ? Infinity : 0 }}
                  >
                    {timeRemaining}
                  </motion.div>
                </div>
              )}

              {/* Question */}
              <div className="text-center mb-12">
                <p className="text-3xl md:text-5xl font-bold text-white leading-tight">
                  {currentQuestion.question_text}
                </p>
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                    <Timer className="h-4 w-4 mr-2" />
                    {currentQuestion.time_limit_seconds}s
                  </Badge>
                  <Badge className="bg-yellow-500/80 text-white text-lg px-4 py-2">
                    <Zap className="h-4 w-4 mr-2" />
                    {currentQuestion.points} pts
                  </Badge>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((option, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "p-6 rounded-2xl bg-gradient-to-br text-white font-bold text-xl md:text-2xl flex items-center gap-4",
                      OPTION_COLORS[idx]
                    )}
                  >
                    <span className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Results View */}
          {isCompleted && (
            <motion.div
              key="results"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-2xl text-center"
            >
              <Trophy className="h-24 w-24 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-5xl font-bold text-white mb-8">Final Results</h2>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <LiveLeaderboard participants={participants} showTop={10} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

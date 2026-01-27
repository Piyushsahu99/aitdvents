import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuizLobby } from "@/components/quiz/QuizLobby";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import { QuizResults } from "@/components/quiz/QuizResults";
import { QuizJoinCard } from "@/components/quiz/QuizJoinCard";
import { useQuizByCode, useQuizRealtime } from "@/hooks/useQuizRealtime";
import { useQuizParticipant } from "@/hooks/useQuizParticipant";
import { fireConfetti } from "@/components/quiz/ConfettiEffect";
import { 
  Gamepad2, 
  Loader2, 
  Sparkles, 
  Trophy, 
  Zap, 
  Users, 
  Timer,
  ArrowRight,
  Crown,
  Target,
  Gavel,
  Dice1,
  CircleDot
} from "lucide-react";

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const codeFromUrl = searchParams.get("code");
  const prevParticipantCount = useRef(0);

  const [inputCode, setInputCode] = useState(codeFromUrl || "");
  const [activeCode, setActiveCode] = useState(codeFromUrl || "");

  const { quiz, isLoading: isLoadingQuiz, error: quizError } = useQuizByCode(activeCode);
  const { participants, participantCount } = useQuizRealtime(quiz?.id || null);
  const {
    participant,
    currentQuestion,
    hasAnswered,
    selectedAnswer,
    isJoining,
    joinQuiz,
    fetchCurrentQuestion,
    submitAnswer,
  } = useQuizParticipant(quiz?.id || null);

  // Trigger confetti when new participant joins
  useEffect(() => {
    if (participantCount > prevParticipantCount.current && prevParticipantCount.current > 0) {
      fireConfetti("playerJoined");
    }
    prevParticipantCount.current = participantCount;
  }, [participantCount]);

  // Fetch current question when quiz status changes
  useEffect(() => {
    if (quiz?.status === "question_active" || quiz?.status === "question_ended") {
      fetchCurrentQuestion(quiz.current_question_idx);
    }
  }, [quiz?.status, quiz?.current_question_idx, fetchCurrentQuestion]);

  const handleCodeSubmit = () => {
    if (inputCode.trim()) {
      setActiveCode(inputCode.trim().toUpperCase());
      navigate(`/quiz?code=${inputCode.trim().toUpperCase()}`, { replace: true });
    }
  };

  const quizUrl = `${window.location.origin}/quiz?code=${quiz?.quiz_code || activeCode}`;

  // Game options for the games hub
  const gameOptions = [
    {
      id: "quiz",
      icon: Gamepad2,
      title: "Live Quiz",
      description: "Real-time trivia battles with prizes",
      gradient: "from-purple-500 to-pink-500",
      available: true,
      badge: "Popular",
    },
    {
      id: "ipl-auction",
      icon: Gavel,
      title: "IPL Auction",
      description: "Build your dream cricket team",
      gradient: "from-blue-500 to-cyan-500",
      available: false,
      badge: "Coming Soon",
    },
    {
      id: "spin-wheel",
      icon: CircleDot,
      title: "Spin & Win",
      description: "Lucky wheel with instant rewards",
      gradient: "from-orange-500 to-amber-500",
      available: false,
      badge: "Coming Soon",
    },
    {
      id: "prediction",
      icon: Target,
      title: "Predictions",
      description: "Predict outcomes & win big",
      gradient: "from-green-500 to-emerald-500",
      available: false,
      badge: "Coming Soon",
    },
  ];

  // No code entered yet - Show Games Hub
  if (!activeCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navbar />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="relative">
                <Gamepad2 className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-primary" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                </motion.div>
              </div>
            </motion.div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Games Arena
              </span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              Play exciting games, compete with friends, and win amazing rewards!
            </p>
          </motion.div>

          {/* Join Quiz Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto mb-10 sm:mb-14"
          >
            <Card className="relative overflow-hidden border-2 border-primary/20 shadow-xl shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
              <CardHeader className="relative pb-4 sm:pb-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mb-3">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Join a Live Quiz</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Enter the code to start playing</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-3 sm:space-y-4 pb-6">
                <div className="relative">
                  <Input
                    placeholder="ABC123"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleCodeSubmit()}
                    className="text-center text-xl sm:text-2xl font-mono tracking-[0.3em] h-14 sm:h-16 border-2 focus:border-primary bg-background/80 backdrop-blur-sm"
                    maxLength={6}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-md pointer-events-none"
                    animate={{ 
                      boxShadow: inputCode ? ["0 0 0 0 rgba(249, 115, 22, 0)", "0 0 0 4px rgba(249, 115, 22, 0.1)", "0 0 0 0 rgba(249, 115, 22, 0)"] : "none"
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <Button
                  onClick={handleCodeSubmit}
                  disabled={!inputCode.trim()}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                  size="lg"
                >
                  <span>Join Quiz</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Games Grid */}
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center">
              <Crown className="inline h-5 w-5 text-yellow-500 mr-2" />
              All Games
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {gameOptions.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card 
                    className={`relative overflow-hidden h-full transition-all duration-300 ${
                      game.available 
                        ? "cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-primary/50" 
                        : "opacity-70"
                    }`}
                    onClick={() => game.available && game.id === "quiz" && document.querySelector<HTMLInputElement>('input')?.focus()}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-10`} />
                    <CardContent className="relative p-4 sm:p-5 flex flex-col items-center text-center">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${game.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                        <game.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <Badge 
                        className={`mb-2 text-[10px] ${
                          game.available 
                            ? "bg-green-500/20 text-green-600 border-green-500/30" 
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {game.badge}
                      </Badge>
                      <h3 className="font-semibold text-sm sm:text-base mb-1">{game.title}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{game.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto"
          >
            {[
              { icon: Users, value: "10K+", label: "Players" },
              { icon: Trophy, value: "500+", label: "Quizzes" },
              { icon: Sparkles, value: "₹50K+", label: "Won" },
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className="text-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border"
              >
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 text-primary" />
                <div className="text-lg sm:text-xl font-bold">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading quiz
  if (isLoadingQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navbar />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-12 w-12 sm:h-14 sm:w-14 text-primary" />
          </motion.div>
          <motion.p 
            className="text-sm sm:text-base text-muted-foreground mt-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Finding your quiz...
          </motion.p>
        </div>
      </div>
    );
  }

  // Quiz not found
  if (quizError || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/5">
        <Navbar />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Gamepad2 className="h-10 w-10 text-destructive" />
            </div>
          </motion.div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Quiz Not Found</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md px-2">
            The quiz code "<span className="font-mono font-bold">{activeCode}</span>" doesn't exist or has ended.
          </p>
          <Button
            variant="outline"
            className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base"
            onClick={() => {
              setActiveCode("");
              setInputCode("");
              navigate("/quiz", { replace: true });
            }}
          >
            Try Another Code
          </Button>
        </div>
      </div>
    );
  }

  // Quiz is in draft mode
  if (quiz.status === "draft") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navbar />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Timer className="h-16 w-16 text-muted-foreground mb-4" />
          </motion.div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 px-2">{quiz.title}</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">This quiz hasn't started yet. Check back soon!</p>
        </div>
      </div>
    );
  }

  // Quiz is waiting - show lobby or join form
  if (quiz.status === "waiting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navbar />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <AnimatePresence mode="wait">
            {!participant ? (
              <motion.div
                key="join"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <QuizJoinCard
                  quizCode={quiz.quiz_code}
                  quizUrl={quizUrl}
                  onJoin={joinQuiz}
                  isJoining={isJoining}
                  isJoined={!!participant}
                  mode="join"
                />
              </motion.div>
            ) : (
              <motion.div
                key="lobby"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <QuizLobby
                  title={quiz.title}
                  description={quiz.description}
                  participantCount={participantCount}
                  participantNames={participants.map((p) => p.participant_name)}
                  isJoined={!!participant}
                  maxParticipants={quiz.max_participants}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Quiz is active with question
  if (quiz.status === "question_active" || quiz.status === "question_ended") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navbar />
        <div className="container mx-auto px-2 sm:px-3 md:px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
          <AnimatePresence mode="wait">
            {currentQuestion ? (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <QuizQuestion
                  questionText={currentQuestion.question_text}
                  options={currentQuestion.options as string[]}
                  timeLimit={currentQuestion.time_limit_seconds}
                  points={currentQuestion.points}
                  imageUrl={currentQuestion.image_url}
                  onAnswer={submitAnswer}
                  hasAnswered={hasAnswered}
                  selectedAnswer={selectedAnswer}
                  correctAnswer={
                    quiz.status === "question_ended" ? currentQuestion.correct_option_index : undefined
                  }
                  showCorrectAnswer={quiz.status === "question_ended"}
                />
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Quiz is completed - show results
  if (quiz.status === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-yellow-500/5 to-primary/5">
        <Navbar />
        <div className="container mx-auto px-2 sm:px-3 md:px-4 py-4 sm:py-6 md:py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <QuizResults
              quizTitle={quiz.title}
              participants={participants}
              currentParticipantId={participant?.id}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz is active (between questions)
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <Zap className="h-12 w-12 sm:h-14 sm:w-14 text-primary mb-4" />
        </motion.div>
        <motion.p 
          className="text-lg sm:text-xl font-semibold px-2"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          Get ready for the next question...
        </motion.p>
        {participant && (
          <motion.div 
            className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm sm:text-base text-muted-foreground">
              Your score: <span className="font-bold text-xl text-primary">{participant.total_score}</span>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

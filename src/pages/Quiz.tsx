import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import { supabase } from "@/integrations/supabase/client";
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
  Gift,
  Star
} from "lucide-react";

interface ArenaStats {
  totalPlayers: number;
  totalQuizzes: number;
  totalCoinsWon: number;
}

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const codeFromUrl = searchParams.get("code");
  const prevParticipantCount = useRef(0);

  const [inputCode, setInputCode] = useState(codeFromUrl || "");
  const [activeCode, setActiveCode] = useState(codeFromUrl || "");
  const [arenaStats, setArenaStats] = useState<ArenaStats>({
    totalPlayers: 0,
    totalQuizzes: 0,
    totalCoinsWon: 0,
  });

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

  // Fetch real arena stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [profilesRes, quizzesRes, coinsRes] = await Promise.all([
          supabase.from("student_profiles").select("id", { count: "exact", head: true }),
          supabase.from("quizzes").select("id", { count: "exact", head: true }),
          supabase.from("points_transactions").select("amount").gt("amount", 0),
        ]);

        const totalCoins = coinsRes.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

        setArenaStats({
          totalPlayers: profilesRes.count || 0,
          totalQuizzes: quizzesRes.count || 0,
          totalCoinsWon: totalCoins,
        });
      } catch (error) {
        console.error("Failed to fetch arena stats:", error);
      }
    };

    fetchStats();
  }, []);

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

  // Format number with suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
    return num.toString();
  };

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
      badgeColor: "bg-green-500/20 text-green-600 border-green-500/30",
      link: null,
    },
    {
      id: "ipl-auction",
      icon: Gavel,
      title: "IPL Auction",
      description: "Build your dream cricket team",
      gradient: "from-blue-500 to-cyan-500",
      available: true,
      badge: "New",
      badgeColor: "bg-blue-500/20 text-blue-600 border-blue-500/30",
      link: "/ipl-auction",
    },
    {
      id: "spin-wheel",
      icon: Gift,
      title: "Spin & Win",
      description: "Lucky wheel with instant rewards",
      gradient: "from-orange-500 to-amber-500",
      available: true,
      badge: "New",
      badgeColor: "bg-orange-500/20 text-orange-600 border-orange-500/30",
      link: "/spin-wheel",
    },
    {
      id: "lucky-draw",
      icon: Target,
      title: "Lucky Draw",
      description: "Fair random draws & win big",
      gradient: "from-green-500 to-emerald-500",
      available: true,
      badge: "New",
      badgeColor: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
      link: "/lucky-draw",
    },
  ];

  // No code entered yet - Show Games Hub
  if (!activeCode) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-primary/5 py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-6 sm:mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 mb-3"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="relative">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-purple-500 shadow-lg shadow-primary/25">
                  <Gamepad2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                </motion.div>
              </div>
            </motion.div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Games Arena
              </span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              Play exciting games, compete with friends, and win amazing rewards!
            </p>
          </motion.div>

          {/* Join Quiz Card - Featured */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto mb-8 sm:mb-12"
          >
            <Card className="relative overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
              <CardHeader className="relative pb-4 text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mb-3 shadow-lg">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Join a Live Quiz</CardTitle>
                <CardDescription className="text-sm">Enter the 6-digit code to start playing</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-4 pb-6">
                <div className="relative">
                  <Input
                    placeholder="ABC123"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleCodeSubmit()}
                    className="text-center text-2xl sm:text-3xl font-mono tracking-[0.4em] h-16 sm:h-18 border-2 focus:border-primary bg-background/80 backdrop-blur-sm uppercase"
                    maxLength={6}
                  />
                  {inputCode && (
                    <motion.div
                      className="absolute inset-0 rounded-md pointer-events-none border-2 border-primary"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
                <Button
                  onClick={handleCodeSubmit}
                  disabled={!inputCode.trim() || inputCode.length < 6}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg shadow-primary/25"
                  size="lg"
                >
                  <span>Join Now</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Games Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-5">
              <Crown className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg sm:text-xl font-bold">All Games</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
              {gameOptions.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={game.available ? { scale: 1.02, y: -4 } : {}}
                >
                  <Card 
                    className={`relative overflow-hidden h-full transition-all duration-300 group ${
                      game.available 
                        ? "cursor-pointer hover:shadow-xl hover:border-primary/50" 
                        : "opacity-60"
                    }`}
                    onClick={() => {
                      if (game.available) {
                        if (game.link) {
                          navigate(game.link);
                        } else if (game.id === "quiz") {
                          document.querySelector<HTMLInputElement>('input')?.focus();
                        }
                      }
                    }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                    <CardContent className="relative p-4 sm:p-5 flex flex-col items-center text-center">
                      <motion.div 
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center mb-3 shadow-lg`}
                        whileHover={game.available ? { rotate: [0, -5, 5, 0] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <game.icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                      </motion.div>
                      <Badge 
                        className={`mb-2 text-[10px] border ${game.badgeColor}`}
                        variant="outline"
                      >
                        {game.available && <Star className="h-2.5 w-2.5 mr-1 fill-current" />}
                        {game.badge}
                      </Badge>
                      <h3 className="font-semibold text-sm sm:text-base mb-1">{game.title}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{game.description}</p>
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
            className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto"
          >
            {[
              { icon: Users, value: formatNumber(arenaStats.totalPlayers), label: "Players", color: "text-blue-500" },
              { icon: Trophy, value: formatNumber(arenaStats.totalQuizzes), label: "Quizzes", color: "text-yellow-500" },
              { icon: Sparkles, value: formatNumber(arenaStats.totalCoinsWon), label: "Coins Won", color: "text-green-500" },
            ].map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="text-center p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 border backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
              >
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 ${stat.color}`} />
                <div className="text-lg sm:text-xl font-bold">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading quiz
  if (isLoadingQuiz) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col items-center justify-center min-h-[60vh]">
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-destructive/5">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-primary/5">
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-primary/5">
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-yellow-500/5 to-primary/5">
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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
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

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuizRealtime } from "@/hooks/useQuizRealtime";
import { useQuizHost } from "@/hooks/useQuizHost";
import { useQuizAutoAdvance } from "@/hooks/useQuizAutoAdvance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuizJoinCard } from "@/components/quiz/QuizJoinCard";
import { QuizLeaderboard } from "@/components/quiz/QuizLeaderboard";
import { QuizCountdown } from "@/components/quiz/QuizCountdown";
import { LiveLeaderboard } from "@/components/quiz/LiveLeaderboard";
import { 
  Play, 
  StopCircle, 
  SkipForward, 
  Users, 
  Timer,
  Trophy,
  Eye,
  Pause,
  Loader2,
  ArrowLeft,
  Zap
} from "lucide-react";

interface ExtendedQuiz {
  id: string;
  title: string;
  description: string | null;
  status: string;
  quiz_code: string;
  current_question_idx: number;
  max_participants: number | null;
  auto_advance: boolean;
  countdown_seconds: number;
  answer_reveal_seconds: number;
  show_live_leaderboard: boolean;
}

export default function QuizHostPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quizDetails, setQuizDetails] = useState<ExtendedQuiz | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { quiz, participants, participantCount, refetchQuiz } = useQuizRealtime(quizId || null);
  const {
    questions,
    fetchQuestions,
    openLobby,
    startQuiz,
    endQuiz,
    showQuestion,
    endQuestion,
    nextQuestion,
    calculateFinalRanks,
    isUpdating,
  } = useQuizHost(quizId || null);

  // Fetch full quiz details
  useEffect(() => {
    if (!quizId) return;

    const fetchQuizDetails = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("quizzes")
          .select("*")
          .eq("id", quizId)
          .single();

        if (error) throw error;
        setQuizDetails(data as ExtendedQuiz);
        await fetchQuestions();
      } catch (err) {
        console.error("Failed to fetch quiz:", err);
        toast({ title: "Error", description: "Quiz not found", variant: "destructive" });
        navigate("/my-quizzes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  // Auto-advance hook
  const handleNextQuestion = useCallback(async () => {
    return await nextQuestion();
  }, [nextQuestion]);

  const handleEndQuiz = useCallback(async () => {
    await calculateFinalRanks();
    return await endQuiz();
  }, [calculateFinalRanks, endQuiz]);

  useQuizAutoAdvance({
    config: quizDetails ? {
      autoAdvance: quizDetails.auto_advance,
      answerRevealSeconds: quizDetails.answer_reveal_seconds || 3,
      countdownSeconds: quizDetails.countdown_seconds || 5,
      status: quiz?.status || quizDetails.status,
      currentQuestionIdx: quiz?.current_question_idx ?? 0,
      totalQuestions: questions.length,
    } : null,
    onNextQuestion: handleNextQuestion,
    onEndQuiz: handleEndQuiz,
    onShowCountdown: () => setShowCountdown(true),
    onHideCountdown: () => setShowCountdown(false),
  });

  const currentStatus = quiz?.status || quizDetails?.status;
  const currentQuestionIdx = quiz?.current_question_idx ?? 0;
  const currentQuestion = questions[currentQuestionIdx];
  const progress = questions.length > 0 ? ((currentQuestionIdx + 1) / questions.length) * 100 : 0;

  const quizUrl = `${window.location.origin}/quiz?code=${quizDetails?.quiz_code}`;

  const handleStartQuiz = async () => {
    setShowCountdown(true);
  };

  const onCountdownComplete = async () => {
    setShowCountdown(false);
    await showQuestion(0);
  };

  const handleEndQuizManual = async () => {
    await calculateFinalRanks();
    await endQuiz();
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quizDetails) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p>Quiz not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-primary/5 py-6">
      {/* Pre-question countdown overlay */}
      <AnimatePresence>
        {showCountdown && (
          <QuizCountdown
            seconds={quizDetails.countdown_seconds || 5}
            questionNumber={currentQuestionIdx + 1}
            totalQuestions={questions.length}
            onComplete={onCountdownComplete}
            message="Get Ready!"
          />
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/my-quizzes")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{quizDetails.title}</h1>
              <p className="text-sm text-muted-foreground">
                Code: <span className="font-mono font-bold">{quizDetails.quiz_code}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={currentStatus === "completed" ? "destructive" : "default"}>
              {currentStatus}
            </Badge>
            {quizDetails.auto_advance && (
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3" />
                Auto
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status & Progress */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{participantCount}</p>
                      <p className="text-sm text-muted-foreground">Participants</p>
                    </div>
                  </div>

                  {currentStatus !== "draft" && currentStatus !== "completed" && (
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        Question {currentQuestionIdx + 1} / {questions.length}
                      </p>
                      <Progress value={progress} className="w-32 h-2 mt-1" />
                    </div>
                  )}
                </div>

                {/* Control Buttons */}
                <div className="flex flex-wrap gap-3">
                  {currentStatus === "draft" && (
                    <Button 
                      onClick={openLobby} 
                      disabled={isUpdating || questions.length === 0}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Open Lobby
                    </Button>
                  )}

                  {currentStatus === "waiting" && (
                    <Button 
                      onClick={handleStartQuiz} 
                      disabled={isUpdating}
                      className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500"
                    >
                      <Play className="h-4 w-4" />
                      Start Quiz
                    </Button>
                  )}

                  {currentStatus === "question_active" && (
                    <Button 
                      onClick={endQuestion} 
                      disabled={isUpdating}
                      variant="secondary"
                      className="gap-2"
                    >
                      <StopCircle className="h-4 w-4" />
                      End Question
                    </Button>
                  )}

                  {currentStatus === "question_ended" && !quizDetails.auto_advance && (
                    <>
                      {currentQuestionIdx < questions.length - 1 ? (
                        <Button 
                          onClick={() => nextQuestion()} 
                          disabled={isUpdating}
                          className="gap-2"
                        >
                          <SkipForward className="h-4 w-4" />
                          Next Question
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleEndQuizManual} 
                          disabled={isUpdating}
                          variant="destructive"
                          className="gap-2"
                        >
                          <Trophy className="h-4 w-4" />
                          Show Results
                        </Button>
                      )}
                    </>
                  )}

                  {currentStatus === "question_ended" && quizDetails.auto_advance && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Auto-advancing...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Question Display */}
            {currentQuestion && currentStatus !== "draft" && currentStatus !== "waiting" && currentStatus !== "completed" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Current Question
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium mb-4">{currentQuestion.question_text}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {currentQuestion.options.map((opt: string, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${
                          idx === currentQuestion.correct_option_index
                            ? "border-green-500 bg-green-500/10"
                            : "border-border"
                        }`}
                      >
                        <span className="text-sm">{opt}</span>
                        {idx === currentQuestion.correct_option_index && (
                          <Badge className="ml-2 bg-green-500">Correct</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <span>{currentQuestion.time_limit_seconds}s time limit</span>
                    <span>{currentQuestion.points} points</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Share Card for Lobby */}
            {(currentStatus === "draft" || currentStatus === "waiting") && (
              <QuizJoinCard
                quizCode={quizDetails.quiz_code}
                quizUrl={quizUrl}
                mode="display"
              />
            )}

            {/* Final Results */}
            {currentStatus === "completed" && (
              <QuizLeaderboard participants={participants} />
            )}
          </div>

          {/* Sidebar - Live Leaderboard */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Live Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {participants.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Waiting for participants...
                  </p>
                ) : (
                  <LiveLeaderboard participants={participants} showTop={10} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

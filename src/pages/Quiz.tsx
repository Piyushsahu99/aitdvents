import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizLobby } from "@/components/quiz/QuizLobby";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import { QuizResults } from "@/components/quiz/QuizResults";
import { QuizJoinCard } from "@/components/quiz/QuizJoinCard";
import { useQuizByCode, useQuizRealtime } from "@/hooks/useQuizRealtime";
import { useQuizParticipant } from "@/hooks/useQuizParticipant";
import { Gamepad2, Loader2 } from "lucide-react";

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const codeFromUrl = searchParams.get("code");

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

  // No code entered yet
  if (!activeCode) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <Gamepad2 className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-primary mb-3 sm:mb-4" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 text-center">Join a Quiz</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 text-center">Enter the quiz code to participate</p>

          <Card className="w-full max-w-md mx-2">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Enter Quiz Code</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Get the code from the quiz host</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <Input
                placeholder="e.g., ABC123"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleCodeSubmit()}
                className="text-center text-xl sm:text-2xl font-mono tracking-widest h-12 sm:h-14"
                maxLength={6}
              />
              <Button
                onClick={handleCodeSubmit}
                disabled={!inputCode.trim()}
                className="w-full h-11 sm:h-12 text-sm sm:text-base"
                size="lg"
              >
                Join Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading quiz
  if (isLoadingQuiz) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground">Finding quiz...</p>
        </div>
      </div>
    );
  }

  // Quiz not found
  if (quizError || !quiz) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Quiz Not Found</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-md px-2">
            The quiz code "{activeCode}" doesn't exist or has ended.
          </p>
          <Button
            variant="outline"
            className="h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base"
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 px-2">{quiz.title}</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">This quiz hasn't started yet. Check back soon!</p>
        </div>
      </div>
    );
  }

  // Quiz is waiting - show lobby or join form
  if (quiz.status === "waiting") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          {!participant ? (
            <QuizJoinCard
              quizCode={quiz.quiz_code}
              quizUrl={quizUrl}
              onJoin={joinQuiz}
              isJoining={isJoining}
              isJoined={!!participant}
              mode="join"
            />
          ) : (
            <QuizLobby
              title={quiz.title}
              description={quiz.description}
              participantCount={participantCount}
              participantNames={participants.map((p) => p.participant_name)}
              isJoined={!!participant}
              maxParticipants={quiz.max_participants}
            />
          )}
        </div>
      </div>
    );
  }

  // Quiz is active with question
  if (quiz.status === "question_active" || quiz.status === "question_ended") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-2 sm:px-3 md:px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
          {currentQuestion ? (
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
          ) : (
            <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Quiz is completed - show results
  if (quiz.status === "completed") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-2 sm:px-3 md:px-4 py-4 sm:py-6 md:py-8">
          <QuizResults
            quizTitle={quiz.title}
            participants={participants}
            currentParticipantId={participant?.id}
          />
        </div>
      </div>
    );
  }

  // Quiz is active (between questions)
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
        <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary mb-3 sm:mb-4" />
        <p className="text-base sm:text-lg font-medium px-2">Get ready for the next question...</p>
        {participant && (
          <p className="text-sm sm:text-base text-muted-foreground mt-2 px-2">
            Your score: <span className="font-bold text-primary">{participant.total_score}</span>
          </p>
        )}
      </div>
    </div>
  );
}

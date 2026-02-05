import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Users, 
  Clock, 
  Target, 
  ArrowLeft,
  Download,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Loader2,
  Trophy
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Quiz {
  id: string;
  title: string;
  quiz_code: string;
  status: string;
  created_at: string;
}

interface Question {
  id: string;
  question_text: string;
  correct_option_index: number;
  options: string[];
  points: number;
  time_limit_seconds: number;
}

interface Answer {
  question_id: string;
  selected_option_index: number;
  is_correct: boolean;
  response_time_ms: number;
}

interface QuestionStats {
  question: Question;
  correctCount: number;
  incorrectCount: number;
  avgResponseTime: number;
  accuracy: number;
}

export default function QuizAnalytics() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (quizId) {
      fetchAnalytics();
    }
  }, [quizId]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        navigate("/auth");
        return;
      }

      // Fetch quiz
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .eq("created_by", user.user.id)
        .maybeSingle();

      if (quizError) throw quizError;
      if (!quizData) {
        toast({ title: "Quiz not found", variant: "destructive" });
        navigate("/my-quizzes");
        return;
      }

      setQuiz(quizData as Quiz);

      // Fetch questions
      const { data: questionsData } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("order_index");

      setQuestions((questionsData || []) as Question[]);

      // Fetch participants count
      const { count } = await supabase
        .from("quiz_participants")
        .select("*", { count: "exact", head: true })
        .eq("quiz_id", quizId);

      setParticipantCount(count || 0);

      // Fetch all answers - cast to handle type issues
      const { data: answersData } = await supabase
        .from("quiz_answers" as any)
        .select("question_id, selected_option_index, is_correct, response_time_ms")
        .eq("quiz_id", quizId);

      setAnswers((answersData || []) as unknown as Answer[]);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      toast({ title: "Error loading analytics", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateQuestionStats = (): QuestionStats[] => {
    return questions.map(question => {
      const questionAnswers = answers.filter(a => a.question_id === question.id);
      const correctCount = questionAnswers.filter(a => a.is_correct).length;
      const incorrectCount = questionAnswers.filter(a => !a.is_correct).length;
      const totalAnswers = questionAnswers.length;
      const avgResponseTime = totalAnswers > 0 
        ? questionAnswers.reduce((sum, a) => sum + (a.response_time_ms || 0), 0) / totalAnswers 
        : 0;
      const accuracy = totalAnswers > 0 ? (correctCount / totalAnswers) * 100 : 0;

      return {
        question,
        correctCount,
        incorrectCount,
        avgResponseTime,
        accuracy
      };
    });
  };

  const overallStats = {
    totalAnswers: answers.length,
    correctAnswers: answers.filter(a => a.is_correct).length,
    avgResponseTime: answers.length > 0 
      ? answers.reduce((sum, a) => sum + (a.response_time_ms || 0), 0) / answers.length 
      : 0,
    overallAccuracy: answers.length > 0 
      ? (answers.filter(a => a.is_correct).length / answers.length) * 100 
      : 0
  };

  const exportCSV = () => {
    const stats = calculateQuestionStats();
    const csvContent = [
      ["Question", "Correct", "Incorrect", "Accuracy %", "Avg Response Time (s)"],
      ...stats.map(s => [
        `"${s.question.question_text.replace(/"/g, '""')}"`,
        s.correctCount,
        s.incorrectCount,
        s.accuracy.toFixed(1),
        (s.avgResponseTime / 1000).toFixed(2)
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz-analytics-${quiz?.quiz_code || quizId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported successfully!" });
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  const questionStats = calculateQuestionStats();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-primary/5 py-6">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/my-quizzes")}
              className="mb-2 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Quiz Analytics
            </h1>
            <p className="text-muted-foreground">{quiz.title}</p>
          </div>
          <Button onClick={exportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{participantCount}</p>
                <p className="text-xs text-muted-foreground">Participants</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{overallStats.overallAccuracy.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{(overallStats.avgResponseTime / 1000).toFixed(1)}s</p>
                <p className="text-xs text-muted-foreground">Avg Response</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">{questions.length}</p>
                <p className="text-xs text-muted-foreground">Questions</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Question-by-Question Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Question Performance</CardTitle>
            <CardDescription>Accuracy and response time per question</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {questionStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No answer data available yet
              </p>
            ) : (
              questionStats.map((stat, index) => (
                <motion.div
                  key={stat.question.id}
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-1">
                        Q{index + 1}: {stat.question.question_text}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          {stat.correctCount} correct
                        </span>
                        <span className="flex items-center gap-1 text-red-500">
                          <XCircle className="h-3 w-3" />
                          {stat.incorrectCount} incorrect
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {(stat.avgResponseTime / 1000).toFixed(1)}s avg
                        </span>
                      </div>
                    </div>
                    <Badge 
                      variant={stat.accuracy >= 70 ? "default" : stat.accuracy >= 40 ? "secondary" : "destructive"}
                      className="shrink-0"
                    >
                      {stat.accuracy.toFixed(0)}%
                    </Badge>
                  </div>
                  <Progress 
                    value={stat.accuracy} 
                    className="h-2"
                  />
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Hardest & Easiest Questions */}
        {questionStats.length > 1 && (
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-green-600">
                  <Trophy className="h-4 w-4" />
                  Easiest Question
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const easiest = [...questionStats].sort((a, b) => b.accuracy - a.accuracy)[0];
                  return (
                    <div>
                      <p className="text-sm font-medium mb-1">{easiest.question.question_text}</p>
                      <p className="text-2xl font-bold text-green-600">{easiest.accuracy.toFixed(1)}% accuracy</p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-red-500">
                  <Target className="h-4 w-4" />
                  Hardest Question
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const hardest = [...questionStats].sort((a, b) => a.accuracy - b.accuracy)[0];
                  return (
                    <div>
                      <p className="text-sm font-medium mb-1">{hardest.question.question_text}</p>
                      <p className="text-2xl font-bold text-red-500">{hardest.accuracy.toFixed(1)}% accuracy</p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

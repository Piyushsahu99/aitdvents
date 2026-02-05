import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Medal, 
  Award, 
  Share2, 
  Copy, 
  Users, 
  Calendar,
  ArrowLeft,
  Loader2,
  Crown,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Participant {
  id: string;
  participant_name: string;
  total_score: number;
  final_rank: number | null;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  quiz_code: string;
  status: string;
  organizer_name: string | null;
  category: string;
  difficulty: string;
  created_at: string;
  banner_image: string | null;
}

export default function QuizResultsPublic() {
  const { quizCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quizCode) {
      fetchQuizResults();
    }
  }, [quizCode]);

  const fetchQuizResults = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch quiz by code
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("quiz_code", quizCode?.toUpperCase())
        .maybeSingle();

      if (quizError) throw quizError;
      
      if (!quizData) {
        setError("Quiz not found");
        return;
      }

      if (quizData.status !== "completed") {
        setError("This quiz hasn't ended yet");
        return;
      }

      if (!quizData.is_public) {
        setError("This leaderboard is private");
        return;
      }

      setQuiz(quizData as Quiz);

      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from("quiz_participants")
        .select("id, participant_name, total_score, final_rank")
        .eq("quiz_id", quizData.id)
        .order("total_score", { ascending: false });

      if (participantsError) throw participantsError;
      setParticipants((participantsData || []) as Participant[]);
    } catch (err) {
      console.error("Error fetching quiz results:", err);
      setError("Failed to load results");
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!", description: "Share this link with others" });
  };

  const shareOnWhatsApp = () => {
    const text = `Check out the results of "${quiz?.title}" quiz!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + window.location.href)}`, "_blank");
  };

  const shareOnTwitter = () => {
    const text = `Check out the results of "${quiz?.title}" quiz!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, "_blank");
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">{error || "Quiz not found"}</h2>
          <p className="text-muted-foreground mb-6">
            {error === "This quiz hasn't ended yet" 
              ? "The leaderboard will be available once the quiz is completed."
              : "Please check the link and try again."}
          </p>
          <Button onClick={() => navigate("/quiz-discover")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Discover Quizzes
          </Button>
        </Card>
      </div>
    );
  }

  const top3 = participants.slice(0, 3);
  const podiumOrder = [1, 0, 2];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {quiz.banner_image && (
            <img 
              src={quiz.banner_image} 
              alt={quiz.title}
              className="w-full h-48 object-cover rounded-xl mb-6"
            />
          )}
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            <Trophy className="h-10 w-10 text-yellow-500" />
            <Crown className="h-8 w-8 text-yellow-500 scale-x-[-1]" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
              {quiz.title}
            </span>
          </h1>
          
          <p className="text-muted-foreground mb-4">Final Results</p>
          
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {participants.length} participants
            </Badge>
            <Badge variant="outline" className="capitalize">{quiz.category}</Badge>
            <Badge variant="outline" className="capitalize">{quiz.difficulty}</Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mt-3">
            <Calendar className="h-3 w-3 inline mr-1" />
            {format(new Date(quiz.created_at), "MMMM d, yyyy")}
            {quiz.organizer_name && ` • Hosted by ${quiz.organizer_name}`}
          </p>
        </motion.div>

        {/* Podium */}
        {top3.length > 0 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {podiumOrder.map((position) => {
              const participant = top3[position];
              if (!participant) return null;

              const rank = position + 1;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;

              return (
                <motion.div
                  key={participant.id}
                  className={cn(
                    "flex flex-col items-center relative",
                    isFirst && "order-2 z-10",
                    isSecond && "order-1",
                    isThird && "order-3"
                  )}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + position * 0.1 }}
                >
                  {isFirst && (
                    <Crown className="h-8 w-8 text-yellow-500 mb-1" />
                  )}
                  
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center mb-2 shadow-lg",
                      isFirst && "bg-gradient-to-br from-yellow-300 to-yellow-600",
                      isSecond && "bg-gradient-to-br from-gray-200 to-gray-500",
                      isThird && "bg-gradient-to-br from-amber-400 to-amber-700"
                    )}
                  >
                    {isFirst && <Trophy className="h-7 w-7 text-white" />}
                    {isSecond && <Medal className="h-7 w-7 text-white" />}
                    {isThird && <Award className="h-7 w-7 text-white" />}
                  </div>

                  <p className="text-sm font-bold text-center max-w-20 truncate">
                    {participant.participant_name}
                  </p>
                  
                  <p className={cn(
                    "text-sm font-extrabold",
                    isFirst && "text-yellow-600",
                    isSecond && "text-gray-500",
                    isThird && "text-amber-600"
                  )}>
                    {participant.total_score} pts
                  </p>

                  <div
                    className={cn(
                      "w-20 mt-2 rounded-t-lg flex items-center justify-center shadow-lg",
                      isFirst && "h-32 bg-gradient-to-b from-yellow-400 to-yellow-600",
                      isSecond && "h-24 bg-gradient-to-b from-gray-300 to-gray-500",
                      isThird && "h-20 bg-gradient-to-b from-amber-500 to-amber-700"
                    )}
                  >
                    <span className="text-3xl font-black text-white">{rank}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Share Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-6">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share Results
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
                  <Copy className="h-3 w-3" />
                  Copy Link
                </Button>
                <Button variant="outline" size="sm" onClick={shareOnWhatsApp} className="gap-2 text-green-600">
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm" onClick={shareOnTwitter} className="gap-2 text-blue-500">
                  Twitter
                </Button>
                <Button variant="outline" size="sm" onClick={shareOnLinkedIn} className="gap-2 text-blue-700">
                  LinkedIn
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-bold mb-4">Full Leaderboard</h3>
          <div className="space-y-2">
            {participants.map((participant, index) => (
              <motion.div
                key={participant.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.03 }}
              >
                <span className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                  index === 0 && "bg-yellow-100 text-yellow-700",
                  index === 1 && "bg-gray-100 text-gray-700",
                  index === 2 && "bg-amber-100 text-amber-700",
                  index > 2 && "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </span>
                <span className="flex-1 truncate font-medium">
                  {participant.participant_name}
                </span>
                <span className="font-bold">{participant.total_score} pts</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate("/quiz-discover")} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Discover More Quizzes
          </Button>
        </div>
      </div>
    </div>
  );
}

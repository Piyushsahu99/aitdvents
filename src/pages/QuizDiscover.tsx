import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryFilter } from "@/components/CategoryFilter";
import { QuizCard } from "@/components/quiz/QuizCard";
import { 
  Search, 
  Plus, 
  Gamepad2, 
  Sparkles, 
  Trophy,
  Users,
  Loader2,
  Filter
} from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  organizer_name: string | null;
  banner_image: string | null;
  scheduled_start: string | null;
  status: string;
  prizes: { first?: string; second?: string; third?: string } | null;
  is_public: boolean;
  max_participants: number | null;
  created_at: string;
}

const CATEGORIES = ["Tech", "General", "Science", "Entertainment", "Sports", "History"];

export default function QuizDiscover() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [registrations, setRegistrations] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
    if (user) {
      fetchRegistrations(user.id);
    }
  };

  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("is_public", true)
        .in("status", ["draft", "waiting", "active", "question_active"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuizzes((data || []) as Quiz[]);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegistrations = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("quiz_registrations")
        .select("quiz_id")
        .eq("user_id", uid);

      if (error) throw error;
      setRegistrations(new Set((data || []).map((r) => r.quiz_id)));
    } catch (err) {
      console.error("Failed to fetch registrations:", err);
    }
  };

  const handleRegister = async (quizId: string) => {
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to register for quizzes",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      const { error } = await supabase
        .from("quiz_registrations")
        .insert({ quiz_id: quizId, user_id: userId });

      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already registered", description: "You're already registered for this quiz" });
          return;
        }
        throw error;
      }

      setRegistrations((prev) => new Set([...prev, quizId]));
      toast({ title: "Registered! 🎉", description: "You'll be notified when the quiz starts" });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to register";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleJoin = (quiz: Quiz) => {
    navigate(`/quiz?code=${quiz.id}`);
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || 
      quiz.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const liveQuizzes = filteredQuizzes.filter((q) => 
    ["waiting", "active", "question_active"].includes(q.status)
  );
  const upcomingQuizzes = filteredQuizzes.filter((q) => q.status === "draft");

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-primary/5 py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">Discover Quizzes</h1>
          </div>
          <p className="text-muted-foreground">Join live quizzes and compete for prizes</p>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={() => navigate("/create-quiz")} 
            className="gap-2 bg-gradient-to-r from-primary to-purple-500"
          >
            <Plus className="h-4 w-4" />
            Host a Quiz
          </Button>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <CategoryFilter
            categories={CATEGORIES}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
          {[
            { icon: Users, value: liveQuizzes.length, label: "Live Now", color: "text-red-500" },
            { icon: Trophy, value: upcomingQuizzes.length, label: "Upcoming", color: "text-yellow-500" },
            { icon: Sparkles, value: registrations.size, label: "Registered", color: "text-green-500" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-xl bg-muted/50 border">
              <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <Gamepad2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No quizzes found</h3>
            <p className="text-muted-foreground mb-6">Be the first to host a quiz!</p>
            <Button onClick={() => navigate("/create-quiz")} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Quiz
            </Button>
          </div>
        ) : (
          <>
            {/* Live Quizzes */}
            {liveQuizzes.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>
                  <h2 className="text-xl font-bold">Happening Now</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {liveQuizzes.map((quiz, idx) => (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <QuizCard
                        {...quiz}
                        scheduledStart={quiz.scheduled_start}
                        organizerName={quiz.organizer_name}
                        bannerImage={quiz.banner_image}
                        isRegistered={registrations.has(quiz.id)}
                        onRegister={() => handleRegister(quiz.id)}
                        onJoin={() => handleJoin(quiz)}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Quizzes */}
            {upcomingQuizzes.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-xl font-bold">Upcoming Quizzes</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingQuizzes.map((quiz, idx) => (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <QuizCard
                        {...quiz}
                        scheduledStart={quiz.scheduled_start}
                        organizerName={quiz.organizer_name}
                        bannerImage={quiz.banner_image}
                        isRegistered={registrations.has(quiz.id)}
                        onRegister={() => handleRegister(quiz.id)}
                        onJoin={() => handleJoin(quiz)}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

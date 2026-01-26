import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type QuizStatus = "draft" | "waiting" | "active" | "question_active" | "question_ended" | "completed";

interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  time_limit_seconds: number;
  points: number;
  order_index: number;
  image_url: string | null;
}

export function useQuizHost(quizId: string | null) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const updateQuizStatus = useCallback(
    async (status: QuizStatus) => {
      if (!quizId) return false;

      setIsUpdating(true);
      try {
        const { error } = await supabase
          .from("quizzes")
          .update({ status })
          .eq("id", quizId);

        if (error) throw error;

        toast({
          title: "Quiz updated",
          description: `Quiz status changed to ${status}`,
        });
        return true;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update quiz";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [quizId, toast]
  );

  const openLobby = useCallback(() => updateQuizStatus("waiting"), [updateQuizStatus]);
  const startQuiz = useCallback(() => updateQuizStatus("active"), [updateQuizStatus]);
  const endQuiz = useCallback(() => updateQuizStatus("completed"), [updateQuizStatus]);

  const showQuestion = useCallback(
    async (questionIndex: number) => {
      if (!quizId) return false;

      setIsUpdating(true);
      try {
        const { error } = await supabase
          .from("quizzes")
          .update({
            status: "question_active" as QuizStatus,
            current_question_idx: questionIndex,
          })
          .eq("id", quizId);

        if (error) throw error;
        return true;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to show question";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [quizId, toast]
  );

  const endQuestion = useCallback(async () => {
    if (!quizId) return false;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("quizzes")
        .update({ status: "question_ended" as QuizStatus })
        .eq("id", quizId);

      if (error) throw error;
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to end question";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [quizId, toast]);

  const nextQuestion = useCallback(async () => {
    if (!quizId) return false;

    setIsUpdating(true);
    try {
      // Get current quiz state
      const { data: quiz, error: fetchError } = await supabase
        .from("quizzes")
        .select("current_question_idx")
        .eq("id", quizId)
        .single();

      if (fetchError) throw fetchError;

      const nextIndex = (quiz.current_question_idx || 0) + 1;

      const { error } = await supabase
        .from("quizzes")
        .update({
          status: "question_active" as QuizStatus,
          current_question_idx: nextIndex,
        })
        .eq("id", quizId);

      if (error) throw error;
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to go to next question";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [quizId, toast]);

  const fetchQuestions = useCallback(async () => {
    if (!quizId) return [];

    try {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("order_index", { ascending: true });

      if (error) throw error;

      const typedQuestions = (data || []).map((q) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : [],
      })) as QuizQuestion[];

      setQuestions(typedQuestions);
      return typedQuestions;
    } catch (err: unknown) {
      console.error("Failed to fetch questions:", err);
      return [];
    }
  }, [quizId]);

  const calculateFinalRanks = useCallback(async () => {
    if (!quizId) return false;

    try {
      // Fetch all participants ordered by score
      const { data: participants, error: fetchError } = await supabase
        .from("quiz_participants")
        .select("id, total_score")
        .eq("quiz_id", quizId)
        .order("total_score", { ascending: false });

      if (fetchError) throw fetchError;

      // Update ranks
      for (let i = 0; i < (participants?.length || 0); i++) {
        const participant = participants![i];
        await supabase
          .from("quiz_participants")
          .update({ final_rank: i + 1 })
          .eq("id", participant.id);
      }

      return true;
    } catch (err: unknown) {
      console.error("Failed to calculate ranks:", err);
      return false;
    }
  }, [quizId]);

  return {
    isUpdating,
    questions,
    openLobby,
    startQuiz,
    endQuiz,
    showQuestion,
    endQuestion,
    nextQuestion,
    fetchQuestions,
    calculateFinalRanks,
  };
}

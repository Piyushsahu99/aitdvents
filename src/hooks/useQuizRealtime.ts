import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "waiting" | "active" | "question_active" | "question_ended" | "completed";
  quiz_code: string;
  current_question_idx: number;
  max_participants: number | null;
}

interface Participant {
  id: string;
  quiz_id: string;
  participant_name: string;
  total_score: number;
  final_rank: number | null;
  joined_at: string;
}

interface QuizRealtimeState {
  quiz: Quiz | null;
  participants: Participant[];
  participantCount: number;
  isLoading: boolean;
  error: string | null;
}

export function useQuizRealtime(quizId: string | null) {
  const [state, setState] = useState<QuizRealtimeState>({
    quiz: null,
    participants: [],
    participantCount: 0,
    isLoading: true,
    error: null,
  });

  const fetchQuiz = useCallback(async () => {
    if (!quizId) return;

    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        quiz: data as Quiz,
        isLoading: false,
      }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch quiz";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  }, [quizId]);

  const fetchParticipants = useCallback(async () => {
    if (!quizId) return;

    try {
      const { data, error } = await supabase
        .from("quiz_participants")
        .select("*")
        .eq("quiz_id", quizId)
        .order("total_score", { ascending: false });

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        participants: data as Participant[],
        participantCount: data.length,
      }));
    } catch (err: unknown) {
      console.error("Failed to fetch participants:", err);
    }
  }, [quizId]);

  useEffect(() => {
    if (!quizId) {
      setState({
        quiz: null,
        participants: [],
        participantCount: 0,
        isLoading: false,
        error: null,
      });
      return;
    }

    fetchQuiz();
    fetchParticipants();

    // Subscribe to quiz changes
    const quizChannel: RealtimeChannel = supabase
      .channel(`quiz-${quizId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quizzes",
          filter: `id=eq.${quizId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setState((prev) => ({
              ...prev,
              quiz: payload.new as Quiz,
            }));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quiz_participants",
          filter: `quiz_id=eq.${quizId}`,
        },
        () => {
          // Refetch participants on any change
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(quizChannel);
    };
  }, [quizId, fetchQuiz, fetchParticipants]);

  return {
    ...state,
    refetchQuiz: fetchQuiz,
    refetchParticipants: fetchParticipants,
  };
}

export function useQuizByCode(quizCode: string | null) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizByCode = useCallback(async () => {
    if (!quizCode) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("quiz_code", quizCode.toUpperCase())
        .single();

      if (fetchError) throw fetchError;

      setQuiz(data as Quiz);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Quiz not found";
      setError(errorMessage);
      setQuiz(null);
    } finally {
      setIsLoading(false);
    }
  }, [quizCode]);

  useEffect(() => {
    fetchQuizByCode();
  }, [fetchQuizByCode]);

  return { quiz, isLoading, error, refetch: fetchQuizByCode };
}

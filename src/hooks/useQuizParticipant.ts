import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Participant {
  id: string;
  quiz_id: string;
  participant_name: string;
  total_score: number;
  final_rank: number | null;
  device_id: string | null;
}

interface Question {
  id: string;
  question_text: string;
  options: string[];
  time_limit_seconds: number;
  points: number;
  order_index: number;
  image_url: string | null;
  correct_option_index: number;
}

function getDeviceId(): string {
  let deviceId = localStorage.getItem("quiz_device_id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("quiz_device_id", deviceId);
  }
  return deviceId;
}

export function useQuizParticipant(quizId: string | null) {
  const { toast } = useToast();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);

  // Check if already joined
  useEffect(() => {
    if (!quizId) return;

    const checkExistingParticipant = async () => {
      const deviceId = getDeviceId();
      const { data } = await supabase
        .from("quiz_participants")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("device_id", deviceId)
        .maybeSingle();

      if (data) {
        setParticipant(data as Participant);
      }
    };

    checkExistingParticipant();
  }, [quizId]);

  const joinQuiz = useCallback(
    async (name: string) => {
      if (!quizId || !name.trim()) return false;

      setIsJoining(true);
      try {
        const deviceId = getDeviceId();
        const { data: user } = await supabase.auth.getUser();

        const { data, error } = await supabase
          .from("quiz_participants")
          .insert({
            quiz_id: quizId,
            participant_name: name.trim(),
            device_id: deviceId,
            user_id: user?.user?.id || null,
          })
          .select()
          .single();

        if (error) {
          if (error.code === "23505") {
            // Already joined with this device
            toast({
              title: "Already joined",
              description: "You have already joined this quiz",
            });
            return false;
          }
          throw error;
        }

        setParticipant(data as Participant);
        toast({
          title: "Joined! 🎉",
          description: "Waiting for the host to start the quiz",
        });
        return true;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to join quiz";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      } finally {
        setIsJoining(false);
      }
    },
    [quizId, toast]
  );

  const fetchCurrentQuestion = useCallback(
    async (questionIndex: number) => {
      if (!quizId) return null;

      try {
        const { data, error } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quizId)
          .eq("order_index", questionIndex)
          .single();

        if (error) throw error;

        const question = {
          ...data,
          options: Array.isArray(data.options) ? data.options : [],
        } as Question;

        setCurrentQuestion(question);
        setQuestionStartTime(Date.now());
        setHasAnswered(false);
        setSelectedAnswer(null);

        // Check if already answered
        if (participant) {
          const { data: existingAnswer } = await supabase
            .from("quiz_participant_answers")
            .select("selected_option_index")
            .eq("participant_id", participant.id)
            .eq("question_id", question.id)
            .maybeSingle();

          if (existingAnswer) {
            setHasAnswered(true);
            setSelectedAnswer(existingAnswer.selected_option_index);
          }
        }

        return question;
      } catch (err: unknown) {
        console.error("Failed to fetch question:", err);
        return null;
      }
    },
    [quizId, participant]
  );

  const submitAnswer = useCallback(
    async (optionIndex: number) => {
      if (!participant || !currentQuestion || hasAnswered) return false;

      const timeTaken = questionStartTime ? Date.now() - questionStartTime : 0;
      const isCorrect = optionIndex === currentQuestion.correct_option_index;

      // Calculate points: base points with time bonus
      const timeBonus = Math.max(0, 1 - timeTaken / (currentQuestion.time_limit_seconds * 1000));
      const pointsEarned = isCorrect ? Math.round(currentQuestion.points * (0.5 + 0.5 * timeBonus)) : 0;

      try {
        const { error } = await supabase.from("quiz_participant_answers").insert({
          participant_id: participant.id,
          question_id: currentQuestion.id,
          selected_option_index: optionIndex,
          is_correct: isCorrect,
          time_taken_ms: timeTaken,
          points_earned: pointsEarned,
        });

        if (error) throw error;

        // Update participant's total score
        if (pointsEarned > 0) {
          await supabase
            .from("quiz_participants")
            .update({ total_score: participant.total_score + pointsEarned })
            .eq("id", participant.id);

          setParticipant((prev) =>
            prev ? { ...prev, total_score: prev.total_score + pointsEarned } : null
          );
        }

        setHasAnswered(true);
        setSelectedAnswer(optionIndex);

        toast({
          title: isCorrect ? "Correct! ✅" : "Wrong ❌",
          description: isCorrect ? `+${pointsEarned} points` : "Better luck next time!",
        });

        return true;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to submit answer";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }
    },
    [participant, currentQuestion, hasAnswered, questionStartTime, toast]
  );

  return {
    participant,
    currentQuestion,
    hasAnswered,
    selectedAnswer,
    isJoining,
    joinQuiz,
    fetchCurrentQuestion,
    submitAnswer,
  };
}

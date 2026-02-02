import { useEffect, useRef, useCallback } from "react";

interface QuizAutoAdvanceConfig {
  autoAdvance: boolean;
  answerRevealSeconds: number;
  countdownSeconds: number;
  status: string;
  currentQuestionIdx: number;
  totalQuestions: number;
}

interface UseQuizAutoAdvanceProps {
  config: QuizAutoAdvanceConfig | null;
  onNextQuestion: () => Promise<boolean>;
  onEndQuiz: () => Promise<boolean>;
  onShowCountdown?: () => void;
  onHideCountdown?: () => void;
}

export function useQuizAutoAdvance({
  config,
  onNextQuestion,
  onEndQuiz,
  onShowCountdown,
  onHideCountdown,
}: UseQuizAutoAdvanceProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!config?.autoAdvance) {
      clearTimers();
      return;
    }

    // Auto-advance after answer reveal
    if (config.status === "question_ended") {
      const revealTime = (config.answerRevealSeconds || 3) * 1000;

      timerRef.current = setTimeout(async () => {
        const isLastQuestion = config.currentQuestionIdx >= config.totalQuestions - 1;

        if (isLastQuestion) {
          await onEndQuiz();
        } else {
          // Show countdown before next question
          onShowCountdown?.();
          
          countdownTimerRef.current = setTimeout(async () => {
            onHideCountdown?.();
            await onNextQuestion();
          }, (config.countdownSeconds || 3) * 1000);
        }
      }, revealTime);
    }

    return clearTimers;
  }, [
    config?.autoAdvance,
    config?.status,
    config?.currentQuestionIdx,
    config?.totalQuestions,
    config?.answerRevealSeconds,
    config?.countdownSeconds,
    onNextQuestion,
    onEndQuiz,
    onShowCountdown,
    onHideCountdown,
    clearTimers,
  ]);

  return {
    clearTimers,
  };
}

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QuizTimer } from "./QuizTimer";

interface QuizQuestionProps {
  questionText: string;
  options: string[];
  timeLimit: number;
  points: number;
  imageUrl?: string | null;
  onAnswer: (optionIndex: number) => void;
  onTimeUp?: () => void;
  hasAnswered: boolean;
  selectedAnswer: number | null;
  correctAnswer?: number;
  showCorrectAnswer?: boolean;
}

const OPTION_COLORS = [
  "bg-red-500 hover:bg-red-600 text-white",
  "bg-blue-500 hover:bg-blue-600 text-white",
  "bg-yellow-500 hover:bg-yellow-600 text-white",
  "bg-green-500 hover:bg-green-600 text-white",
];

const OPTION_SHAPES = ["▲", "◆", "●", "■"];

export function QuizQuestion({
  questionText,
  options,
  timeLimit,
  points,
  imageUrl,
  onAnswer,
  onTimeUp,
  hasAnswered,
  selectedAnswer,
  correctAnswer,
  showCorrectAnswer = false,
}: QuizQuestionProps) {
  const [isTimerActive, setIsTimerActive] = useState(true);

  const handleAnswer = (index: number) => {
    if (hasAnswered) return;
    setIsTimerActive(false);
    onAnswer(index);
  };

  const handleTimeUp = () => {
    setIsTimerActive(false);
    onTimeUp?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with timer and points */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {points} points
        </div>
        <QuizTimer
          seconds={timeLimit}
          onComplete={handleTimeUp}
          isActive={isTimerActive && !hasAnswered}
          size="sm"
        />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 mb-6">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Question"
            className="max-h-48 rounded-lg mb-4 object-contain"
          />
        )}
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">
          {questionText}
        </h2>
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = correctAnswer === index;
          const showAsCorrect = showCorrectAnswer && isCorrect;
          const showAsWrong = showCorrectAnswer && isSelected && !isCorrect;

          return (
            <Button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={hasAnswered}
              className={cn(
                "h-20 md:h-24 text-lg md:text-xl font-semibold relative transition-all",
                !hasAnswered && OPTION_COLORS[index % 4],
                hasAnswered && "opacity-70",
                isSelected && !showCorrectAnswer && "ring-4 ring-white ring-offset-2",
                showAsCorrect && "bg-green-500 ring-4 ring-green-300",
                showAsWrong && "bg-red-500 ring-4 ring-red-300"
              )}
            >
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl opacity-50">
                {OPTION_SHAPES[index % 4]}
              </span>
              <span className="pl-6">{option}</span>
            </Button>
          );
        })}
      </div>

      {hasAnswered && !showCorrectAnswer && (
        <div className="text-center mt-4 text-muted-foreground animate-pulse">
          Waiting for time to end...
        </div>
      )}
    </div>
  );
}

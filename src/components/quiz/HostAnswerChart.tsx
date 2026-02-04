import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Check, Users, Clock } from "lucide-react";

interface AnswerDistribution {
  optionIndex: number;
  count: number;
  percentage: number;
}

interface HostAnswerChartProps {
  quizId: string;
  questionId: string;
  options: string[];
  correctOptionIndex: number;
  isQuestionEnded: boolean;
  totalParticipants: number;
}

const OPTION_COLORS = [
  { bg: "bg-red-500", text: "text-red-500", light: "bg-red-500/20" },
  { bg: "bg-blue-500", text: "text-blue-500", light: "bg-blue-500/20" },
  { bg: "bg-yellow-500", text: "text-yellow-500", light: "bg-yellow-500/20" },
  { bg: "bg-green-500", text: "text-green-500", light: "bg-green-500/20" },
];

export function HostAnswerChart({
  quizId,
  questionId,
  options,
  correctOptionIndex,
  isQuestionEnded,
  totalParticipants,
}: HostAnswerChartProps) {
  const [distribution, setDistribution] = useState<AnswerDistribution[]>([]);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnswerDistribution = async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_participant_answers")
        .select("selected_option_index")
        .eq("question_id", questionId);

      if (error) throw error;

      const counts: Record<number, number> = {};
      options.forEach((_, idx) => {
        counts[idx] = 0;
      });

      (data || []).forEach((answer) => {
        if (answer.selected_option_index !== null) {
          counts[answer.selected_option_index] = (counts[answer.selected_option_index] || 0) + 1;
        }
      });

      const totalAnswers = data?.length || 0;
      setAnsweredCount(totalAnswers);

      const dist: AnswerDistribution[] = options.map((_, idx) => ({
        optionIndex: idx,
        count: counts[idx],
        percentage: totalAnswers > 0 ? (counts[idx] / totalAnswers) * 100 : 0,
      }));

      setDistribution(dist);
    } catch (err) {
      console.error("Failed to fetch answer distribution:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswerDistribution();

    // Subscribe to real-time answers
    const channel = supabase
      .channel(`answers-${questionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quiz_participant_answers",
          filter: `question_id=eq.${questionId}`,
        },
        () => {
          fetchAnswerDistribution();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [questionId]);

  const maxPercentage = Math.max(...distribution.map((d) => d.percentage), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Answer Distribution
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {answeredCount}/{totalParticipants}
            </Badge>
            {!isQuestionEnded && (
              <Badge className="animate-pulse gap-1 bg-orange-500">
                <Clock className="h-3 w-3" />
                Live
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence mode="wait">
          {distribution.map((item, idx) => {
            const color = OPTION_COLORS[idx] || OPTION_COLORS[0];
            const isCorrect = idx === correctOptionIndex;
            const showCorrect = isQuestionEnded;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-lg ${color.bg} text-white flex items-center justify-center font-bold text-xs flex-shrink-0`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="truncate">{options[idx]}</span>
                    {showCorrect && isCorrect && (
                      <Badge className="bg-green-500 gap-1 flex-shrink-0">
                        <Check className="h-3 w-3" />
                        Correct
                      </Badge>
                    )}
                  </div>
                  <span className="font-bold text-right min-w-[4rem] flex-shrink-0">
                    {item.count} ({Math.round(item.percentage)}%)
                  </span>
                </div>
                <div className="relative h-8 rounded-lg overflow-hidden bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`absolute inset-y-0 left-0 ${color.bg} ${
                      showCorrect && isCorrect ? "opacity-100" : "opacity-70"
                    }`}
                  />
                  {showCorrect && isCorrect && (
                    <div className="absolute inset-0 border-2 border-green-500 rounded-lg" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Progress bar for answered vs total */}
        <div className="pt-3 border-t mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Response rate</span>
            <span className="font-medium">
              {totalParticipants > 0
                ? Math.round((answeredCount / totalParticipants) * 100)
                : 0}
              %
            </span>
          </div>
          <Progress
            value={totalParticipants > 0 ? (answeredCount / totalParticipants) * 100 : 0}
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}

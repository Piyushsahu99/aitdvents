import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface QuizTimerProps {
  seconds: number;
  onComplete?: () => void;
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
}

export function QuizTimer({
  seconds,
  onComplete,
  isActive = true,
  size = "md",
}: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isRunning, setIsRunning] = useState(isActive);

  useEffect(() => {
    setTimeLeft(seconds);
    setIsRunning(isActive);
  }, [seconds, isActive]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0 && onComplete) {
        onComplete();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const progress = (timeLeft / seconds) * 100;
  const isLow = timeLeft <= 10 && timeLeft > 5;
  const isCritical = timeLeft <= 5;
  const isUrgent = timeLeft <= 3;

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const textClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  const radius = size === "sm" ? 28 : size === "md" ? 44 : 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn(
      "relative", 
      sizeClasses[size],
      isUrgent && "animate-pulse",
      isCritical && !isUrgent && "animate-bounce"
    )}>
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="6"
        />
        {/* Progress circle with gradient */}
        <defs>
          <linearGradient id={`timer-gradient-${timeLeft}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {isUrgent ? (
              <>
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </>
            ) : isCritical ? (
              <>
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </>
            ) : isLow ? (
              <>
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#f59e0b" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </>
            )}
          </linearGradient>
        </defs>
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          stroke={`url(#timer-gradient-${timeLeft})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      {/* Timer text */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center font-bold",
          textClasses[size],
          isUrgent && "text-destructive animate-pulse",
          isCritical && !isUrgent && "text-orange-500",
          isLow && "text-yellow-600"
        )}
      >
        {timeLeft}
      </div>
      {/* Ring effect for critical time */}
      {isUrgent && (
        <div className="absolute inset-0 rounded-full border-4 border-destructive/30 animate-ping" />
      )}
    </div>
  );
}

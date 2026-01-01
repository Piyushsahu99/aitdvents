import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CoinBadgeProps {
  amount: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "glow";
  className?: string;
}

export const CoinBadge = ({ 
  amount, 
  label = "coins", 
  size = "md",
  variant = "default",
  className 
}: CoinBadgeProps) => {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const variantClasses = {
    default: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/30",
    outline: "bg-transparent border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10",
    glow: "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-500 border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.3)]",
  };

  return (
    <Badge 
      className={cn(
        "font-semibold inline-flex items-center gap-1.5 transition-all",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <Coins className={cn(iconSizes[size], "text-yellow-500")} />
      <span>+{amount}</span>
      {label && <span className="opacity-80">{label}</span>}
    </Badge>
  );
};

// Simple inline version for cards
export const CoinReward = ({ amount }: { amount: number }) => (
  <span className="inline-flex items-center gap-1 text-yellow-600 font-medium text-sm">
    <Coins className="h-3.5 w-3.5 text-yellow-500" />
    +{amount}
  </span>
);

// Compact version showing just coin icon and number
export const CoinValue = ({ amount, className }: { amount: number; className?: string }) => (
  <span className={cn("inline-flex items-center gap-1 font-semibold", className)}>
    <Coins className="h-4 w-4 text-yellow-500" />
    {amount}
  </span>
);

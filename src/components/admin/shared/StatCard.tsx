import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  bgColor?: string;
  textColor?: string;
  onClick?: () => void;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "from-primary to-primary/80",
  bgColor = "bg-primary/10",
  textColor = "text-primary",
  onClick,
  badge,
  isLoading = false,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden group transition-all duration-300",
        onClick && "cursor-pointer hover:shadow-lg hover:-translate-y-1"
      )}
      onClick={onClick}
    >
      {/* Gradient background on hover */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
          color
        )}
      />

      <CardContent className="p-4 sm:p-6">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 w-10 bg-muted rounded-xl" />
            <div className="h-8 w-20 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ) : (
          <div className="relative z-10">
            {/* Icon and Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center", bgColor)}>
                <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", textColor)} />
              </div>
              {badge && (
                <Badge variant={badge.variant || "secondary"} className="text-xs">
                  {badge.label}
                </Badge>
              )}
            </div>

            {/* Value */}
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
              
              {/* Title and Trend */}
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {title}
                </p>
                {trend && (
                  <div
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-medium",
                      trend.isPositive ? "text-success" : "text-destructive"
                    )}
                  >
                    {trend.isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{Math.abs(trend.value)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

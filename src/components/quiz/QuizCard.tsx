import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Users, 
  Calendar, 
  Clock, 
  Zap, 
  ChevronRight,
  Star,
  Timer
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizCardProps {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  organizerName: string | null;
  bannerImage: string | null;
  scheduledStart: string | null;
  status: string;
  prizes: { first?: string; second?: string; third?: string } | null;
  participantCount?: number;
  maxParticipants?: number | null;
  isRegistered?: boolean;
  onRegister?: () => void;
  onJoin?: () => void;
}

const difficultyColors = {
  easy: "bg-green-500/10 text-green-600 border-green-500/30",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  hard: "bg-red-500/10 text-red-600 border-red-500/30",
};

const categoryColors: Record<string, string> = {
  general: "from-blue-500 to-cyan-500",
  tech: "from-purple-500 to-pink-500",
  science: "from-green-500 to-emerald-500",
  entertainment: "from-orange-500 to-amber-500",
  sports: "from-red-500 to-rose-500",
  history: "from-yellow-600 to-amber-600",
};

export function QuizCard({
  title,
  description,
  category,
  difficulty,
  organizerName,
  bannerImage,
  scheduledStart,
  status,
  prizes,
  participantCount = 0,
  maxParticipants,
  isRegistered,
  onRegister,
  onJoin,
}: QuizCardProps) {
  const gradientClass = categoryColors[category?.toLowerCase()] || "from-primary to-purple-500";
  const isLive = status === "waiting" || status === "active" || status === "question_active";
  const isUpcoming = status === "draft" && scheduledStart;
  const scheduledDate = scheduledStart ? new Date(scheduledStart) : null;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="overflow-hidden h-full border-2 hover:border-primary/50 transition-colors group">
        {/* Banner */}
        <div className={cn(
          "relative h-32 sm:h-40 bg-gradient-to-br",
          gradientClass
        )}>
          {bannerImage && (
            <img
              src={bannerImage}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
            />
          )}
          
          {/* Status badge */}
          <div className="absolute top-3 left-3">
            {isLive ? (
              <Badge className="bg-red-500 text-white animate-pulse gap-1">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                LIVE
              </Badge>
            ) : isUpcoming ? (
              <Badge variant="secondary" className="gap-1">
                <Calendar className="h-3 w-3" />
                Upcoming
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-background/80">
                {status}
              </Badge>
            )}
          </div>

          {/* Difficulty badge */}
          <div className="absolute top-3 right-3">
            <Badge 
              variant="outline" 
              className={cn("capitalize border", difficultyColors[difficulty as keyof typeof difficultyColors] || difficultyColors.medium)}
            >
              {difficulty || "medium"}
            </Badge>
          </div>

          {/* Category icon */}
          <div className="absolute bottom-3 left-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Prizes indicator */}
          {prizes && (prizes.first || prizes.second || prizes.third) && (
            <div className="absolute bottom-3 right-3">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/90 text-yellow-900 text-xs font-medium">
                <Trophy className="h-3 w-3" />
                Prizes
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title and description */}
          <div>
            <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {description}
              </p>
            )}
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{participantCount}{maxParticipants ? `/${maxParticipants}` : ""}</span>
            </div>
            
            {scheduledDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDistanceToNow(scheduledDate, { addSuffix: true })}</span>
              </div>
            )}

            {organizerName && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5" />
                <span className="truncate max-w-[80px]">{organizerName}</span>
              </div>
            )}
          </div>

          {/* Scheduled time */}
          {scheduledDate && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-sm">
              <Timer className="h-4 w-4 text-primary" />
              <span>{format(scheduledDate, "MMM d, h:mm a")}</span>
            </div>
          )}

          {/* Action button */}
          <div className="pt-2">
            {isLive ? (
              <Button 
                onClick={onJoin} 
                className="w-full gap-2 bg-gradient-to-r from-primary to-purple-500"
              >
                Join Now
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : isRegistered ? (
              <Button variant="secondary" className="w-full" disabled>
                ✓ Registered
              </Button>
            ) : (
              <Button 
                onClick={onRegister} 
                variant="outline" 
                className="w-full gap-2"
              >
                Register
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

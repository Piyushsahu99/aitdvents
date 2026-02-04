import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Calendar, 
  Gift, 
  Ticket, 
  Timer, 
  Trophy, 
  Users,
  Sparkles,
  CheckCircle2
} from "lucide-react";

interface LuckyDrawCardProps {
  draw: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    scheduled_draw_at: string | null;
    winner_count: number;
    entry_cost: number;
    max_entries: number | null;
    prizes: Array<{ name: string; value: string }>;
  };
  entryCount: number;
  hasEntered: boolean;
  onEnter: () => void;
  isEntering: boolean;
}

export function LuckyDrawCard({
  draw,
  entryCount,
  hasEntered,
  onEnter,
  isEntering,
}: LuckyDrawCardProps) {
  const isUpcoming = draw.status === "upcoming";
  const isLive = draw.status === "live";
  const isCompleted = draw.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`relative overflow-hidden border-2 transition-all ${
        isLive 
          ? "border-green-500/50 shadow-lg shadow-green-500/10" 
          : isCompleted 
            ? "border-muted opacity-80" 
            : "border-primary/20 hover:border-primary/40"
      }`}>
        {/* Status badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge
            className={`${
              isLive
                ? "bg-green-500 text-white animate-pulse"
                : isCompleted
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary/20 text-primary"
            }`}
          >
            {isLive && <span className="w-2 h-2 bg-white rounded-full mr-1.5 animate-ping" />}
            {draw.status.charAt(0).toUpperCase() + draw.status.slice(1)}
          </Badge>
        </div>

        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${
          isLive 
            ? "from-green-500/10 to-emerald-500/5" 
            : "from-primary/5 to-purple-500/5"
        }`} />

        <CardHeader className="relative pb-3">
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-xl ${
              isLive 
                ? "bg-green-500/20" 
                : "bg-primary/10"
            }`}>
              <Gift className={`h-6 w-6 ${
                isLive ? "text-green-500" : "text-primary"
              }`} />
            </div>
            <div className="flex-1 min-w-0 pr-16">
              <CardTitle className="text-lg line-clamp-1">{draw.title}</CardTitle>
              {draw.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {draw.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-muted/50">
              <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-semibold">{entryCount}</p>
              <p className="text-[10px] text-muted-foreground">Entries</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <Trophy className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
              <p className="text-sm font-semibold">{draw.winner_count}</p>
              <p className="text-[10px] text-muted-foreground">Winners</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <Ticket className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-sm font-semibold">
                {draw.entry_cost === 0 ? "Free" : `${draw.entry_cost}🪙`}
              </p>
              <p className="text-[10px] text-muted-foreground">Entry</p>
            </div>
          </div>

          {/* Draw time */}
          {draw.scheduled_draw_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-lg bg-muted/30">
              <Calendar className="h-4 w-4" />
              <span>
                Draw: {format(new Date(draw.scheduled_draw_at), "PPp")}
              </span>
            </div>
          )}

          {/* Prizes preview */}
          {draw.prizes && draw.prizes.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Prizes
              </p>
              <div className="flex flex-wrap gap-1">
                {draw.prizes.slice(0, 3).map((prize, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className="text-xs bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                  >
                    {prize.name}
                  </Badge>
                ))}
                {draw.prizes.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{draw.prizes.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action button */}
          {!isCompleted && (
            <Button
              onClick={onEnter}
              disabled={hasEntered || isEntering || isCompleted}
              className={`w-full ${
                hasEntered 
                  ? "bg-green-500 hover:bg-green-500" 
                  : isLive 
                    ? "bg-green-500 hover:bg-green-600" 
                    : ""
              }`}
            >
              {hasEntered ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Entered!
                </>
              ) : isEntering ? (
                <>
                  <Timer className="h-4 w-4 mr-2 animate-spin" />
                  Entering...
                </>
              ) : (
                <>
                  <Ticket className="h-4 w-4 mr-2" />
                  Enter Draw
                </>
              )}
            </Button>
          )}

          {isCompleted && (
            <Button variant="outline" className="w-full" disabled>
              Draw Completed
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

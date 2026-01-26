import { Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizLobbyProps {
  title: string;
  description?: string | null;
  participantCount: number;
  participantNames: string[];
  isJoined: boolean;
  maxParticipants?: number | null;
}

export function QuizLobby({
  title,
  description,
  participantCount,
  participantNames,
  isJoined,
  maxParticipants,
}: QuizLobbyProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Animated waiting indicator */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-primary/20 animate-ping absolute" />
        <div className="w-24 h-24 rounded-full bg-primary/40 flex items-center justify-center relative">
          <Users className="h-12 w-12 text-primary" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      )}

      {/* Participant count */}
      <div className="flex items-center gap-2 text-2xl font-bold mb-2">
        <span className="text-primary animate-pulse">{participantCount}</span>
        <span className="text-muted-foreground">
          {maxParticipants ? `/ ${maxParticipants}` : ""} players joined
        </span>
      </div>

      {/* Status message */}
      <div className="flex items-center gap-2 text-muted-foreground mb-8">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Waiting for host to start...</span>
      </div>

      {/* Participant names ticker */}
      {participantNames.length > 0 && (
        <div className="w-full max-w-2xl overflow-hidden">
          <div className="flex flex-wrap gap-2 justify-center">
            {participantNames.slice(0, 20).map((name, index) => (
              <span
                key={index}
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  "bg-primary/10 text-primary",
                  "animate-in fade-in slide-in-from-bottom-2",
                  { "animation-delay-100": index % 3 === 0 },
                  { "animation-delay-200": index % 3 === 1 },
                  { "animation-delay-300": index % 3 === 2 }
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {name}
              </span>
            ))}
            {participantNames.length > 20 && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                +{participantNames.length - 20} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Join confirmation */}
      {isJoined && (
        <div className="mt-8 px-6 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600">
          ✓ You're in! Get ready to play.
        </div>
      )}
    </div>
  );
}

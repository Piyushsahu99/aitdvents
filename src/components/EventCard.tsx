import { Calendar, MapPin, Users, Clock, ArrowUpRight, Sparkles, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  title: string;
  description: string;
  date: string;
  location: string;
  participants?: number;
  category: string;
  image?: string;
  poster_url?: string;
  external_link?: string;
  is_online?: boolean;
  is_free?: boolean;
  days_left?: number;
  applied_count?: number;
  gradientIndex?: number;
}

const gradientClasses = [
  "from-violet-500 to-purple-600",
  "from-pink-500 to-rose-600", 
  "from-cyan-500 to-blue-600",
  "from-orange-500 to-amber-600",
  "from-emerald-500 to-teal-600",
  "from-fuchsia-500 to-pink-600",
];

export const EventCard = ({
  title,
  description,
  date,
  location,
  participants,
  category,
  image,
  poster_url,
  external_link,
  is_online = true,
  is_free = true,
  days_left,
  applied_count = 0,
  gradientIndex = 0,
}: EventCardProps) => {
  const gradientClass = gradientClasses[gradientIndex % gradientClasses.length];
  const hasPoster = poster_url || image;
  
  return (
    <div className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_-12px_hsl(var(--primary)/0.25)] hover:-translate-y-2 h-full flex flex-col">
      {/* Header with Poster or Gradient */}
      <div className={`relative ${hasPoster ? 'h-48' : 'h-32'} overflow-hidden`}>
        {hasPoster ? (
          <>
            <img
              src={poster_url || image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradientClass}`}>
            <div className="absolute inset-0">
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-700 delay-100" />
            </div>
          </div>
        )}
        
        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          <Badge className="bg-white/95 text-foreground hover:bg-white border-0 shadow-lg backdrop-blur-sm text-xs font-medium">
            {is_online ? "Online" : "Offline"}
          </Badge>
          {is_free && (
            <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-0 shadow-lg text-xs font-medium">
              <Sparkles className="w-3 h-3 mr-1" />
              Free
            </Badge>
          )}
        </div>

        {/* Coins Badge */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
          <Badge variant="secondary" className="bg-black/20 text-white border-0 backdrop-blur-sm text-xs">
            {category}
          </Badge>
          <Badge className="bg-yellow-500/90 text-white border-0 text-xs">
            <Coins className="w-3 h-3 mr-1" />
            +5 Coins
          </Badge>
        </div>

        {/* Title overlay for poster images */}
        {hasPoster && (
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <h3 className="font-bold text-white text-lg line-clamp-2 drop-shadow-lg">
              {title}
            </h3>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {!hasPoster && (
          <h3 className="font-semibold text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
        )}
        
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
          {description}
        </p>

        {/* Stats */}
        <div className="space-y-2 text-xs mb-4 flex-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">{applied_count || participants || 0} Applied</span>
          </div>
          {days_left !== null && days_left !== undefined && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-accent" />
              <span className="font-medium">{days_left} days left</span>
            </div>
          )}
          {date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button 
          size="sm" 
          className="w-full group/btn relative overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            if (external_link) window.open(external_link, '_blank');
          }}
        >
          <span className="relative z-10 flex items-center justify-center">
            View Details
            <ArrowUpRight className="h-4 w-4 ml-1.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </span>
        </Button>
      </div>
    </div>
  );
};

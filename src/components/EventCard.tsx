import { Calendar, MapPin, Users, Clock, ArrowUpRight, Sparkles } from "lucide-react";
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
  
  return (
    <div className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_-12px_hsl(var(--primary)/0.25)] hover:-translate-y-2 h-full flex flex-col">
      {/* Gradient Header */}
      <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${gradientClass}`}>
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-700 delay-100" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-white/20 group-hover:scale-[3] group-hover:opacity-0 transition-all duration-700" />
        </div>
        
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

        {/* Category Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="bg-black/20 text-white border-0 backdrop-blur-sm text-xs">
            {category}
          </Badge>
        </div>

        {/* Event Poster/Logo */}
        <div className="absolute -bottom-8 left-4 bg-card rounded-xl p-1.5 shadow-xl w-16 h-16 flex items-center justify-center border-2 border-background group-hover:scale-110 transition-transform duration-300 z-20">
          {poster_url || image ? (
            <img
              src={poster_url || image}
              alt={title}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradientClass} rounded-lg flex items-center justify-center`}>
              <span className="text-xl font-bold text-white">
                {title.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-10 flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="font-semibold text-base line-clamp-2 mb-1.5 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Stats */}
        <div className="space-y-2 text-xs mb-4 flex-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
              <Users className="h-3 w-3 text-primary" />
            </div>
            <span className="font-medium">{applied_count || participants || 0} Applied</span>
          </div>
          {days_left !== null && days_left !== undefined && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10">
                <Clock className="h-3 w-3 text-accent" />
              </div>
              <span className="font-medium">{days_left} days left</span>
            </div>
          )}
          {date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                <Calendar className="h-3 w-3" />
              </div>
              <span>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button 
          size="sm" 
          className="w-full group/btn relative overflow-hidden"
          onClick={() => external_link && window.open(external_link, '_blank')}
        >
          <span className="relative z-10 flex items-center justify-center">
            {external_link ? 'Register Now' : 'View Details'}
            <ArrowUpRight className="h-4 w-4 ml-1.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
        </Button>
      </div>
    </div>
  );
};

import { Calendar, MapPin, Users, Clock, ArrowUpRight } from "lucide-react";
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
  is_online?: boolean;
  is_free?: boolean;
  days_left?: number;
  applied_count?: number;
  gradientIndex?: number;
}

const gradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #fad961 0%, #f76b1c 100%)",
];

const decorativePattern = `
  <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="15" fill="rgba(255,255,255,0.1)" />
      </pattern>
    </defs>
    <rect width="200" height="200" fill="url(#pattern)" />
  </svg>
`;

export const EventCard = ({
  title,
  description,
  date,
  location,
  participants,
  category,
  image,
  poster_url,
  is_online = true,
  is_free = true,
  days_left,
  applied_count = 0,
  gradientIndex = 0,
}: EventCardProps) => {
  const gradient = gradients[gradientIndex % gradients.length];
  
  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 duration-300 h-full flex flex-col">
      {/* Gradient Header with Poster */}
      <div 
        className="relative h-40 overflow-hidden"
        style={{ background: gradient }}
      >
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white/20" />
          <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full border-2 border-white/20" />
        </div>
        
        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-background/90 text-foreground hover:bg-background border-0">
            {is_online ? "Online" : "Offline"}
          </Badge>
          {is_free && (
            <Badge className="bg-background/90 text-foreground hover:bg-background border-0">
              Free
            </Badge>
          )}
        </div>

        {/* Event Poster/Logo */}
        <div className="absolute bottom-0 right-4 translate-y-1/2 bg-white rounded-lg p-2 shadow-lg w-20 h-20 flex items-center justify-center">
          {poster_url || image ? (
            <img
              src={poster_url || image}
              alt={title}
              className="w-full h-full object-contain rounded"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {title.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="font-semibold text-base line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {description}
          </p>
        </div>

        {/* Stats */}
        <div className="space-y-2 text-xs mb-4 flex-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{applied_count || participants || 0} Applied</span>
          </div>
          {days_left !== null && days_left !== undefined && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{days_left} days left</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button 
          size="sm" 
          className="w-full group/btn"
          variant="outline"
        >
          View Details
          <ArrowUpRight className="h-3.5 w-3.5 ml-1 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

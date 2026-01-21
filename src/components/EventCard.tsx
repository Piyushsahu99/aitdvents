import { Calendar, MapPin, Building2, Users } from "lucide-react";
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
  college?: string | null;
  onClick?: () => void;
}

const gradientClasses = [
  "from-violet-600 via-purple-600 to-indigo-700",
  "from-pink-500 via-rose-500 to-red-600", 
  "from-cyan-500 via-blue-500 to-indigo-600",
  "from-orange-500 via-amber-500 to-yellow-600",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-fuchsia-500 via-pink-500 to-rose-600",
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
  college,
  onClick,
}: EventCardProps) => {
  const gradientClass = gradientClasses[gradientIndex % gradientClasses.length];
  const hasPoster = poster_url || image;
  
  // Format date nicely
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const day = d.getDate().toString().padStart(2, '0');
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const year = d.getFullYear();
      const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      return `${day} ${month} ${year} at ${time}`;
    } catch {
      return dateStr;
    }
  };
  
  return (
    <div 
      className="group relative bg-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl active:scale-[0.98] h-full flex flex-col border-0 shadow-lg"
      onClick={onClick}
    >
      {/* Poster/Image Section - Auto-sizing based on content */}
      <div className={`relative ${hasPoster ? 'w-full' : 'h-44'} overflow-hidden`}>
        {hasPoster ? (
          <>
            <img
              src={poster_url || image}
              alt={title}
              className="w-full h-auto max-h-[300px] object-contain bg-muted/30 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradientClass} relative`}>
            {/* Abstract geometric patterns */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-4 right-4 w-24 h-24 border-2 border-white/20 rotate-45" />
              <div className="absolute bottom-8 left-8 w-16 h-16 border-2 border-white/15 rotate-12" />
              <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 border border-white/10 rounded-full" />
              <div className="absolute top-8 left-4 w-12 h-1 bg-white/20 rotate-45" />
              <div className="absolute bottom-12 right-8 w-8 h-1 bg-white/20 -rotate-45" />
            </div>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="secondary" className="bg-white/95 text-foreground border-0 shadow-md text-xs font-medium px-2.5 py-1">
            {category}
          </Badge>
        </div>

        {/* Free/Paid Badge */}
        {is_free && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-emerald-500 text-white border-0 shadow-md text-xs font-medium px-2.5 py-1">
              Free
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-bold text-base text-foreground line-clamp-2 mb-3 leading-snug">
          {title}
        </h3>
        
        {/* Event Details */}
        <div className="space-y-2.5 text-sm flex-1">
          {/* Date */}
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm font-medium">{formatDate(date)}</span>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-3 w-3 text-success" />
            </div>
            <span className="text-sm line-clamp-1">{location}</span>
          </div>
          
          {/* College (if present) */}
          {college && (
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <div className="w-5 h-5 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-3 w-3 text-info" />
              </div>
              <span className="text-sm line-clamp-1 font-medium">{college}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button 
          size="default" 
          className="w-full mt-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-white border-0 shadow-md hover:shadow-lg transition-all"
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) {
              onClick();
            } else if (external_link) {
              window.open(external_link, '_blank');
            }
          }}
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

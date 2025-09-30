import { Calendar, MapPin, Users } from "lucide-react";
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
}

export const EventCard = ({
  title,
  description,
  date,
  location,
  participants,
  category,
  image,
}: EventCardProps) => {
  return (
    <div className="group bg-card rounded-lg border border-border overflow-hidden transition-all hover:shadow-[var(--shadow-hover)] hover:scale-[1.02]">
      {image && (
        <div className="aspect-video overflow-hidden bg-muted">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
          <Badge variant="secondary">{category}</Badge>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{location}</span>
          </div>
          {participants && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              <span>{participants} participants</span>
            </div>
          )}
        </div>
        
        <Button className="w-full">Register Now</Button>
      </div>
    </div>
  );
};

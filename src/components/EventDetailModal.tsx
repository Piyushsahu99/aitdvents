import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, ExternalLink, Sparkles } from "lucide-react";

interface EventDetailModalProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    category: string;
    poster_url?: string;
    external_link?: string;
    is_online?: boolean;
    is_free?: boolean;
    days_left?: number;
    applied_count?: number;
    hashtags?: string[];
  } | null;
  open: boolean;
  onClose: () => void;
}

export const EventDetailModal = ({ event, open, onClose }: EventDetailModalProps) => {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            {event.poster_url && (
              <img
                src={event.poster_url}
                alt={event.title}
                className="w-20 h-20 rounded-xl object-cover border border-border"
              />
            )}
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{event.title}</DialogTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{event.category}</Badge>
                <Badge variant={event.is_online ? "default" : "outline"}>
                  {event.is_online ? "Online" : "Offline"}
                </Badge>
                {event.is_free && (
                  <Badge className="bg-emerald-500 text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Free
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Event Details */}
          <div className="grid grid-cols-2 gap-4">
            {event.date && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium text-sm">
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium text-sm">{event.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Registered</p>
                <p className="font-medium text-sm">{event.applied_count || 0} participants</p>
              </div>
            </div>

            {event.days_left !== null && event.days_left !== undefined && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Time Left</p>
                  <p className="font-medium text-sm">{event.days_left} days remaining</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-3">About This Event</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Hashtags */}
          {event.hashtags && event.hashtags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.hashtags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          {event.external_link && (
            <Button 
              className="w-full gap-2" 
              size="lg"
              onClick={() => window.open(event.external_link, '_blank')}
            >
              Register Now
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

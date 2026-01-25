import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, ExternalLink, Sparkles, Share2, MessageCircle, Twitter, Linkedin, Link2, Check, Instagram, Coins } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEarnCoins, POINT_VALUES } from "@/hooks/useEarnCoins";

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
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const { toast } = useToast();
  const { earnCoins } = useEarnCoins();

  if (!event) return null;

  // Generate a shortened/personalized link with the event's external link
  const eventShareUrl = event.external_link || `${window.location.origin}/events?event=${event.id}`;
  const shareText = `🎉 Check out "${event.title}" on AITD Events! ${event.is_free ? '✨ It\'s FREE!' : ''}\n\n`;

  const handleShareReward = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await earnCoins(1, "event_share", `Shared event: ${event.title}`, event.id);
    }
  };

  const shareToWhatsApp = async () => {
    setSharing(true);
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}${eventShareUrl}`)}`;
    window.open(url, '_blank');
    await handleShareReward();
    setSharing(false);
  };

  const shareToInstagram = async () => {
    setSharing(true);
    // Instagram doesn't support direct URL sharing, so we copy to clipboard and inform user
    navigator.clipboard.writeText(`${shareText}${eventShareUrl}`);
    toast({ 
      title: "Link copied for Instagram! 📱", 
      description: "Paste it in your Instagram story or bio. +1 coin earned!" 
    });
    await handleShareReward();
    setSharing(false);
  };

  const shareToTwitter = async () => {
    setSharing(true);
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventShareUrl)}`;
    window.open(url, '_blank');
    await handleShareReward();
    setSharing(false);
  };

  const shareToLinkedIn = async () => {
    setSharing(true);
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventShareUrl)}`;
    window.open(url, '_blank');
    await handleShareReward();
    setSharing(false);
  };

  const copyLink = async () => {
    setSharing(true);
    navigator.clipboard.writeText(eventShareUrl);
    setCopied(true);
    await handleShareReward();
    toast({ title: "Link copied! +1 coin", description: "Event link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
    setSharing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-start gap-3 sm:gap-4">
            <DialogTitle className="text-base sm:text-lg md:text-xl flex-1 leading-tight">{event.title}</DialogTitle>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
            <Badge variant="secondary" className="text-[10px] sm:text-xs">{event.category}</Badge>
            <Badge variant={event.is_online ? "default" : "outline"} className="text-[10px] sm:text-xs">
              {event.is_online ? "Online" : "Offline"}
            </Badge>
            {event.is_free && (
              <Badge className="bg-success text-success-foreground text-[10px] sm:text-xs">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                Free
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 mt-3 sm:mt-4">
          {/* Event Poster - Responsive sizing */}
          {event.poster_url && (
            <div className="relative rounded-lg sm:rounded-xl overflow-hidden border border-border bg-muted/30">
              <img
                src={event.poster_url}
                alt={event.title}
                className="w-full h-auto max-h-[40vh] sm:max-h-[50vh] md:max-h-[500px] object-contain"
                loading="lazy"
              />
            </div>
          )}

          {/* Share Buttons with Coin Reward Indicator */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Share & Earn</span>
              <Badge variant="secondary" className="gap-1 text-xs">
                <Coins className="w-3 h-3" />
                +1 coin per share
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={shareToWhatsApp} 
                disabled={sharing}
                className="gap-2 bg-green-500/10 hover:bg-green-500/20 border-green-500/30"
              >
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={shareToInstagram}
                disabled={sharing}
                className="gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-pink-500/30"
              >
                <Instagram className="w-4 h-4 text-pink-600" />
                <span className="hidden sm:inline">Instagram</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={shareToTwitter}
                disabled={sharing}
                className="gap-2"
              >
                <Twitter className="w-4 h-4" />
                <span className="hidden sm:inline">Twitter</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={shareToLinkedIn}
                disabled={sharing}
                className="gap-2"
              >
                <Linkedin className="w-4 h-4" />
                <span className="hidden sm:inline">LinkedIn</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={copyLink}
                disabled={sharing}
                className="gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
              </Button>
            </div>
          </div>

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

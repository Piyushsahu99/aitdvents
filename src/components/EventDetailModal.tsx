import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, ExternalLink, Sparkles, Share2, MessageCircle, Twitter, Linkedin, Link2, Check, Gift } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [unstopReferralId, setUnstopReferralId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUnstopReferralId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from("student_profiles")
          .select("unstop_referral_id")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (data?.unstop_referral_id) {
          setUnstopReferralId(data.unstop_referral_id);
        }
      }
    };
    if (open) {
      fetchUnstopReferralId();
    }
  }, [open]);

  if (!event) return null;

  // Helper to append referral to Unstop URLs
  const getExternalLinkWithReferral = (url: string) => {
    if (!unstopReferralId) return url;
    try {
      const urlObj = new URL(url);
      // Check if it's an Unstop URL
      if (urlObj.hostname.includes('unstop.com') || urlObj.hostname.includes('dare2compete.com')) {
        urlObj.searchParams.set('ref', unstopReferralId);
        return urlObj.toString();
      }
    } catch {
      // Invalid URL, return as-is
    }
    return url;
  };

  const eventUrl = `${window.location.origin}/events?event=${event.id}`;
  const shareText = `Check out "${event.title}" on AITD! ${event.is_free ? '🎉 It\'s FREE!' : ''}`;
  const externalLinkWithRef = event.external_link ? getExternalLinkWithReferral(event.external_link) : null;

  const shareToWhatsApp = () => {
    const shareUrl = externalLinkWithRef || eventUrl;
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareToTwitter = () => {
    const shareUrl = externalLinkWithRef || eventUrl;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareToLinkedIn = () => {
    const shareUrl = externalLinkWithRef || eventUrl;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const copyLink = () => {
    const shareUrl = externalLinkWithRef || eventUrl;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ 
      title: "Link copied!", 
      description: unstopReferralId && externalLinkWithRef ? "Event link with your referral copied!" : "Event link copied to clipboard" 
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <DialogTitle className="text-xl flex-1">{event.title}</DialogTitle>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
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
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Event Poster - Prominent Display */}
          {event.poster_url && (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img
                src={event.poster_url}
                alt={event.title}
                className="w-full h-auto max-h-[400px] object-contain bg-muted"
              />
            </div>
          )}

          {/* Share Buttons */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
            <Share2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground mr-2">Share:</span>
            <Button size="sm" variant="outline" onClick={shareToWhatsApp} className="gap-2 bg-green-500/10 hover:bg-green-500/20 border-green-500/30">
              <MessageCircle className="w-4 h-4 text-green-600" />
              <span className="hidden sm:inline">WhatsApp</span>
            </Button>
            <Button size="sm" variant="outline" onClick={shareToTwitter} className="gap-2">
              <Twitter className="w-4 h-4" />
              <span className="hidden sm:inline">Twitter</span>
            </Button>
            <Button size="sm" variant="outline" onClick={shareToLinkedIn} className="gap-2">
              <Linkedin className="w-4 h-4" />
              <span className="hidden sm:inline">LinkedIn</span>
            </Button>
            <Button size="sm" variant="outline" onClick={copyLink} className="gap-2">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
            </Button>
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
            <div className="space-y-2">
              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={() => window.open(externalLinkWithRef || event.external_link, '_blank')}
              >
                Register Now
                <ExternalLink className="w-4 h-4" />
              </Button>
              {unstopReferralId && event.external_link.includes('unstop') && (
                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                  <Gift className="w-3 h-3 text-orange-500" />
                  Your Unstop referral will be tracked
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

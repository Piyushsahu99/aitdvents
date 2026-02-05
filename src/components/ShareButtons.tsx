import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Linkedin, Link2, Check, Share2, Coins, Twitter, Instagram, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEarnCoins } from "@/hooks/useEarnCoins";

interface ShareButtonsProps {
  title: string;
  url: string;
  type: "event" | "job" | "hackathon";
  referenceId?: string;
  compact?: boolean;
  showRewardBadge?: boolean;
}

export const ShareButtons = ({ 
  title, 
  url, 
  type, 
  referenceId, 
  compact = false,
  showRewardBadge = true 
}: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [personalizedUrl, setPersonalizedUrl] = useState(url);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { earnCoins } = useEarnCoins();

  // Generate personalized URL with user referral ID
  useEffect(() => {
    const generatePersonalizedUrl = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const shortRef = user.id.substring(0, 8);
        const separator = url.includes('?') ? '&' : '?';
        setPersonalizedUrl(`${url}${separator}ref=${shortRef}`);
      } else {
        setPersonalizedUrl(url);
      }
    };
    generatePersonalizedUrl();
  }, [url]);

  const shareText = type === "job" 
    ? `💼 Check out this ${type} opportunity: "${title}" on AITD Events!\n\n`
    : `🎉 Check out "${title}" on AITD Events!\n\n`;

  const handleShareReward = async () => {
    if (userId) {
      const actionType = `${type}_share`;
      await earnCoins(1, actionType, `Shared ${type}: ${title}`, referenceId);
    }
  };

  const shareToWhatsApp = async () => {
    setSharing(true);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}${personalizedUrl}`)}`;
    window.open(whatsappUrl, '_blank');
    await handleShareReward();
    toast({ 
      title: "Sharing to WhatsApp! 📱", 
      description: userId ? "+1 AITD coin earned for sharing!" : "Sign in to earn coins for sharing!" 
    });
    setSharing(false);
  };

  const shareToLinkedIn = async () => {
    setSharing(true);
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(personalizedUrl)}`;
    window.open(linkedinUrl, '_blank');
    await handleShareReward();
    toast({ 
      title: "Sharing to LinkedIn! 💼", 
      description: userId ? "+1 AITD coin earned for sharing!" : "Sign in to earn coins for sharing!" 
    });
    setSharing(false);
  };

  const shareToTwitter = async () => {
    setSharing(true);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(personalizedUrl)}`;
    window.open(twitterUrl, '_blank');
    await handleShareReward();
    toast({ 
      title: "Sharing to Twitter! 🐦", 
      description: userId ? "+1 AITD coin earned for sharing!" : "Sign in to earn coins for sharing!" 
    });
    setSharing(false);
  };

  const shareToInstagram = async () => {
    setSharing(true);
    navigator.clipboard.writeText(`${shareText}${personalizedUrl}`);
    await handleShareReward();
    toast({ 
      title: "Copied for Instagram! 📸", 
      description: userId ? "Paste it in your story or bio. +1 AITD coin earned!" : "Sign in to earn coins for sharing!" 
    });
    setSharing(false);
  };

  const copyLink = async () => {
    setSharing(true);
    navigator.clipboard.writeText(personalizedUrl);
    setCopied(true);
    await handleShareReward();
    toast({ 
      title: "Your personalized link copied! 🔗", 
      description: userId ? "+1 AITD coin earned! Share it with your friends." : "Sign in to get your personalized referral link!" 
    });
    setTimeout(() => setCopied(false), 2000);
    setSharing(false);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-0.5">
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={shareToWhatsApp} 
          disabled={sharing}
          className="h-7 w-7 hover:bg-green-500/10"
          title="Share on WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5 text-green-600" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={shareToLinkedIn}
          disabled={sharing}
          className="h-7 w-7 hover:bg-blue-500/10"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-3.5 h-3.5 text-blue-600" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={shareToTwitter}
          disabled={sharing}
          className="h-7 w-7 hover:bg-sky-500/10"
          title="Share on Twitter"
        >
          <Twitter className="w-3.5 h-3.5 text-sky-500" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={copyLink}
          disabled={sharing}
          className="h-7 w-7"
          title="Copy link"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Link2 className="w-3.5 h-3.5" />}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
      <div className="flex items-center gap-2 mb-2">
        <Share2 className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Share & Earn</span>
        {showRewardBadge && (
          <Badge variant="secondary" className="gap-1 text-xs">
            <Coins className="w-3 h-3" />
            +1 coin
          </Badge>
        )}
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
          onClick={shareToLinkedIn}
          disabled={sharing}
          className="gap-2 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30"
        >
          <Linkedin className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">LinkedIn</span>
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={shareToTwitter}
          disabled={sharing}
          className="gap-2 bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30"
        >
          <Twitter className="w-4 h-4 text-sky-500" />
          <span className="hidden sm:inline">Twitter</span>
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
          onClick={copyLink}
          disabled={sharing}
          className="gap-2"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
        </Button>
      </div>
    </div>
  );
};

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Linkedin, Link2, Check, Twitter, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ResourceShareButtonsProps {
  title: string;
  resourceType: "course" | "playlist" | "resource";
  resourceId?: string;
  platform?: string;
  compact?: boolean;
}

export const ResourceShareButtons = ({ 
  title, 
  resourceType,
  resourceId,
  platform,
  compact = true
}: ResourceShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [personalizedUrl, setPersonalizedUrl] = useState("");
  const { toast } = useToast();

  // Generate personalized URL that redirects to our Learning page
  useEffect(() => {
    const generatePersonalizedUrl = async () => {
      const baseUrl = window.location.origin;
      let url = `${baseUrl}/learning`;
      
      // Add resource reference
      if (resourceId) {
        url += `?resource=${resourceId}`;
      }
      
      // Add referral for authenticated users
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const separator = url.includes('?') ? '&' : '?';
        const shortRef = user.id.substring(0, 8);
        url += `${separator}ref=${shortRef}`;
      }
      
      setPersonalizedUrl(url);
    };
    generatePersonalizedUrl();
  }, [resourceId]);

  const getShareText = () => {
    const emoji = resourceType === "playlist" ? "🎬" : "📚";
    const platformText = platform ? ` on ${platform}` : "";
    return `${emoji} Check out this free ${resourceType}: "${title}"${platformText}!\n\nLearn for free at AITD Events Learning Hub:\n`;
  };

  const shareToWhatsApp = async () => {
    setSharing(true);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${getShareText()}${personalizedUrl}`)}`;
    window.open(whatsappUrl, '_blank');
    toast({ title: "Sharing to WhatsApp! 📱" });
    setSharing(false);
  };

  const shareToLinkedIn = async () => {
    setSharing(true);
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(personalizedUrl)}`;
    window.open(linkedinUrl, '_blank');
    toast({ title: "Sharing to LinkedIn! 💼" });
    setSharing(false);
  };

  const shareToTwitter = async () => {
    setSharing(true);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(personalizedUrl)}`;
    window.open(twitterUrl, '_blank');
    toast({ title: "Sharing to Twitter! 🐦" });
    setSharing(false);
  };

  const copyLink = async () => {
    setSharing(true);
    navigator.clipboard.writeText(`${getShareText()}${personalizedUrl}`);
    setCopied(true);
    toast({ 
      title: "Link copied! 🔗", 
      description: "Share it with your friends!" 
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
          disabled={sharing || !personalizedUrl}
          className="h-8 w-8 hover:bg-green-500/10"
          title="Share on WhatsApp"
        >
          <MessageCircle className="w-4 h-4 text-green-600" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={shareToLinkedIn}
          disabled={sharing || !personalizedUrl}
          className="h-8 w-8 hover:bg-blue-500/10"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4 text-blue-600" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={shareToTwitter}
          disabled={sharing || !personalizedUrl}
          className="h-8 w-8 hover:bg-sky-500/10"
          title="Share on Twitter"
        >
          <Twitter className="w-4 h-4 text-sky-500" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={copyLink}
          disabled={sharing || !personalizedUrl}
          className="h-8 w-8"
          title="Copy link"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Share2 className="w-4 h-4 text-muted-foreground" />
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={shareToWhatsApp} 
        disabled={sharing || !personalizedUrl}
        className="h-8 gap-1.5 hover:bg-green-500/10"
      >
        <MessageCircle className="w-4 h-4 text-green-600" />
        <span className="hidden md:inline">WhatsApp</span>
      </Button>
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={shareToLinkedIn}
        disabled={sharing || !personalizedUrl}
        className="h-8 gap-1.5 hover:bg-blue-500/10"
      >
        <Linkedin className="w-4 h-4 text-blue-600" />
        <span className="hidden md:inline">LinkedIn</span>
      </Button>
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={copyLink}
        disabled={sharing || !personalizedUrl}
        className="h-8 gap-1.5"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
        <span className="hidden md:inline">{copied ? "Copied!" : "Copy"}</span>
      </Button>
    </div>
  );
};

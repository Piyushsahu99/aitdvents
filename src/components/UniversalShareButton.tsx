import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Linkedin,
  Link2,
  Check,
  Share2,
  Coins,
  Twitter,
  Instagram,
  Facebook,
  Mail,
  QrCode,
  Download,
  Code,
  Copy,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEarnCoins } from "@/hooks/useEarnCoins";
import QRCode from "qrcode.react";

interface UniversalShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  type: "event" | "job" | "course" | "blog" | "hackathon" | "scholarship" | "resource";
  referenceId?: string;
  imageUrl?: string;
  compact?: boolean;
  variant?: "default" | "outline" | "ghost";
  showLabel?: boolean;
  showRewardBadge?: boolean;
}

export const UniversalShareButton = ({
  title,
  description = "",
  url,
  type,
  referenceId,
  imageUrl,
  compact = false,
  variant = "default",
  showLabel = true,
  showRewardBadge = true,
}: UniversalShareButtonProps) => {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [personalizedUrl, setPersonalizedUrl] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [supportsNativeShare, setSupportsNativeShare] = useState(false);
  const { earnCoins } = useEarnCoins();

  // Generate personalized URL with user referral ID
  useEffect(() => {
    const generatePersonalizedUrl = async () => {
      const baseUrl = url || `${window.location.origin}/${type}s`;
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
        const shortRef = user.id.substring(0, 8);
        const separator = baseUrl.includes('?') ? '&' : '?';
        setPersonalizedUrl(`${baseUrl}${separator}ref=${shortRef}`);
      } else {
        setPersonalizedUrl(baseUrl);
      }
    };
    generatePersonalizedUrl();
  }, [url, type]);

  // Check if native share is supported
  useEffect(() => {
    setSupportsNativeShare(typeof navigator.share !== 'undefined');
  }, []);

  // Get appropriate emoji and text for share message
  const getShareContent = () => {
    const emojis = {
      event: "🎉",
      job: "💼",
      course: "📚",
      blog: "📝",
      hackathon: "💻",
      scholarship: "🎓",
      resource: "📖",
    };

    const emoji = emojis[type] || "🚀";
    const text = `${emoji} ${title}${description ? `\n\n${description}` : ""}\n\nCheck it out on AITD Events!\n`;
    
    return { emoji, text };
  };

  const handleShareReward = async () => {
    if (userId) {
      const actionType = `${type}_share`;
      await earnCoins(1, actionType, `Shared ${type}: ${title}`, referenceId);
    }
  };

  // Native Share API
  const handleNativeShare = async () => {
    if (!supportsNativeShare) return;

    setSharing(true);
    const { text } = getShareContent();

    try {
      await navigator.share({
        title: title,
        text: text,
        url: personalizedUrl,
      });
      await handleShareReward();
      toast.success(userId ? "Shared successfully! +1 coin earned" : "Shared successfully!");
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== "AbortError") {
        console.error("Share error:", error);
      }
    } finally {
      setSharing(false);
    }
  };

  const shareToWhatsApp = async () => {
    setSharing(true);
    const { text } = getShareContent();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}${personalizedUrl}`)}`;
    window.open(whatsappUrl, "_blank");
    await handleShareReward();
    toast.success(userId ? "Shared to WhatsApp! +1 coin earned 📱" : "Opening WhatsApp...");
    setSharing(false);
  };

  const shareToLinkedIn = async () => {
    setSharing(true);
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(personalizedUrl)}`;
    window.open(linkedinUrl, "_blank");
    await handleShareReward();
    toast.success(userId ? "Shared to LinkedIn! +1 coin earned 💼" : "Opening LinkedIn...");
    setSharing(false);
  };

  const shareToTwitter = async () => {
    setSharing(true);
    const { text } = getShareContent();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(personalizedUrl)}`;
    window.open(twitterUrl, "_blank");
    await handleShareReward();
    toast.success(userId ? "Shared to Twitter! +1 coin earned 🐦" : "Opening Twitter...");
    setSharing(false);
  };

  const shareToFacebook = async () => {
    setSharing(true);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(personalizedUrl)}`;
    window.open(facebookUrl, "_blank");
    await handleShareReward();
    toast.success(userId ? "Shared to Facebook! +1 coin earned 📘" : "Opening Facebook...");
    setSharing(false);
  };

  const shareToInstagram = async () => {
    setSharing(true);
    const { text } = getShareContent();
    navigator.clipboard.writeText(`${text}${personalizedUrl}`);
    await handleShareReward();
    toast.success(userId ? "Copied for Instagram! +1 coin earned 📸\nPaste it in your story or bio" : "Link copied!");
    setSharing(false);
  };

  const shareViaEmail = async () => {
    setSharing(true);
    const { text } = getShareContent();
    const subject = encodeURIComponent(`Check out: ${title}`);
    const body = encodeURIComponent(`${text}${personalizedUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    await handleShareReward();
    toast.success(userId ? "Opening email client! +1 coin earned ✉️" : "Opening email client...");
    setSharing(false);
  };

  const copyLink = async () => {
    setSharing(true);
    navigator.clipboard.writeText(personalizedUrl);
    setCopied(true);
    await handleShareReward();
    toast.success(
      userId
        ? "Personalized link copied! +1 coin earned 🔗"
        : "Link copied to clipboard!"
    );
    setTimeout(() => setCopied(false), 2000);
    setSharing(false);
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${type}-qr-code.png`;
      link.href = url;
      link.click();
      toast.success("QR code downloaded!");
    }
  };

  const getEmbedCode = () => {
    return `<iframe src="${personalizedUrl}" width="100%" height="600" frameborder="0"></iframe>`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode());
    toast.success("Embed code copied!");
  };

  // Compact button with dropdown
  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant={variant}
            disabled={sharing || !personalizedUrl}
            className="h-8 w-8"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Share2 className="h-3.5 w-3.5" />
            Share
            {showRewardBadge && userId && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                <Coins className="h-2.5 w-2.5 mr-0.5" />
                +1
              </Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {supportsNativeShare && (
            <>
              <DropdownMenuItem onClick={handleNativeShare}>
                <Smartphone className="h-4 w-4 mr-2" />
                Share...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem onClick={shareToWhatsApp}>
            <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
            WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareToLinkedIn}>
            <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
            LinkedIn
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareToTwitter}>
            <Twitter className="h-4 w-4 mr-2 text-sky-500" />
            Twitter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareToFacebook}>
            <Facebook className="h-4 w-4 mr-2 text-blue-700" />
            Facebook
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyLink}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4 mr-2" />
                Copy Link
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowQRModal(true)}>
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full button with all options
  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {showLabel ? "Share & Earn Coins" : "Share"}
            </span>
            {showRewardBadge && userId && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Coins className="w-3 h-3" />
                +1 coin
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {supportsNativeShare && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleNativeShare}
              disabled={sharing || !personalizedUrl}
              className="gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Share...</span>
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={shareToWhatsApp}
            disabled={sharing || !personalizedUrl}
            className="gap-2 bg-green-500/10 hover:bg-green-500/20 border-green-500/30"
          >
            <MessageCircle className="w-4 h-4 text-green-600" />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={shareToLinkedIn}
            disabled={sharing || !personalizedUrl}
            className="gap-2 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30"
          >
            <Linkedin className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">LinkedIn</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={shareToTwitter}
            disabled={sharing || !personalizedUrl}
            className="gap-2 bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30"
          >
            <Twitter className="w-4 h-4 text-sky-500" />
            <span className="hidden sm:inline">Twitter</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={shareToFacebook}
            disabled={sharing || !personalizedUrl}
            className="gap-2 bg-blue-700/10 hover:bg-blue-700/20 border-blue-700/30"
          >
            <Facebook className="w-4 h-4 text-blue-700" />
            <span className="hidden sm:inline">Facebook</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={shareToInstagram}
            disabled={sharing || !personalizedUrl}
            className="gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-pink-500/30"
          >
            <Instagram className="w-4 h-4 text-pink-600" />
            <span className="hidden sm:inline">Instagram</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={shareViaEmail}
            disabled={sharing || !personalizedUrl}
            className="gap-2"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Email</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={copyLink}
            disabled={sharing || !personalizedUrl}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowQRModal(true)}
            disabled={!personalizedUrl}
            className="gap-2"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">QR</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowEmbedModal(true)}
            disabled={!personalizedUrl}
            className="gap-2"
          >
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">Embed</span>
          </Button>
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCode
                id="qr-code"
                value={personalizedUrl}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan this QR code to open the {type}
            </p>
            <Button onClick={downloadQR} className="w-full gap-2">
              <Download className="h-4 w-4" />
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Embed Code Modal */}
      <Dialog open={showEmbedModal} onOpenChange={setShowEmbedModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Embed Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Copy and paste this code into your website:
              </p>
              <div className="relative">
                <Input
                  value={getEmbedCode()}
                  readOnly
                  className="font-mono text-xs pr-20"
                />
                <Button
                  size="sm"
                  onClick={copyEmbedCode}
                  className="absolute right-1 top-1 h-7"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Note: Make sure your website allows iframe embeds for this to work properly.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

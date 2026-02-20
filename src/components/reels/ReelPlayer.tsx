import { useState, useRef, useEffect } from "react";
import { useEarnCoins, POINT_VALUES } from "@/hooks/useEarnCoins";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Heart, Share2, Play, Pause, Volume2, VolumeX, 
  Coins, Check, ExternalLink, Flag, Copy, X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Reel {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  video_url: string;
  native_video_url: string | null;
  thumbnail_url: string | null;
  category: string;
  tags: string[];
  likes_count: number;
  views_count: number;
  platform: string;
  created_at: string;
}

interface ReelPlayerProps {
  reel: Reel;
  isActive: boolean;
  isLiked: boolean;
  userId: string | null;
  onLike: (reelId: string) => void;
  onReport: (reelId: string) => void;
  hasEarnedCoins: boolean;
  onEarnCoins: (reelId: string) => void;
}

const WATCH_TIME_THRESHOLD = 15; // seconds to earn coins
const BASE_URL = "https://aitdevents.lovable.app";

export function ReelPlayer({ 
  reel, 
  isActive, 
  isLiked, 
  userId,
  onLike,
  onReport,
  hasEarnedCoins,
  onEarnCoins
}: ReelPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [watchTime, setWatchTime] = useState(0);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [userRefCode, setUserRefCode] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const watchTimeRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { earnCoins } = useEarnCoins();
  const { toast } = useToast();

  // Fetch ref code for logged in user
  useEffect(() => {
    if (userId) {
      setUserRefCode(userId.slice(0, 8));
    }
  }, [userId]);

  // Check if we have a native video
  const hasNativeVideo = !!reel.native_video_url;

  // Extract YouTube video ID for shorts/regular videos
  const getYoutubeId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes("youtu.be")) {
        return urlObj.pathname.slice(1).split('?')[0];
      }
      if (urlObj.hostname.includes("youtube.com")) {
        if (urlObj.pathname.includes("/shorts/")) {
          return urlObj.pathname.split("/shorts/")[1].split('?')[0];
        }
        return urlObj.searchParams.get("v");
      }
      return null;
    } catch {
      return null;
    }
  };

  const youtubeId = getYoutubeId(reel.video_url);
  const isYoutube = !!youtubeId;

  // Handle native video playback
  useEffect(() => {
    if (!hasNativeVideo || !videoRef.current) return;

    if (isActive) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive, hasNativeVideo]);

  // Track watch time when active
  useEffect(() => {
    if (isActive && userId && !hasEarnedCoins) {
      timerRef.current = setInterval(() => {
        watchTimeRef.current += 1;
        setWatchTime(watchTimeRef.current);
        
        if (watchTimeRef.current >= WATCH_TIME_THRESHOLD && !hasEarnedCoins) {
          onEarnCoins(reel.id);
          setShowCoinAnimation(true);
          setTimeout(() => setShowCoinAnimation(false), 2000);
        }
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, userId, hasEarnedCoins, reel.id, onEarnCoins]);

  // Reset watch time when reel changes
  useEffect(() => {
    if (!isActive) {
      watchTimeRef.current = 0;
      setWatchTime(0);
      setShowSharePanel(false);
    }
  }, [isActive]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getShareUrl = () => {
    let url = `${BASE_URL}/reels?id=${reel.id}`;
    if (userRefCode) url += `&ref=${userRefCode}`;
    return url;
  };

  const handleShareAction = async (platform: "whatsapp" | "twitter" | "linkedin" | "copy") => {
    const shareUrl = getShareUrl();
    const text = `🎬 Check this out on AITD Reels: ${reel.title}`;

    if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + "\n" + shareUrl)}`, "_blank");
    } else if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
    } else if (platform === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank");
    } else if (platform === "copy") {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied! 🔗", description: "Share it with your friends" });
    }

    setShowSharePanel(false);

    // Award coin for sharing (once per share action)
    if (userId) {
      await earnCoins(POINT_VALUES.REEL_LIKE, "reel_like", `Shared reel: ${reel.title}`, reel.id);
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const progress = Math.min((watchTime / WATCH_TIME_THRESHOLD) * 100, 100);

  return (
    <div className="relative h-full w-full bg-black snap-start snap-always">
      {/* Video Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        {hasNativeVideo ? (
          // Native video player
          <div className="relative w-full h-full" onClick={togglePlayPause}>
            <video
              ref={videoRef}
              src={reel.native_video_url!}
              className="w-full h-full object-contain"
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              poster={reel.thumbnail_url || undefined}
            />
            {/* Play/Pause overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-10 h-10 text-white fill-white" />
                </div>
              </div>
            )}
          </div>
        ) : isYoutube ? (
          // YouTube embed
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${isActive ? 1 : 0}&mute=1&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1&rel=0&playsinline=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          // External link fallback with better styling
          <a
            href={reel.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-700"
          >
            <div className="text-center text-white space-y-4">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto animate-pulse">
                <Play className="w-12 h-12 fill-white" />
              </div>
              <div>
                <p className="text-lg font-semibold capitalize">Watch on {reel.platform}</p>
                <p className="text-sm text-white/70">Tap to open</p>
              </div>
            </div>
          </a>
        )}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

      {/* Coin Earning Progress (top) */}
      {userId && !hasEarnedCoins && isActive && (
        <div className="absolute top-4 left-4 right-16 z-20">
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-400" />
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-white/80">
              {hasEarnedCoins ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                `${Math.max(0, WATCH_TIME_THRESHOLD - watchTime)}s`
              )}
            </span>
          </div>
        </div>
      )}

      {/* Coin Earned Animation */}
      {showCoinAnimation && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <Coins className="w-5 h-5" />
            <span className="font-bold">+{POINT_VALUES.REEL_WATCH} Coins!</span>
          </div>
        </div>
      )}

      {/* Mute button for native video */}
      {hasNativeVideo && (
        <button
          onClick={(e) => { e.stopPropagation(); toggleMute(); }}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      )}

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-32 z-20 flex flex-col items-center gap-5">
        {/* Like */}
        <button 
          onClick={() => onLike(reel.id)}
          className="flex flex-col items-center gap-1"
        >
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
            isLiked 
              ? "bg-red-500/20 text-red-500" 
              : "bg-white/10 text-white hover:bg-white/20"
          )}>
            <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
          </div>
          <span className="text-white text-xs font-medium">
            {formatNumber(reel.likes_count)}
          </span>
        </button>

        {/* Share — opens share panel */}
        <button 
          onClick={() => setShowSharePanel(true)}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-white text-xs font-medium">Share</span>
        </button>

        {/* External Link */}
        {!hasNativeVideo && (
          <a 
            href={reel.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
              <ExternalLink className="w-6 h-6" />
            </div>
            <span className="text-white text-xs font-medium">Open</span>
          </a>
        )}

        {/* Report */}
        <button 
          onClick={() => onReport(reel.id)}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
            <Flag className="w-5 h-5" />
          </div>
          <span className="text-white text-xs font-medium">Report</span>
        </button>

        {/* Coin Earned Badge */}
        {hasEarnedCoins && (
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Check className="w-6 h-6 text-yellow-400" />
          </div>
        )}
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-4 left-4 right-20 z-20">
        <div className="space-y-2">
          {/* Category Badge */}
          <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
            {reel.category}
          </Badge>

          {/* Title */}
          <h3 className="text-white font-semibold text-lg line-clamp-2">
            {reel.title}
          </h3>

          {/* Description */}
          {reel.description && (
            <p className="text-white/80 text-sm line-clamp-2">
              {reel.description}
            </p>
          )}

          {/* Tags */}
          {reel.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {reel.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-white/60 text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Share Panel Overlay */}
      {showSharePanel && (
        <div 
          className="absolute inset-0 z-40 flex items-end"
          onClick={() => setShowSharePanel(false)}
        >
          <div 
            className="w-full bg-zinc-900/95 backdrop-blur-xl rounded-t-3xl p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle + header */}
            <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-semibold text-base">Share Reel</p>
                <p className="text-white/50 text-xs">Earn +1 coin when you share 🪙</p>
              </div>
              <button onClick={() => setShowSharePanel(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {/* WhatsApp */}
              <button
                onClick={() => handleShareAction("whatsapp")}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#25D366]/20 flex items-center justify-center group-active:scale-95 transition-transform">
                  <svg className="w-7 h-7 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <span className="text-white/80 text-xs">WhatsApp</span>
              </button>

              {/* Twitter/X */}
              <button
                onClick={() => handleShareAction("twitter")}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center group-active:scale-95 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="text-white/80 text-xs">Twitter/X</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => handleShareAction("linkedin")}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0077B5]/20 flex items-center justify-center group-active:scale-95 transition-transform">
                  <svg className="w-6 h-6 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <span className="text-white/80 text-xs">LinkedIn</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={() => handleShareAction("copy")}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center group-active:scale-95 transition-transform">
                  <Copy className="w-6 h-6 text-white/80" />
                </div>
                <span className="text-white/80 text-xs">Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

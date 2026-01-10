import { useState, useRef, useEffect, useCallback } from "react";
import { useEarnCoins, POINT_VALUES } from "@/hooks/useEarnCoins";
import { 
  Heart, Share2, Play, Pause, Volume2, VolumeX, 
  Coins, Check, ExternalLink, Flag
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const watchTimeRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    }
  }, [isActive]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const handleShare = async () => {
    const shareUrl = reel.native_video_url || reel.video_url;
    if (navigator.share) {
      try {
        await navigator.share({
          title: reel.title,
          text: reel.description || "Check out this educational reel!",
          url: shareUrl,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
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

        {/* Share */}
        <button 
          onClick={handleShare}
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
    </div>
  );
}

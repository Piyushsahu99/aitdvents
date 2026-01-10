import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEarnCoins, POINT_VALUES } from "@/hooks/useEarnCoins";
import { ReelPlayer } from "./ReelPlayer";
import { Loader2, Film, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface ReelsFeedProps {
  onOpenSubmit: () => void;
  onReport: (reelId: string) => void;
  selectedCategory: string;
  searchQuery: string;
}

export function ReelsFeed({ onOpenSubmit, onReport, selectedCategory, searchQuery }: ReelsFeedProps) {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [earnedReels, setEarnedReels] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { earnCoins } = useEarnCoins();

  useEffect(() => {
    fetchReels();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchUserLikes(user.id);
      fetchEarnedReels(user.id);
    }
  };

  const fetchReels = async () => {
    try {
      const { data, error } = await supabase
        .from("reels")
        .select("*")
        .eq("is_approved", true)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReels(data || []);
    } catch (error) {
      console.error("Error fetching reels:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("reel_likes")
        .select("reel_id")
        .eq("user_id", userId);

      if (data) {
        setLikedReels(new Set(data.map(like => like.reel_id)));
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const fetchEarnedReels = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("reel_views")
        .select("reel_id")
        .eq("user_id", userId)
        .eq("earned_coins", true);

      if (data) {
        setEarnedReels(new Set(data.map(view => view.reel_id)));
      }
    } catch (error) {
      console.error("Error fetching earned reels:", error);
    }
  };

  const handleLike = async (reelId: string) => {
    if (!user) {
      toast({ title: "Please login", description: "You need to login to like reels", variant: "destructive" });
      return;
    }

    const isLiked = likedReels.has(reelId);

    try {
      if (isLiked) {
        await supabase.from("reel_likes").delete().eq("reel_id", reelId).eq("user_id", user.id);
        setLikedReels(prev => {
          const newSet = new Set(prev);
          newSet.delete(reelId);
          return newSet;
        });
        setReels(prev => prev.map(r => 
          r.id === reelId ? { ...r, likes_count: Math.max(0, r.likes_count - 1) } : r
        ));
      } else {
        await supabase.from("reel_likes").insert({ reel_id: reelId, user_id: user.id });
        setLikedReels(prev => new Set([...prev, reelId]));
        setReels(prev => prev.map(r => 
          r.id === reelId ? { ...r, likes_count: r.likes_count + 1 } : r
        ));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleEarnCoins = useCallback(async (reelId: string) => {
    if (!user || earnedReels.has(reelId)) return;

    try {
      await supabase.from("reel_views").upsert({
        reel_id: reelId,
        user_id: user.id,
        watched_seconds: 15,
        earned_coins: true,
      }, { onConflict: 'reel_id,user_id' });

      await earnCoins(POINT_VALUES.REEL_WATCH, "reel_watch", "Watched an educational reel", reelId);

      const currentReel = reels.find(r => r.id === reelId);
      if (currentReel) {
        await supabase
          .from("reels")
          .update({ views_count: (currentReel.views_count || 0) + 1 })
          .eq("id", reelId);
      }

      setEarnedReels(prev => new Set([...prev, reelId]));
    } catch (error) {
      console.error("Error earning coins:", error);
    }
  }, [user, earnedReels, earnCoins, reels]);

  // Handle scroll to detect active reel
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < filteredReels.length) {
      setActiveIndex(newIndex);
    }
  }, [activeIndex]);

  // Filter reels
  const filteredReels = reels.filter(reel => {
    const matchesCategory = selectedCategory === "All" || reel.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      reel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reel.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reel.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (filteredReels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-white p-8">
        <Film className="w-16 h-16 mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No reels found</h3>
        <p className="text-muted-foreground text-center mb-6">
          Be the first to share educational content!
        </p>
        <Button onClick={onOpenSubmit} className="bg-white text-black hover:bg-white/90">
          <Plus className="w-4 h-4 mr-2" />
          Share Your First Reel
        </Button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      onScroll={handleScroll}
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {filteredReels.map((reel, index) => (
        <div 
          key={reel.id} 
          className="h-full w-full snap-start snap-always"
          style={{ scrollSnapAlign: 'start' }}
        >
          <ReelPlayer
            reel={reel}
            isActive={index === activeIndex}
            isLiked={likedReels.has(reel.id)}
            userId={user?.id || null}
            onLike={handleLike}
            onReport={onReport}
            hasEarnedCoins={earnedReels.has(reel.id)}
            onEarnCoins={handleEarnCoins}
          />
        </div>
      ))}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, ArrowRight, Calendar, Image as ImageIcon, Lock } from "lucide-react";

interface Gallery {
  id: string;
  event_title: string;
  cover_image_url: string | null;
  event_date: string | null;
  photo_count: number;
}

export function EventGallerySection() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);

  useEffect(() => {
    const fetchGalleries = async () => {
      const { data } = await supabase
        .from("event_galleries")
        .select("id, event_title, cover_image_url, event_date, photo_count")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (data) setGalleries(data);
    };
    fetchGalleries();
  }, []);

  if (galleries.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 lg:py-14 px-4 bg-gradient-to-r from-primary/5 via-accent/5 to-warning/5">
      <div className="container mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <Badge className="mb-2 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
            <Camera className="w-3 h-3 mr-1" />
            Event Memories
          </Badge>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1.5">
            Relive Our <span className="bg-gradient-to-r from-primary to-warning bg-clip-text text-transparent">Past Events</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            Browse photos from our past events — enter the password shared during the event to unlock!
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-7">
          {galleries.map((g, index) => (
            <Link
              key={g.id}
              to="/gallery"
              className="group relative rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-lg active:scale-[0.97] transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/20 to-warning/20">
                {g.cover_image_url ? (
                  <img
                    src={g.cover_image_url}
                    alt={g.event_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${
                    index % 3 === 0 ? "from-primary/30 to-accent/30" :
                    index % 3 === 1 ? "from-warning/30 to-primary/30" :
                    "from-accent/30 to-warning/30"
                  }`}>
                    <Camera className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute top-2 right-2">
                <Badge className="bg-background/80 text-foreground backdrop-blur-sm text-[8px] sm:text-[10px]">
                  <Lock className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5" /> Protected
                </Badge>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <h3 className="text-white font-bold text-[11px] sm:text-sm line-clamp-2 drop-shadow-lg mb-1">
                  {g.event_title}
                </h3>
                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-white/80">
                  {g.event_date && (
                    <span className="flex items-center gap-0.5">
                      <Calendar className="h-2.5 w-2.5" /> {g.event_date}
                    </span>
                  )}
                  <span className="flex items-center gap-0.5">
                    <ImageIcon className="h-2.5 w-2.5" /> {g.photo_count}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link to="/gallery">
            <Button className="rounded-xl px-6 active:scale-95 transition-transform">
              <Camera className="mr-2 h-4 w-4" />
              View Full Gallery
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

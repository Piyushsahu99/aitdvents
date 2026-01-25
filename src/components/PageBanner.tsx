import { usePageBanners } from "@/hooks/useSiteContent";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface PageBannerProps {
  page: string;
  position?: string;
}

export function PageBanner({ page, position = "top" }: PageBannerProps) {
  const { banners, loading } = usePageBanners(page, position);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  if (loading || banners.length === 0) return null;

  const visibleBanners = banners.filter((b) => !dismissedIds.includes(b.id));

  if (visibleBanners.length === 0) return null;

  return (
    <div className="space-y-3 sm:space-y-4">
      {visibleBanners.map((banner) => (
        <div
          key={banner.id}
          className="relative overflow-hidden rounded-lg sm:rounded-xl border"
          style={{
            background: banner.background_color || "linear-gradient(135deg, hsl(var(--primary)/0.1), hsl(var(--accent)/0.1))",
          }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-6">
            {banner.image_url && (
              <img
                src={banner.image_url}
                alt={banner.title || "Banner"}
                className="w-full sm:w-32 md:w-48 h-28 sm:h-20 md:h-24 object-cover rounded-lg"
                loading="lazy"
              />
            )}
            <div className="flex-1 text-center sm:text-left">
              {banner.title && (
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1">{banner.title}</h3>
              )}
              {banner.description && (
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{banner.description}</p>
              )}
            </div>
            {banner.link_url && (
              <Link to={banner.link_url}>
                <Button size="sm" className="shrink-0 text-xs sm:text-sm h-9 sm:h-10">
                  {banner.link_text || "Learn More"}
                  <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            )}
          </div>
          <button
            onClick={() => setDismissedIds([...dismissedIds, banner.id])}
            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1 rounded-full hover:bg-background/50 transition-colors"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </button>
        </div>
      ))}
    </div>
  );
}

interface PlaceholderSectionProps {
  id: string;
  className?: string;
}

export function PlaceholderSection({ id, className = "" }: PlaceholderSectionProps) {
  return (
    <div
      id={id}
      className={`min-h-[100px] border-2 border-dashed border-muted rounded-xl flex items-center justify-center ${className}`}
    >
      <p className="text-muted-foreground text-sm">
        Banner/Promo Section - Manage from Admin Panel
      </p>
    </div>
  );
}
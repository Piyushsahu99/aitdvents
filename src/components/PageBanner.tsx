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
    <div className="space-y-4">
      {visibleBanners.map((banner) => (
        <div
          key={banner.id}
          className="relative overflow-hidden rounded-xl border"
          style={{
            background: banner.background_color || "linear-gradient(135deg, hsl(var(--primary)/0.1), hsl(var(--accent)/0.1))",
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-4 p-4 md:p-6">
            {banner.image_url && (
              <img
                src={banner.image_url}
                alt={banner.title || "Banner"}
                className="w-full md:w-48 h-32 md:h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-1 text-center md:text-left">
              {banner.title && (
                <h3 className="text-lg md:text-xl font-bold mb-1">{banner.title}</h3>
              )}
              {banner.description && (
                <p className="text-sm text-muted-foreground">{banner.description}</p>
              )}
            </div>
            {banner.link_url && (
              <Link to={banner.link_url}>
                <Button className="shrink-0">
                  {banner.link_text || "Learn More"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
          <button
            onClick={() => setDismissedIds([...dismissedIds, banner.id])}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-background/50 transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
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
import { useState, useEffect } from "react";
import { EventCard } from "@/components/EventCard";
import { SearchBar } from "@/components/SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, ChevronLeft, Calendar, Sparkles, TrendingUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageBanner, PlaceholderSection } from "@/components/PageBanner";
import { useSiteContent, usePageBanners } from "@/hooks/useSiteContent";

export default function Events() {
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { getValue } = useSiteContent("events");
  const { banners: topBanners } = usePageBanners("events", "top");
  const { banners: middleBanners } = usePageBanners("events", "middle");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "live")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(events.map((e: any) => e.category))];

  const filteredEvents = search
    ? events.filter((event: any) =>
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase())
      )
    : selectedCategory
    ? events.filter((event: any) => event.category === selectedCategory)
    : null;

  const scrollLeft = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-mesh">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-events rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-accent/30 to-primary/30 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-2 text-sm animate-fade-in-down">
              <Sparkles className="w-4 h-4 mr-2" />
              Discover Amazing Opportunities
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up">
              {getValue("hero", "title", "Events & ")}
              <span className="text-gradient-primary">
                Competitions
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up stagger-1">
              {getValue("hero", "subtitle", "Explore the Events that are creating a buzz among your peers! Join hackathons, workshops, and competitions.")}
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap justify-center gap-8 mb-10 animate-fade-in-up stagger-2">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">{events.length}</div>
                <div className="text-sm text-muted-foreground">Live Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent">{categories.length}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {events.reduce((acc, e) => acc + (e.applied_count || 0), 0)}+
                </div>
                <div className="text-sm text-muted-foreground">Participants</div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto animate-fade-in-up stagger-3">
              <SearchBar
                placeholder="Search events, hackathons, workshops..."
                value={search}
                onChange={(val) => {
                  setSearch(val);
                  setSelectedCategory(null);
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        {/* Top Banner */}
        {topBanners.length > 0 ? (
          <div className="mb-8 animate-fade-in">
            <PageBanner page="events" position="top" />
          </div>
        ) : (
          <PlaceholderSection id="events-top-banner" className="mb-8" />
        )}

        {/* Category Filter */}
        {categories.length > 0 && !search && (
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filter by category</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setSelectedCategory(null)}
              >
                All Events
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
                <div className="h-36 bg-muted" />
                <div className="p-4 pt-10 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-9 bg-muted rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Show filtered results */}
            {filteredEvents ? (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      {search ? "Search Results" : selectedCategory}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  {(search || selectedCategory) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearch("");
                        setSelectedCategory(null);
                      }}
                    >
                      Clear filter
                    </Button>
                  )}
                </div>
                
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground text-lg font-medium">
                      No events found
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your search or filter
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEvents.map((event: any, index: number) => (
                      <div key={event.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                        <EventCard
                          {...event}
                          gradientIndex={index % 6}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Middle Banner */}
                {middleBanners.length > 0 ? (
                  <div className="mb-10">
                    <PageBanner page="events" position="middle" />
                  </div>
                ) : (
                  <PlaceholderSection id="events-middle-banner" className="mb-10" />
                )}

                {/* Category-wise horizontal scrolling sections */}
                {categories.map((cat, catIndex) => {
                  const categoryEvents = events.filter((e) => e.category === cat);
                  if (categoryEvents.length === 0) return null;

                  return (
                    <div key={cat} className="mb-12 animate-fade-in" style={{ animationDelay: `${catIndex * 0.1}s` }}>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${
                              catIndex % 2 === 0 ? 'from-primary to-accent' : 'from-accent to-primary'
                            }`} />
                            {cat}
                          </h2>
                          <p className="text-muted-foreground text-sm mt-1">
                            {categoryEvents.length} amazing opportunit{categoryEvents.length !== 1 ? 'ies' : 'y'} waiting for you
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => scrollLeft(`category-${catIndex}`)}
                            className="rounded-full h-9 w-9 hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => scrollRight(`category-${catIndex}`)}
                            className="rounded-full h-9 w-9 hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="gap-2 hidden sm:flex"
                            onClick={() => setSelectedCategory(cat)}
                          >
                            View all
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div
                        id={`category-${catIndex}`}
                        className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                      >
                        {categoryEvents.map((event: any, index: number) => (
                          <div key={event.id} className="flex-none w-[300px] snap-start">
                            <EventCard {...event} gradientIndex={index % 6} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Empty state */}
                {events.length === 0 && (
                  <div className="text-center py-20">
                    <Calendar className="w-16 h-16 mx-auto text-muted-foreground/30 mb-6" />
                    <h3 className="text-2xl font-semibold mb-2">No events yet</h3>
                    <p className="text-muted-foreground">
                      Check back soon for exciting events and competitions!
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

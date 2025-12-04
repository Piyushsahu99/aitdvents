import { useState, useEffect } from "react";
import { EventCard } from "@/components/EventCard";
import { EventDetailModal } from "@/components/EventDetailModal";
import { SearchBar } from "@/components/SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Sparkles, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Events() {
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

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

  const filteredEvents = events.filter((event: any) => {
    const matchesSearch = search
      ? event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesCategory = selectedCategory
      ? event.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-mesh">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-events rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Discover Opportunities
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Events & <span className="text-gradient-primary">Competitions</span>
            </h1>
            
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Explore hackathons, workshops, and competitions happening around you.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <SearchBar
                placeholder="Search events..."
                value={search}
                onChange={(val) => setSearch(val)}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-12">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
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
                  <div className="h-9 bg-muted rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg font-medium">No events found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search || selectedCategory ? "Try adjusting your search or filter" : "Check back soon for new events!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event: any, index: number) => (
              <div 
                key={event.id} 
                onClick={() => setSelectedEvent(event)}
                className="cursor-pointer"
              >
                <EventCard {...event} gradientIndex={index % 6} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
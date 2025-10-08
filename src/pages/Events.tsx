import { useState, useEffect } from "react";
import { EventCard } from "@/components/EventCard";
import { SearchBar } from "@/components/SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Events() {
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Events & Competitions</h1>
          <p className="text-muted-foreground">
            Explore the Events that are creating a buzz among your peers!
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <SearchBar
            placeholder="Search Opportunities"
            value={search}
            onChange={setSearch}
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : (
          <>
            {/* Show search results if searching */}
            {filteredEvents ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Search Results</h2>
                </div>
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No events found matching your search
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEvents.map((event: any, index: number) => (
                      <EventCard
                        key={event.id}
                        {...event}
                        gradientIndex={index % 4}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Category-wise horizontal scrolling sections */}
                {categories.map((cat, catIndex) => {
                  const categoryEvents = events.filter((e) => e.category === cat);
                  if (categoryEvents.length === 0) return null;

                  return (
                    <div key={cat} className="mb-12">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold">{cat}</h2>
                          <p className="text-muted-foreground text-sm">
                            Discover amazing {cat.toLowerCase()} opportunities
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => scrollLeft(`category-${catIndex}`)}
                            className="rounded-full"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => scrollRight(`category-${catIndex}`)}
                            className="rounded-full"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" className="gap-2">
                            View all
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div
                        id={`category-${catIndex}`}
                        className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                      >
                        {categoryEvents.map((event: any, index: number) => (
                          <div key={event.id} className="flex-none w-80 snap-start">
                            <EventCard {...event} gradientIndex={index % 4} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

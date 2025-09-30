import { useState } from "react";
import { EventCard } from "@/components/EventCard";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { events } from "@/data/mockData";

export default function Events() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [...new Set(events.map((e) => e.category))];

  const filteredEvents = events.filter(
    (event) =>
      (category === "All" || event.category === category) &&
      (event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Events & Hackathons</h1>
        <p className="text-muted-foreground">Discover upcoming tech events and competitions</p>
      </div>

      <div className="space-y-6 mb-8">
        <SearchBar
          placeholder="Search events..."
          value={search}
          onChange={setSearch}
        />
        <CategoryFilter
          categories={categories}
          selected={category}
          onSelect={setCategory}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

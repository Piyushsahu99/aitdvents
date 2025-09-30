import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Video, MessageCircle, Calendar } from "lucide-react";

const mockMentors = [
  {
    id: 1,
    name: "Dr. Priya Mehta",
    title: "Senior ML Engineer at Google",
    expertise: ["Machine Learning", "AI", "Python"],
    rating: 4.9,
    sessions: 120,
    price: "₹2,000/hr",
    category: "AI/ML",
  },
  {
    id: 2,
    name: "Rahul Sharma",
    title: "Staff Engineer at Microsoft",
    expertise: ["System Design", "Cloud", "Backend"],
    rating: 4.8,
    sessions: 95,
    price: "₹1,500/hr",
    category: "Backend",
  },
  {
    id: 3,
    name: "Anjali Gupta",
    title: "Lead Product Designer at Figma",
    expertise: ["UI/UX", "Product Design", "Figma"],
    rating: 5.0,
    sessions: 80,
    price: "₹1,800/hr",
    category: "Design",
  },
];

export default function Mentorship() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [...new Set(mockMentors.map((m) => m.category))];

  const filteredMentors = mockMentors.filter(
    (mentor) =>
      (category === "All" || mentor.category === category) &&
      (mentor.name.toLowerCase().includes(search.toLowerCase()) ||
        mentor.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Find Your Mentor</h1>
        <p className="text-muted-foreground">
          Get guidance from industry experts to accelerate your career
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <SearchBar
          placeholder="Search mentors..."
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
        {filteredMentors.map((mentor) => (
          <div
            key={mentor.id}
            className="p-6 bg-card rounded-xl border border-border hover:shadow-[var(--shadow-hover)] transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{mentor.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{mentor.title}</p>
                
                <div className="flex items-center gap-4 text-sm mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-medium">{mentor.rating}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {mentor.sessions} sessions
                  </div>
                </div>
              </div>
              <Badge variant="secondary">{mentor.category}</Badge>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {mentor.expertise.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="font-semibold text-primary">{mentor.price}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button size="sm">Book Session</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

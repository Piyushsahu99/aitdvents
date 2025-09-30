import { useState } from "react";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Upload } from "lucide-react";

const mockReels = [
  { id: 1, title: "My First React Project", category: "Web Dev", views: "1.2k" },
  { id: 2, title: "Building a ML Model", category: "AI/ML", views: "850" },
  { id: 3, title: "UI/UX Design Process", category: "Design", views: "2k" },
  { id: 4, title: "Hackathon Project Demo", category: "Hackathon", views: "3.5k" },
];

export default function Reels() {
  const [category, setCategory] = useState("All");

  const categories = [...new Set(mockReels.map((r) => r.category))];

  const filteredReels =
    category === "All" ? mockReels : mockReels.filter((r) => r.category === category);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Student Reels</h1>
          <p className="text-muted-foreground">
            Short project demos and tech content from students
          </p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Reel
        </Button>
      </div>

      <div className="mb-8">
        <CategoryFilter
          categories={categories}
          selected={category}
          onSelect={setCategory}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredReels.map((reel) => (
          <div
            key={reel.id}
            className="group relative aspect-[9/16] bg-muted rounded-lg overflow-hidden cursor-pointer hover:shadow-[var(--shadow-hover)] transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <Play className="h-12 w-12 text-white group-hover:scale-110 transition-transform" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <Badge variant="secondary" className="mb-2">
                {reel.category}
              </Badge>
              <h3 className="text-white font-semibold mb-1">{reel.title}</h3>
              <p className="text-white/80 text-sm">{reel.views} views</p>
            </div>
          </div>
        ))}
      </div>

      {filteredReels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No reels found in this category</p>
        </div>
      )}
    </div>
  );
}

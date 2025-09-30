import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { aiTools } from "@/data/mockData";
import { ExternalLink, Lightbulb } from "lucide-react";

export default function AITools() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [...new Set(aiTools.map((t) => t.category))];

  const filteredTools = aiTools.filter(
    (tool) =>
      (category === "All" || tool.category === category) &&
      (tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">AI Tools Library</h1>
        <p className="text-muted-foreground">
          Discover and learn how to use cutting-edge AI tools
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <SearchBar
          placeholder="Search AI tools..."
          value={search}
          onChange={setSearch}
        />
        <CategoryFilter
          categories={categories}
          selected={category}
          onSelect={setCategory}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className="p-6 bg-card rounded-lg border border-border hover:shadow-[var(--shadow-hover)] transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-semibold">{tool.name}</h3>
              <Badge variant="secondary">{tool.category}</Badge>
            </div>
            
            <p className="text-muted-foreground mb-4">{tool.description}</p>
            
            <div className="flex items-start gap-2 mb-4 p-3 bg-muted/30 rounded-md">
              <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Use Case:</p>
                <p className="text-sm text-muted-foreground">{tool.useCase}</p>
              </div>
            </div>
            
            <Button variant="outline" className="w-full" asChild>
              <a href={tool.link} target="_blank" rel="noopener noreferrer">
                Visit Tool
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No AI tools found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

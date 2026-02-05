import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiTools } from "@/data/mockData";
import { ExternalLink, Lightbulb, Wrench, Sparkles, Zap, Search, Link2, Image, QrCode } from "lucide-react";

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Link Shortener":
      return <Link2 className="w-4 h-4" />;
    case "Image Tools":
      return <Image className="w-4 h-4" />;
    case "QR Code":
      return <QrCode className="w-4 h-4" />;
    default:
      return <Zap className="w-4 h-4" />;
  }
};

export default function AITools() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const toolCategories = ["All", ...new Set(aiTools.map((t) => t.category))];

  const filteredTools = aiTools.filter(
    (tool) =>
      (category === "All" || tool.category === category) &&
      (tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase()))
  );

  // Group tools by category for better organization
  const groupedTools = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof filteredTools>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Hero Section */}
      <div className="relative py-16 px-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Free Productivity Tools
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            AI & Utility Tools
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Essential free tools for students: Link shorteners, image editors, QR generators, and more
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Wrench className="w-5 h-5 text-white" />
              <span className="text-white font-medium">{aiTools.length}+ Tools</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Zap className="w-5 h-5 text-white" />
              <span className="text-white font-medium">100% Free</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Link2 className="w-5 h-5 text-white" />
              <span className="text-white font-medium">No Signup Required</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="space-y-6 mb-8">
          <div className="max-w-xl mx-auto">
            <SearchBar
              placeholder="Search tools (e.g., 'link shortener', 'remove background')"
              value={search}
              onChange={setSearch}
            />
          </div>
          <CategoryFilter
            categories={toolCategories}
            selected={category}
            onSelect={setCategory}
          />
        </div>

        {/* Tools Grid */}
        {category === "All" ? (
          // Grouped view when showing all
          <div className="space-y-10">
            {Object.entries(groupedTools).map(([categoryName, tools]) => (
              <div key={categoryName}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {getCategoryIcon(categoryName)}
                  </div>
                  <h2 className="text-xl font-semibold">{categoryName}</h2>
                  <Badge variant="secondary" className="ml-2">{tools.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Flat view when filtered
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        {filteredTools.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tools found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter</p>
          </div>
        )}

        {/* CTA Banner */}
        <div className="mt-12 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20">
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-bold mb-2">Looking for Courses & Tutorials?</h3>
            <p className="text-muted-foreground mb-4">Check out our Learning Hub for free courses and YouTube playlists</p>
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
              <a href="/learning">
                Explore Learning Hub
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: typeof aiTools[0] }) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-1">
            {tool.name}
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] shrink-0">
            {tool.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{tool.description}</p>
        
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground line-clamp-2">{tool.useCase}</p>
        </div>
        
        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
          <a href={tool.link} target="_blank" rel="noopener noreferrer">
            Visit Tool
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

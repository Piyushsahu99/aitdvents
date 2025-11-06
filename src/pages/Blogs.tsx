import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { User, Calendar, Clock, Sparkles, BookOpen, PenTool } from "lucide-react";
import blogHero from "@/assets/blog-hero.jpg";

export default function Blogs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*, events(title, date)")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(blogs.map((b: any) => b.category))];

  const filteredBlogs = blogs.filter(
    (blog: any) =>
      (category === "All" || blog.category === category) &&
      (blog.title.toLowerCase().includes(search.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-pink-100 via-orange-50 to-yellow-100 dark:from-pink-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={blogHero} alt="Blog" className="w-full h-full object-cover" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 mb-6">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Share Your Story</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Student <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Blogs</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Read and share experiences from the student community
            </p>
            <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              <PenTool className="mr-2 h-5 w-5" />
              Write a Blog
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">{/* Search and Filters */}

      <div className="space-y-6 mb-8">
        <SearchBar
          placeholder="Search blogs..."
          value={search}
          onChange={setSearch}
        />
        <CategoryFilter
          categories={categories}
          selected={category}
          onSelect={setCategory}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading blogs...</p>
        </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog: any, index: number) => (
              <Card
                key={blog.id}
                className="p-0 overflow-hidden hover-lift cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card Image Placeholder with Gradient */}
                <div className="h-48 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{blog.category}</Badge>
                      {blog.ai_generated && (
                        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{blog.excerpt}</p>
                  
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-medium">{blog.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{blog.read_time}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredBlogs.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground text-lg">No blogs found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

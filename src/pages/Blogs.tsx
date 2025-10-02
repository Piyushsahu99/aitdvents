import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { User, Calendar, Clock, Sparkles } from "lucide-react";

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Student Blogs</h1>
          <p className="text-muted-foreground">
            Read and share experiences from the student community
          </p>
        </div>
        <Button>Write a Blog</Button>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBlogs.map((blog: any) => (
            <Card
              key={blog.id}
              className="p-6 hover:shadow-[var(--shadow-hover)] transition-all group cursor-pointer"
            >
              <div className="flex items-start gap-2 mb-4">
                <Badge variant="secondary">{blog.category}</Badge>
                {blog.ai_generated && (
                  <Badge variant="outline" className="bg-primary/10">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI
                  </Badge>
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {blog.title}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-3">{blog.excerpt}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>{blog.author}</span>
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
            </Card>
          ))}
        </div>
      )}

      {filteredBlogs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No blogs found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

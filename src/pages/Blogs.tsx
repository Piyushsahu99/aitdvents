import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { User, Calendar, Clock, Sparkles, BookOpen, PenTool, ArrowRight, TrendingUp } from "lucide-react";
import blogHero from "@/assets/blog-hero.jpg";
import { BlogWriteModal } from "@/components/BlogWriteModal";

export default function Blogs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWriteModal, setShowWriteModal] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
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
        blog.excerpt?.toLowerCase().includes(search.toLowerCase()))
  );

  // Featured blog = first one
  const featuredBlog = filteredBlogs[0];
  const restBlogs = filteredBlogs.slice(1);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-background py-16 md:py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={blogHero} alt="" className="w-full h-full object-cover" aria-hidden="true" />
        </div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 mb-6">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Community Stories & Insights</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
              Student <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Blogs</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Read experiences, tips, and updates from the student community. Got something to share? Write your own!
            </p>
            <Button size="lg" className="shadow-lg hover:shadow-xl transition-all rounded-full px-8" onClick={() => setShowWriteModal(true)}>
              <PenTool className="mr-2 h-5 w-5" />
              Write a Blog
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="space-y-5 mb-10">
          <SearchBar
            placeholder="Search blogs by title or topic..."
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
          <div className="space-y-8">
            {/* Featured skeleton */}
            <Skeleton className="h-64 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-44 w-full rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Featured Blog */}
            {featuredBlog && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Link to={`/blogs/${featuredBlog.id}`} className="block mb-10">
                  <Card className="p-0 overflow-hidden hover-lift group border-border/50">
                    <div className="grid md:grid-cols-2">
                      <div className="h-48 md:h-auto bg-gradient-to-br from-primary/20 via-accent/15 to-primary/10 relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent md:bg-gradient-to-r" />
                        <BookOpen className="h-20 w-20 text-primary/30 relative z-0" />
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                          <Badge className="rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
                            <TrendingUp className="h-3 w-3 mr-1" /> Latest
                          </Badge>
                        </div>
                      </div>
                      <div className="p-6 md:p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className="rounded-full">{featuredBlog.category}</Badge>
                          {featuredBlog.ai_generated && (
                            <Badge variant="outline" className="rounded-full">
                              <Sparkles className="h-3 w-3 mr-1" /> AI
                            </Badge>
                          )}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {featuredBlog.title}
                        </h2>
                        <p className="text-muted-foreground mb-5 line-clamp-3">{featuredBlog.excerpt}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xs">
                              {featuredBlog.author?.charAt(0)?.toUpperCase() || "A"}
                            </div>
                            <span className="font-medium">{featuredBlog.author}</span>
                          </div>
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(featuredBlog.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{featuredBlog.read_time}</span>
                        </div>
                        <div className="mt-5">
                          <span className="inline-flex items-center text-sm font-semibold text-primary group-hover:gap-2 transition-all gap-1">
                            Read Article <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            )}

            {/* Blog Grid */}
            {restBlogs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restBlogs.map((blog: any, index: number) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link to={`/blogs/${blog.id}`} className="block h-full">
                      <Card className="p-0 overflow-hidden hover-lift cursor-pointer group h-full border-border/50">
                        {/* Top accent bar */}
                        <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
                        
                        {/* Card Content */}
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="rounded-full text-xs">{blog.category}</Badge>
                            {blog.ai_generated && (
                              <Badge variant="outline" className="rounded-full text-xs">
                                <Sparkles className="h-3 w-3 mr-1" /> AI
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {blog.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">{blog.excerpt}</p>
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border/50">
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-[10px]">
                                {blog.author?.charAt(0)?.toUpperCase() || "A"}
                              </div>
                              <span className="font-medium truncate max-w-[100px]">{blog.author}</span>
                            </div>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(blog.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                            <span className="flex items-center gap-1 ml-auto">
                              <Clock className="h-3 w-3" />
                              {blog.read_time}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {filteredBlogs.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="rounded-full bg-muted p-6 inline-block mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-lg font-medium">No blogs found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search or category</p>
            <Button variant="outline" className="mt-6 rounded-full" onClick={() => setShowWriteModal(true)}>
              <PenTool className="mr-2 h-4 w-4" /> Be the first to write one
            </Button>
          </div>
        )}
      </div>

      <BlogWriteModal
        open={showWriteModal}
        onOpenChange={setShowWriteModal}
        onBlogCreated={fetchBlogs}
      />
    </div>
  );
}

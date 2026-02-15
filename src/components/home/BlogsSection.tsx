import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ArrowRight, User, Calendar, Clock, Sparkles } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  read_time: string;
  ai_generated: boolean | null;
  created_at: string | null;
}

export function BlogsSection() {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data } = await supabase
        .from("blogs")
        .select("id, title, excerpt, author, category, read_time, ai_generated, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (data) setBlogs(data);
    };
    fetchBlogs();
  }, []);

  if (blogs.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 lg:py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <Badge className="mb-2 text-xs sm:text-sm bg-primary/10 text-primary border-primary/20">
            <BookOpen className="w-3 h-3 mr-1" />
            From Our Blog
          </Badge>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1.5">
            Student <span className="bg-gradient-to-r from-primary to-warning bg-clip-text text-transparent">Stories & Insights</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            Read experiences, tips, and stories from our student community
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-7">
          {blogs.map((blog, index) => (
            <Link key={blog.id} to="/blogs" className="animate-fade-in" style={{ animationDelay: `${index * 0.06}s` }}>
              <Card className="group h-full overflow-hidden hover:shadow-lg active:scale-[0.98] transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30">
                {/* Gradient header */}
                <div className={`h-28 sm:h-32 bg-gradient-to-br ${
                  index % 3 === 0 ? "from-primary/20 via-accent/20 to-warning/10" :
                  index % 3 === 1 ? "from-blue-500/20 via-cyan-500/15 to-teal-500/10" :
                  "from-purple-500/20 via-pink-500/15 to-rose-500/10"
                } relative`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[10px]">{blog.category}</Badge>
                    {blog.ai_generated && (
                      <Badge variant="outline" className="bg-background/80 text-[10px]">
                        <Sparkles className="h-2.5 w-2.5 mr-0.5" /> AI
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-3 sm:p-4">
                  <h3 className="font-bold text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
                    {blog.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 mb-3">{blog.excerpt}</p>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-primary" /> {blog.author}
                    </span>
                    {blog.created_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-primary" />
                        {new Date(blog.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" /> {blog.read_time}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link to="/blogs">
            <Button variant="outline" className="rounded-xl text-sm sm:text-base px-4 sm:px-6 active:scale-95 transition-transform">
              Read All Blogs <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

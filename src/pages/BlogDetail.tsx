import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  ArrowLeft, User, Calendar, Clock, Sparkles, Share2,
  Copy, MessageCircle, Twitter, Linkedin, BookOpen, ArrowRight
} from "lucide-react";

const PUBLISHED_BASE = import.meta.env.VITE_APP_URL || window.location.origin;

function ShareButtons({ title, url }: { title: string; url: string }) {
  const { toast } = useToast();
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied! 🔗", description: "Blog link copied to clipboard." });
  };

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <span className="text-sm text-muted-foreground font-semibold flex items-center gap-1.5">
        <Share2 className="h-4 w-4" /> Share
      </span>
      <Button size="sm" variant="outline" className="gap-1.5 rounded-full hover:bg-accent/10 border-accent/30" asChild>
        <a href={`https://wa.me/?text=${encodedTitle}%20${encoded}`} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </a>
      </Button>
      <Button size="sm" variant="outline" className="gap-1.5 rounded-full hover:bg-primary/10 border-primary/30" asChild>
        <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`} target="_blank" rel="noopener noreferrer">
          <Twitter className="h-3.5 w-3.5" /> Twitter
        </a>
      </Button>
      <Button size="sm" variant="outline" className="gap-1.5 rounded-full hover:bg-primary/10 border-primary/30" asChild>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`} target="_blank" rel="noopener noreferrer">
          <Linkedin className="h-3.5 w-3.5" /> LinkedIn
        </a>
      </Button>
      <Button size="sm" variant="outline" className="gap-1.5 rounded-full" onClick={copyLink}>
        <Copy className="h-3.5 w-3.5" /> Copy
      </Button>
    </div>
  );
}

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchBlog = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", id)
        .eq("published", true)
        .maybeSingle();

      if (error || !data) {
        setLoading(false);
        return;
      }
      setBlog(data);

      const { data: rel } = await supabase
        .from("blogs")
        .select("id, title, excerpt, category, author, created_at, read_time")
        .eq("published", true)
        .eq("category", data.category)
        .neq("id", id)
        .order("created_at", { ascending: false })
        .limit(3);

      setRelated(rel || []);
      setLoading(false);
    };
    fetchBlog();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 py-12 px-4">
          <div className="container mx-auto max-w-3xl space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-10 w-1/2" />
            <div className="flex gap-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>
        <div className="container mx-auto max-w-3xl px-4 py-10 space-y-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="rounded-full bg-muted p-6">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-lg font-medium">Blog not found</p>
        <Button variant="outline" onClick={() => navigate("/blogs")} className="rounded-full">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blogs
        </Button>
      </div>
    );
  }

  const blogUrl = `${PUBLISHED_BASE}/blogs/${blog.id}`;

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-background overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="relative container mx-auto max-w-3xl px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Button variant="ghost" size="sm" className="mb-8 rounded-full hover:bg-background/60" onClick={() => navigate("/blogs")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> All Blogs
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <div className="flex items-center gap-2 mb-4">
              <Badge className="rounded-full px-3 py-1 text-xs font-semibold">{blog.category}</Badge>
              {blog.ai_generated && (
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                  <Sparkles className="h-3 w-3 mr-1" /> AI Generated
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
              {blog.title}
            </h1>

            {blog.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-2xl">
                {blog.excerpt}
              </p>
            )}

            {/* Author & Meta */}
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {blog.author?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div>
                  <p className="font-semibold text-sm">{blog.author}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(blog.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {blog.read_time}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <ShareButtons title={blog.title} url={blogUrl} />
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        className="container mx-auto max-w-3xl px-4 py-10 md:py-14"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <article className="text-base md:text-lg leading-8 whitespace-pre-wrap text-foreground/90">
          {blog.content}
        </article>

        <Separator className="my-10" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <ShareButtons title={blog.title} url={blogUrl} />
          <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground" onClick={() => navigate("/blogs")}>
            More Blogs <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Related Blogs */}
        {related.length > 0 && (
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold mb-2">More in {blog.category}</h2>
            <p className="text-muted-foreground mb-6 text-sm">Continue reading related articles</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((r, i) => (
                <Link key={r.id} to={`/blogs/${r.id}`}>
                  <Card className="p-0 overflow-hidden hover-lift group h-full border-border/50">
                    <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                    <div className="p-5">
                      <Badge variant="secondary" className="mb-3 text-xs rounded-full">{r.category}</Badge>
                      <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">{r.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{r.excerpt}</p>
                      <p className="text-xs text-muted-foreground">{r.author} · {r.read_time}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

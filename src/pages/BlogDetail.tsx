import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, User, Calendar, Clock, Sparkles, Share2,
  Copy, MessageCircle, Twitter, Linkedin
} from "lucide-react";

const PUBLISHED_BASE = "https://aitdevents.lovable.app";

function ShareButtons({ title, url }: { title: string; url: string }) {
  const { toast } = useToast();
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Blog link copied to clipboard." });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground font-medium flex items-center gap-1">
        <Share2 className="h-4 w-4" /> Share:
      </span>
      <Button size="sm" variant="outline" className="gap-1.5" asChild>
        <a href={`https://wa.me/?text=${encodedTitle}%20${encoded}`} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4 text-green-600" /> WhatsApp
        </a>
      </Button>
      <Button size="sm" variant="outline" className="gap-1.5" asChild>
        <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`} target="_blank" rel="noopener noreferrer">
          <Twitter className="h-4 w-4 text-sky-500" /> Twitter
        </a>
      </Button>
      <Button size="sm" variant="outline" className="gap-1.5" asChild>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`} target="_blank" rel="noopener noreferrer">
          <Linkedin className="h-4 w-4 text-blue-700" /> LinkedIn
        </a>
      </Button>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={copyLink}>
        <Copy className="h-4 w-4" /> Copy Link
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

      // Fetch related blogs (same category, exclude current)
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
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading blog...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-lg">Blog not found</p>
        <Button variant="outline" onClick={() => navigate("/blogs")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blogs
        </Button>
      </div>
    );
  }

  const blogUrl = `${PUBLISHED_BASE}/blogs/${blog.id}`;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 py-10 px-4">
        <div className="container mx-auto max-w-3xl">
          <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate("/blogs")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blogs
          </Button>
          <Badge variant="secondary" className="mb-3">{blog.category}</Badge>
          {blog.ai_generated && (
            <Badge variant="outline" className="ml-2 mb-3">
              <Sparkles className="h-3 w-3 mr-1" /> AI Generated
            </Badge>
          )}
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-primary" />{blog.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" />{new Date(blog.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" />{blog.read_time}</span>
          </div>
          <ShareButtons title={blog.title} url={blogUrl} />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <article className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
          {blog.content}
        </article>

        <Separator className="my-10" />
        <ShareButtons title={blog.title} url={blogUrl} />

        {/* Related Blogs */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Blogs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link key={r.id} to={`/blogs/${r.id}`}>
                  <Card className="p-5 hover:shadow-md transition-shadow h-full">
                    <Badge variant="secondary" className="mb-2 text-xs">{r.category}</Badge>
                    <h3 className="font-semibold line-clamp-2 mb-2">{r.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{r.excerpt}</p>
                    <p className="text-xs text-muted-foreground mt-3">{r.author} · {r.read_time}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

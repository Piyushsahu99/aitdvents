import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";
import { EnhancedBlogEditor } from "@/components/blog/EnhancedBlogEditor";

interface BlogWriteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBlogCreated: () => void;
}

const CATEGORIES = [
  "Technology", "Career", "Campus Life", "Internship", "Hackathon",
  "Interview Tips", "Study Tips", "Personal Growth", "Events",
  "AKTU Updates", "Roadmap", "Tips & Tricks", "University News", "Opportunities", "Other"
];

export function BlogWriteModal({ open, onOpenChange, onBlogCreated }: BlogWriteModalProps) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const estimateReadTime = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !category || !excerpt.trim()) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (title.length > 200) {
      toast({ title: "Title too long", description: "Title must be under 200 characters.", variant: "destructive" });
      return;
    }
    if (excerpt.length > 500) {
      toast({ title: "Excerpt too long", description: "Excerpt must be under 500 characters.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Not logged in", description: "Please log in to write a blog.", variant: "destructive" });
        return;
      }

      // Get author name from profile or email
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      const authorName = profile?.full_name || user.email || "Anonymous";

      const { error } = await supabase.from("blogs").insert({
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        category,
        author: authorName,
        user_id: user.id,
        read_time: estimateReadTime(content),
        published: true,
        ai_generated: false,
      } as any);

      if (error) throw error;

      toast({ title: "Blog published! 🎉", description: "Your blog is now live for everyone to read." });
      setTitle("");
      setExcerpt("");
      setContent("");
      setCategory("");
      onOpenChange(false);
      onBlogCreated();
    } catch (error: any) {
      console.error("Blog creation error:", error);
      toast({ title: "Error", description: error.message || "Failed to publish blog.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-bold">Write a Blog ✍️</DialogTitle>
          <p className="text-sm text-muted-foreground">Share your knowledge and experiences with the community</p>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-120px)] px-6 pb-6">
        <div className="space-y-5">
          <div>
            <Label htmlFor="blog-title">Title *</Label>
            <Input
              id="blog-title"
              placeholder="An eye-catching title for your blog..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="blog-category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="blog-excerpt">Short Summary *</Label>
            <Textarea
              id="blog-excerpt"
              placeholder="A brief summary of your blog (shown in previews)..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              maxLength={500}
              className="min-h-[60px]"
            />
            <p className="text-xs text-muted-foreground mt-1">{excerpt.length}/500</p>
          </div>

          <div>
            <Label htmlFor="blog-content">Content * (Markdown Supported)</Label>
            <EnhancedBlogEditor
              value={content}
              onChange={setContent}
              placeholder="Write your blog content here... Share your experiences, tips, and insights with the community!&#10;&#10;**Tip:** Use the toolbar to format your text with headings, lists, links, and more!"
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {loading ? "Publishing..." : "Publish Blog"}
          </Button>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

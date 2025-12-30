import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SearchBar } from "@/components/SearchBar";
import { useToast } from "@/hooks/use-toast";
import { useEarnCoins } from "@/hooks/useEarnCoins";
import { 
  Play, Heart, Flag, Plus, ExternalLink, Film, Youtube, Instagram, 
  Linkedin, Share2, Eye, AlertTriangle, Loader2, Trash2, CheckCircle,
  Shield, FileText, Coins
} from "lucide-react";
import { z } from "zod";

// Validation schema
const reelSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().trim().max(500, "Description must be less than 500 characters").optional(),
  video_url: z.string().url("Please enter a valid URL").refine((url) => {
    const validDomains = ['youtube.com', 'youtu.be', 'instagram.com', 'linkedin.com', 'vimeo.com', 'twitter.com', 'x.com'];
    try {
      const urlObj = new URL(url);
      return validDomains.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  }, "Only YouTube, Instagram, LinkedIn, Vimeo, and Twitter/X links are allowed"),
  category: z.string().min(1, "Please select a category"),
  platform: z.string().min(1, "Please select a platform"),
  tags: z.string().max(200, "Tags must be less than 200 characters").optional(),
});

const reportSchema = z.object({
  reason: z.string().min(1, "Please select a reason"),
  description: z.string().trim().max(500, "Description must be less than 500 characters").optional(),
});

interface Reel {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string;
  tags: string[];
  likes_count: number;
  views_count: number;
  platform: string;
  created_at: string;
}

const CATEGORIES = ["Programming", "Career Tips", "Interview Prep", "Tech News", "Project Showcase", "Study Tips", "Motivation", "Tutorials", "Other"];
const PLATFORMS = [
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "other", label: "Other", icon: Share2 },
];

const REPORT_REASONS = [
  "Spam or misleading",
  "Not educational content",
  "Inappropriate content",
  "Copyright violation",
  "Harassment or hate speech",
  "Other",
];

export default function Reels() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [user, setUser] = useState<any>(null);
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  
  // Form state
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedReelForReport, setSelectedReelForReport] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    category: "",
    platform: "",
    tags: "",
  });
  const [reportData, setReportData] = useState({
    reason: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { earnCoins, POINT_VALUES } = useEarnCoins();

  useEffect(() => {
    fetchReels();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchUserLikes(user.id);
    }
  };

  const fetchReels = async () => {
    try {
      const { data, error } = await supabase
        .from("reels")
        .select("*")
        .eq("is_approved", true)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReels(data || []);
    } catch (error) {
      console.error("Error fetching reels:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("reel_likes")
        .select("reel_id")
        .eq("user_id", userId);

      if (data) {
        setLikedReels(new Set(data.map(like => like.reel_id)));
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Please login", description: "You need to login to share reels", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (!acceptedTerms) {
      toast({ title: "Terms Required", description: "Please accept the terms and conditions", variant: "destructive" });
      return;
    }

    // Validate form
    const result = reelSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const tagsArray = formData.tags
        ? formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      const { error } = await supabase.from("reels").insert({
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        video_url: formData.video_url.trim(),
        category: formData.category,
        platform: formData.platform,
        tags: tagsArray,
      });

      if (error) throw error;

      // Earn coins for sharing a reel
      await earnCoins(POINT_VALUES.REEL_UPLOAD, "reel_upload", "Shared an educational reel");

      toast({ 
        title: "Reel shared!", 
        description: "Your educational reel is now live on the platform",
      });

      setFormData({ title: "", description: "", video_url: "", category: "", platform: "", tags: "" });
      setAcceptedTerms(false);
      setShowSubmitDialog(false);
      fetchReels();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to share reel", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (reelId: string) => {
    if (!user) {
      toast({ title: "Please login", description: "You need to login to like reels", variant: "destructive" });
      return;
    }

    const isLiked = likedReels.has(reelId);

    try {
      if (isLiked) {
        await supabase.from("reel_likes").delete().eq("reel_id", reelId).eq("user_id", user.id);
        setLikedReels(prev => {
          const newSet = new Set(prev);
          newSet.delete(reelId);
          return newSet;
        });
      } else {
        await supabase.from("reel_likes").insert({ reel_id: reelId, user_id: user.id });
        setLikedReels(prev => new Set([...prev, reelId]));
      }
      fetchReels(); // Refresh to get updated counts
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleReport = async () => {
    if (!user || !selectedReelForReport) return;

    const result = reportSchema.safeParse(reportData);
    if (!result.success) {
      toast({ title: "Error", description: "Please select a reason for reporting", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("reel_reports").insert({
        reel_id: selectedReelForReport,
        user_id: user.id,
        reason: reportData.reason,
        description: reportData.description || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already reported", description: "You have already reported this reel", variant: "destructive" });
        } else {
          throw error;
        }
      } else {
        toast({ title: "Report submitted", description: "Thank you for helping keep our community safe" });
      }

      setShowReportDialog(false);
      setSelectedReelForReport(null);
      setReportData({ reason: "", description: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to submit report", variant: "destructive" });
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = PLATFORMS.find(p => p.value === platform);
    const Icon = platformData?.icon || Share2;
    return <Icon className="w-4 h-4" />;
  };

  const getEmbedUrl = (url: string, platform: string) => {
    try {
      const urlObj = new URL(url);
      
      if (platform === "youtube" || urlObj.hostname.includes("youtube") || urlObj.hostname.includes("youtu.be")) {
        let videoId = "";
        if (urlObj.hostname.includes("youtu.be")) {
          videoId = urlObj.pathname.slice(1);
        } else {
          videoId = urlObj.searchParams.get("v") || "";
          // Handle shorts
          if (urlObj.pathname.includes("/shorts/")) {
            videoId = urlObj.pathname.split("/shorts/")[1];
          }
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const filteredReels = reels.filter(reel => {
    const matchesCategory = selectedCategory === "All" || reel.category === selectedCategory;
    const matchesSearch = reel.title.toLowerCase().includes(search.toLowerCase()) ||
      reel.description?.toLowerCase().includes(search.toLowerCase()) ||
      reel.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500/5 via-background to-purple-500/5">
      {/* Hero Section */}
      <div className="relative py-16 px-4 bg-gradient-to-r from-pink-600 to-purple-600">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            <Film className="w-4 h-4 mr-2" />
            Educational Reels
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Share & Discover Educational Content
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-2">
            Share your educational videos, tutorials, and career tips with the community
          </p>
          <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30 mb-6">
            <Coins className="w-4 h-4 mr-2" />
            Earn {POINT_VALUES.REEL_UPLOAD} coins per reel shared!
          </Badge>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
                  <Plus className="mr-2 h-5 w-5" />
                  Share Your Reel
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Film className="w-5 h-5" />
                    Share Educational Reel
                  </DialogTitle>
                  <DialogDescription>
                    Share your educational content with the community. Your reel will be published immediately.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title *</label>
                    <Input
                      placeholder="e.g., 5 Tips to Crack Technical Interviews"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Video URL *</label>
                    <Input
                      placeholder="https://youtube.com/watch?v=... or Instagram/LinkedIn URL"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      className={errors.video_url ? "border-red-500" : ""}
                    />
                    {errors.video_url && <p className="text-red-500 text-xs mt-1">{errors.video_url}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported: YouTube, Instagram, LinkedIn, Vimeo, Twitter/X
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category *</label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Platform *</label>
                      <Select
                        value={formData.platform}
                        onValueChange={(value) => setFormData({ ...formData, platform: value })}
                      >
                        <SelectTrigger className={errors.platform ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {PLATFORMS.map(platform => (
                            <SelectItem key={platform.value} value={platform.value}>
                              <span className="flex items-center gap-2">
                                <platform.icon className="w-4 h-4" />
                                {platform.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.platform && <p className="text-red-500 text-xs mt-1">{errors.platform}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      placeholder="Brief description of your content..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags</label>
                    <Input
                      placeholder="react, javascript, tips (comma separated)"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                  </div>

                  {/* Terms and Conditions */}
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                      />
                      <label htmlFor="terms" className="text-sm leading-relaxed">
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={() => setShowTermsDialog(true)}
                          className="text-primary underline hover:no-underline"
                        >
                          Terms & Conditions
                        </button>{" "}
                        and confirm that my content is educational and appropriate.
                      </label>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      Content that violates guidelines will be removed automatically
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting || !acceptedTerms}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Publish Reel
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => setShowTermsDialog(true)}
            >
              <FileText className="mr-2 h-5 w-5" />
              View Guidelines
            </Button>
          </div>
        </div>
      </div>

      {/* Terms Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Community Guidelines & Terms
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4 text-sm">
            <section>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Acceptable Content
              </h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Educational tutorials and how-to videos</li>
                <li>Career advice and interview preparation tips</li>
                <li>Programming tutorials and coding tips</li>
                <li>Project showcases and demonstrations</li>
                <li>Study tips and productivity advice</li>
                <li>Tech news and industry insights</li>
                <li>Motivational content for students</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Prohibited Content
              </h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Spam, misleading, or clickbait content</li>
                <li>Adult, violent, or inappropriate content</li>
                <li>Harassment, hate speech, or discrimination</li>
                <li>Copyright-infringing content</li>
                <li>Promotional content without educational value</li>
                <li>Political or religious propaganda</li>
                <li>Personal attacks or defamation</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Security & Moderation
              </h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Content is published immediately but monitored by the community</li>
                <li>Users can report inappropriate content</li>
                <li>Content with 5+ reports is automatically hidden pending review</li>
                <li>Admins reserve the right to remove any content</li>
                <li>Repeated violations may result in account suspension</li>
                <li>Only supported video platforms are allowed (YouTube, Instagram, LinkedIn, Vimeo, Twitter/X)</li>
              </ul>
            </section>

            <section className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">By submitting content, you agree that:</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>You own or have rights to share the content</li>
                <li>Your content is educational and appropriate</li>
                <li>You accept responsibility for your submissions</li>
                <li>Platform may remove content at its discretion</li>
              </ul>
            </section>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowTermsDialog(false)}>I Understand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-500" />
              Report Content
            </DialogTitle>
            <DialogDescription>
              Help us maintain a safe community by reporting inappropriate content.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Reason for reporting *</label>
              <Select
                value={reportData.reason}
                onValueChange={(value) => setReportData({ ...reportData, reason: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map(reason => (
                    <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Additional details (optional)</label>
              <Textarea
                placeholder="Provide more context about the issue..."
                value={reportData.description}
                onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReport}>Submit Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="space-y-4 mb-8">
          <SearchBar
            placeholder="Search reels by title, description, or tags..."
            value={search}
            onChange={setSearch}
          />
          <CategoryFilter
            categories={["All", ...CATEGORIES]}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border-pink-500/20">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-pink-600">{reels.length}</p>
              <p className="text-xs text-muted-foreground">Total Reels</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{CATEGORIES.length}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {reels.reduce((sum, r) => sum + r.likes_count, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Likes</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-green-600">Free</p>
              <p className="text-xs text-muted-foreground">For Everyone</p>
            </CardContent>
          </Card>
        </div>

        {/* Reels Grid */}
        {filteredReels.length === 0 ? (
          <div className="text-center py-16">
            <Film className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No reels found</h3>
            <p className="text-muted-foreground mb-4">Be the first to share educational content!</p>
            <Button onClick={() => setShowSubmitDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Share Your First Reel
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReels.map((reel) => {
              const embedUrl = getEmbedUrl(reel.video_url, reel.platform);
              const isLiked = likedReels.has(reel.id);

              return (
                <Card key={reel.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* Video Embed or Link */}
                  <div className="relative aspect-video bg-muted">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <a
                        href={reel.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600"
                      >
                        <div className="text-center text-white">
                          <Play className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">Watch on {reel.platform}</p>
                        </div>
                      </a>
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-black/70 text-white">
                        {getPlatformIcon(reel.platform)}
                        <span className="ml-1">{reel.platform}</span>
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base line-clamp-2">{reel.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className="w-fit text-xs">{reel.category}</Badge>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {reel.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{reel.description}</p>
                    )}

                    {reel.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {reel.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(reel.id)}
                          className={`flex items-center gap-1 text-sm transition-colors ${
                            isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                          {reel.likes_count}
                        </button>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          {reel.views_count}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={reel.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => {
                            if (!user) {
                              toast({ title: "Please login", description: "You need to login to report content", variant: "destructive" });
                              return;
                            }
                            setSelectedReelForReport(reel.id);
                            setShowReportDialog(true);
                          }}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
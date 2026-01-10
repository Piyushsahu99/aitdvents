import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useEarnCoins, POINT_VALUES } from "@/hooks/useEarnCoins";
import { ReelsFeed } from "@/components/reels/ReelsFeed";
import { 
  Plus, Film, Youtube, Instagram, Linkedin, Share2, Loader2, CheckCircle,
  Shield, FileText, Coins, Search, X, ChevronLeft, AlertTriangle, Upload, Link
} from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";

// Validation schemas
const linkReelSchema = z.object({
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

const uploadReelSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().trim().max(500, "Description must be less than 500 characters").optional(),
  category: z.string().min(1, "Please select a category"),
  tags: z.string().max(200, "Tags must be less than 200 characters").optional(),
});

const reportSchema = z.object({
  reason: z.string().min(1, "Please select a reason"),
  description: z.string().trim().max(500, "Description must be less than 500 characters").optional(),
});

const CATEGORIES = ["All", "Programming", "Career Tips", "Interview Prep", "Tech News", "Project Showcase", "Study Tips", "Motivation", "Tutorials", "Other"];
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
  const [user, setUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedReelForReport, setSelectedReelForReport] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [submitTab, setSubmitTab] = useState<"upload" | "link">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  const { earnCoins } = useEarnCoins();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload MP4, WebM, or MOV video", variant: "destructive" });
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 50MB", variant: "destructive" });
      return;
    }

    setSelectedFile(file);
  };

  const uploadVideo = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    setUploading(true);
    setUploadProgress(0);

    try {
      const { data, error } = await supabase.storage
        .from('reel-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('reel-videos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitUpload = async () => {
    if (!user) {
      toast({ title: "Please login", description: "You need to login to share reels", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (!acceptedTerms) {
      toast({ title: "Terms Required", description: "Please accept the terms and conditions", variant: "destructive" });
      return;
    }

    if (!selectedFile) {
      toast({ title: "No video selected", description: "Please select a video file to upload", variant: "destructive" });
      return;
    }

    const result = uploadReelSchema.safeParse(formData);
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
      // Upload video first
      const videoUrl = await uploadVideo(selectedFile);
      if (!videoUrl) throw new Error("Failed to upload video");

      const tagsArray = formData.tags
        ? formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      const { error } = await supabase.from("reels").insert({
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        video_url: videoUrl, // Use the same URL for both
        native_video_url: videoUrl,
        category: formData.category,
        platform: "native",
        tags: tagsArray,
      });

      if (error) throw error;

      await earnCoins(POINT_VALUES.REEL_UPLOAD, "reel_upload", "Shared an educational reel");

      toast({ 
        title: "Reel shared! 🎉", 
        description: `You earned ${POINT_VALUES.REEL_UPLOAD} coins for sharing!`,
      });

      resetForm();
      window.location.reload();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to share reel", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitLink = async () => {
    if (!user) {
      toast({ title: "Please login", description: "You need to login to share reels", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (!acceptedTerms) {
      toast({ title: "Terms Required", description: "Please accept the terms and conditions", variant: "destructive" });
      return;
    }

    const result = linkReelSchema.safeParse(formData);
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

      await earnCoins(POINT_VALUES.REEL_UPLOAD, "reel_upload", "Shared an educational reel");

      toast({ 
        title: "Reel shared! 🎉", 
        description: `You earned ${POINT_VALUES.REEL_UPLOAD} coins for sharing!`,
      });

      resetForm();
      window.location.reload();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to share reel", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", video_url: "", category: "", platform: "", tags: "" });
    setAcceptedTerms(false);
    setShowSubmitDialog(false);
    setSelectedFile(null);
    setErrors({});
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

  const openReport = (reelId: string) => {
    if (!user) {
      toast({ title: "Please login", description: "You need to login to report content", variant: "destructive" });
      return;
    }
    setSelectedReelForReport(reelId);
    setShowReportDialog(true);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Reels</span>
          </div>

          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
        </div>

        {/* Search & Filter Bar */}
        {showSearch && (
          <div className="px-4 pb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                    selectedCategory === cat
                      ? "bg-white text-black"
                      : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reels Feed */}
      <div className="flex-1 overflow-hidden">
        <ReelsFeed 
          onOpenSubmit={() => setShowSubmitDialog(true)}
          onReport={openReport}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
        />
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowSubmitDialog(true)}
        className="absolute bottom-24 right-4 z-30 w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-500/30 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Coin Earning Banner */}
      <div className="absolute bottom-20 left-4 z-30">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center">
            <Coins className="w-4 h-4 text-black" />
          </div>
          <div>
            <p className="text-white text-xs font-medium">Watch & Earn</p>
            <p className="text-white/60 text-[10px]">+{POINT_VALUES.REEL_WATCH} coins per reel</p>
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Film className="w-5 h-5" />
              Share Educational Reel
            </DialogTitle>
            <DialogDescription>
              Share your educational content and earn {POINT_VALUES.REEL_UPLOAD} coins!
            </DialogDescription>
          </DialogHeader>

          <Tabs value={submitTab} onValueChange={(v) => setSubmitTab(v as "upload" | "link")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Video
              </TabsTrigger>
              <TabsTrigger value="link" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Share Link
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Video File *</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    selectedFile ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                  )}
                >
                  {selectedFile ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-8 h-8 mx-auto text-primary" />
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}>
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload video</p>
                      <p className="text-xs text-muted-foreground">MP4, WebM, MOV up to 50MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  placeholder="e.g., 5 Tips to Crack Technical Interviews"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category *</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter(c => c !== "All").map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-destructive text-xs mt-1">{errors.category}</p>}
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
            </TabsContent>

            {/* Link Tab */}
            <TabsContent value="link" className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  placeholder="e.g., 5 Tips to Crack Technical Interviews"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Video URL *</label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className={errors.video_url ? "border-destructive" : ""}
                />
                {errors.video_url && <p className="text-destructive text-xs mt-1">{errors.video_url}</p>}
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
                    <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter(c => c !== "All").map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-destructive text-xs mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Platform *</label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => setFormData({ ...formData, platform: value })}
                  >
                    <SelectTrigger className={errors.platform ? "border-destructive" : ""}>
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
                  {errors.platform && <p className="text-destructive text-xs mt-1">{errors.platform}</p>}
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
            </TabsContent>
          </Tabs>

          {/* Terms Section */}
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
              Content that violates guidelines will be removed
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitTab === "upload" ? handleSubmitUpload : handleSubmitLink} 
              disabled={submitting || uploading || !acceptedTerms}
            >
              {submitting || uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploading ? "Uploading..." : "Publishing..."}
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Publish & Earn {POINT_VALUES.REEL_UPLOAD} Coins
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              </ul>
            </section>

            <section className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Coin Rewards</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li><strong>{POINT_VALUES.REEL_UPLOAD} coins</strong> for sharing a reel</li>
                <li><strong>{POINT_VALUES.REEL_WATCH} coins</strong> for watching a reel (15+ seconds)</li>
                <li>Coins can be redeemed for rewards in our store</li>
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
              <AlertTriangle className="w-5 h-5 text-red-500" />
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
    </div>
  );
}

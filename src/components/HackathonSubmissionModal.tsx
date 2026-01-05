import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Coins, Trophy, Info } from "lucide-react";
import { POINT_VALUES } from "@/hooks/useEarnCoins";

interface HackathonSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function HackathonSubmissionModal({ open, onOpenChange, onSuccess }: HackathonSubmissionModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    organizer: "",
    description: "",
    category: "",
    mode: "online",
    difficulty: "intermediate",
    location: "",
    prize_pool: "",
    max_team_size: "4",
    start_date: "",
    end_date: "",
    registration_deadline: "",
    external_link: "",
    themes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a hackathon",
          variant: "destructive",
        });
        return;
      }

      const themesArray = formData.themes
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const { error } = await supabase.from("hackathons").insert({
        title: formData.title,
        organizer: formData.organizer,
        description: formData.description,
        category: formData.category,
        mode: formData.mode,
        difficulty: formData.difficulty,
        location: formData.location || (formData.mode === "online" ? "Online" : "TBA"),
        prize_pool: formData.prize_pool,
        max_team_size: parseInt(formData.max_team_size) || 4,
        start_date: formData.start_date,
        end_date: formData.end_date,
        registration_deadline: formData.registration_deadline,
        external_link: formData.external_link || null,
        themes: themesArray,
        status: "draft",
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Hackathon Submitted! 🎉",
        description: `Your hackathon will be reviewed by admins. You'll earn ${POINT_VALUES.HACKATHON_REGISTER} coins when approved!`,
      });

      setFormData({
        title: "",
        organizer: "",
        description: "",
        category: "",
        mode: "online",
        difficulty: "intermediate",
        location: "",
        prize_pool: "",
        max_team_size: "4",
        start_date: "",
        end_date: "",
        registration_deadline: "",
        external_link: "",
        themes: "",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error submitting hackathon:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit hackathon",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Submit a Hackathon
            <Badge className="bg-yellow-500/90 text-white border-0 ml-2">
              <Coins className="w-3 h-3 mr-1" />
              +{POINT_VALUES.HACKATHON_REGISTER} coins
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Share hackathon opportunities with the community
          </DialogDescription>
        </DialogHeader>

        <div className="bg-info/10 border border-info/20 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-info mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Your submission will be reviewed by admins. You'll earn <strong>{POINT_VALUES.HACKATHON_REGISTER} coins</strong> when your hackathon is approved!
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Hackathon Name *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., CodeStorm 2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizer">Organizer *</Label>
              <Input
                id="organizer"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                placeholder="e.g., Tech University"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the hackathon, its goals, and what participants can expect..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                  <SelectItem value="AI/ML">AI/ML</SelectItem>
                  <SelectItem value="Blockchain">Blockchain</SelectItem>
                  <SelectItem value="IoT">IoT</SelectItem>
                  <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                  <SelectItem value="Open Innovation">Open Innovation</SelectItem>
                  <SelectItem value="Social Impact">Social Impact</SelectItem>
                  <SelectItem value="FinTech">FinTech</SelectItem>
                  <SelectItem value="HealthTech">HealthTech</SelectItem>
                  <SelectItem value="EdTech">EdTech</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">Mode *</Label>
              <Select
                value={formData.mode}
                onValueChange={(value) => setFormData({ ...formData, mode: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty *</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prize_pool">Prize Pool *</Label>
              <Input
                id="prize_pool"
                value={formData.prize_pool}
                onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                placeholder="e.g., ₹1,00,000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_team_size">Max Team Size *</Label>
              <Input
                id="max_team_size"
                type="number"
                min="1"
                max="10"
                value={formData.max_team_size}
                onChange={(e) => setFormData({ ...formData, max_team_size: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Mumbai, India (or leave empty for online)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_deadline">Registration Deadline *</Label>
              <Input
                id="registration_deadline"
                type="date"
                value={formData.registration_deadline}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="external_link">Registration Link</Label>
            <Input
              id="external_link"
              type="url"
              value={formData.external_link}
              onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="themes">Themes/Tracks (comma-separated)</Label>
            <Input
              id="themes"
              value={formData.themes}
              onChange={(e) => setFormData({ ...formData, themes: e.target.value })}
              placeholder="e.g., Healthcare, Sustainability, Education"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Hackathon"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";
import { Loader2, Briefcase, Building, MapPin, Clock, Banknote, Send, CheckCircle2, Coins, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface JobSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function JobSubmissionModal({ open, onOpenChange, onSuccess }: JobSubmissionModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "",
    duration: "",
    stipend: "",
    category: "",
    description: "",
    requirements: "",
    apply_by: "",
    apply_link: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.company || !formData.location || !formData.type || !formData.category) {
      sonnerToast.error('Please fill in all required fields');
      return;
    }

    // Validate apply_link format if provided
    if (formData.apply_link && !formData.apply_link.startsWith('http')) {
      sonnerToast.error('Application link must start with http:// or https://');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        sonnerToast.error('Please log in to submit a job');
        return;
      }

      const { error } = await supabase.from("jobs").insert({
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        duration: formData.duration || "Not specified",
        stipend: formData.stipend || "Not disclosed",
        category: formData.category,
        description: formData.description,
        requirements: formData.requirements,
        apply_by: formData.apply_by || null,
        apply_link: formData.apply_link || null,
        status: "draft", // Needs admin approval
        created_by: user.id,
      });

      if (error) throw error;

      setSubmitted(true);
      
      // Reset form after delay
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          title: "",
          company: "",
          location: "",
          type: "",
          duration: "",
          stipend: "",
          category: "",
          description: "",
          requirements: "",
          apply_by: "",
          apply_link: "",
        });
        onOpenChange(false);
        onSuccess?.();
      }, 2000);

    } catch (error: any) {
      console.error("Error submitting job:", error);
      sonnerToast.error(error.message || 'Failed to submit job');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-4 rounded-full bg-emerald-500/10 mb-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Job Submitted!</h3>
            <p className="text-muted-foreground">
              Your job listing has been submitted for review. It will be visible once approved by our team.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Briefcase className="h-5 w-5 text-orange-500" />
            Post a Job / Internship
            <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
              <Coins className="w-3 h-3 mr-1" />
              +10 coins
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Share job opportunities with the student community. Earn coins when approved!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Job Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Frontend Developer Intern"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          {/* Company & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                Company Name *
              </Label>
              <Input
                id="company"
                placeholder="e.g., Google"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Location *
              </Label>
              <Input
                id="location"
                placeholder="e.g., Remote / Bangalore"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Type & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Type *</Label>
              <Select value={formData.type} onValueChange={(v) => handleInputChange("type", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Internship">Internship</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(v) => handleInputChange("category", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tech">Tech</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Content">Content</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration & Stipend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Duration
              </Label>
              <Input
                id="duration"
                placeholder="e.g., 3 months / Full-time"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stipend" className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-muted-foreground" />
                Stipend / Salary
              </Label>
              <Input
                id="stipend"
                placeholder="e.g., ₹15,000/month"
                value={formData.stipend}
                onChange={(e) => handleInputChange("stipend", e.target.value)}
              />
            </div>
          </div>

          {/* Apply By & Apply Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apply_by">Application Deadline</Label>
              <Input
                id="apply_by"
                placeholder="e.g., 15th Jan 2026"
                value={formData.apply_by}
                onChange={(e) => handleInputChange("apply_by", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apply_link" className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                Application Link
              </Label>
              <Input
                id="apply_link"
                type="url"
                placeholder="https://company.com/careers/apply"
                value={formData.apply_link}
                onChange={(e) => handleInputChange("apply_link", e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center justify-between">
              <span>Job Description</span>
              {formData.description && (
                <span className="text-xs text-muted-foreground">{formData.description.length} chars</span>
              )}
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              maxLength={2000}
            />
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements" className="flex items-center justify-between">
              <span>Requirements / Skills</span>
              {formData.requirements && (
                <span className="text-xs text-muted-foreground">{formData.requirements.length} chars</span>
              )}
            </Label>
            <Textarea
              id="requirements"
              placeholder="List required skills, qualifications, or experience..."
              value={formData.requirements}
              onChange={(e) => handleInputChange("requirements", e.target.value)}
              rows={3}
              maxLength={1000}
            />
          </div>

          {/* Info Banner */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm">
            <p className="flex items-center gap-1 text-yellow-700 dark:text-yellow-500">
              <Coins className="w-4 h-4" />
              You'll earn <span className="font-semibold">+10 coins</span> when your job listing is approved!
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Job
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

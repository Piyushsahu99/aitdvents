import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit, Loader2, Link2, Sparkles } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  duration: string;
  stipend: string;
  category: string;
  description: string | null;
  requirements: string | null;
  apply_by: string | null;
  apply_link: string | null;
  poster_url: string | null;
}

interface JobEditorProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function JobEditor({ job, open, onOpenChange, onSave }: JobEditorProps) {
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [processing, setProcessing] = useState(false);
  const [generatingPoster, setGeneratingPoster] = useState(false);
  const { toast } = useToast();

  const handleGeneratePoster = async () => {
    if (!editingJob?.title || !editingJob?.description) {
      toast({ title: "Missing Info", description: "Title and description are required to generate a poster.", variant: "destructive" });
      return;
    }

    setGeneratingPoster(true);
    try {
      toast({ title: "Generating Poster", description: "AI is creating a poster for this job..." });

      const { data, error } = await supabase.functions.invoke('generate-poster', {
        body: {
          title: editingJob.title,
          description: editingJob.description,
          type: 'job',
          category: editingJob.category,
          company: editingJob.company,
          location: editingJob.location,
        }
      });

      if (error) throw error;
      if (data?.imageUrl) {
        setEditingJob({ ...editingJob, poster_url: data.imageUrl });
        toast({ title: "Poster Generated!", description: "AI poster has been created. Save to apply." });
      } else {
        throw new Error(data?.error || 'No image generated');
      }
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message || "Could not generate poster.", variant: "destructive" });
    } finally {
      setGeneratingPoster(false);
    }
  };

  const handleSave = async () => {
    if (!editingJob) return;
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("jobs")
        .update({
          title: editingJob.title,
          company: editingJob.company,
          location: editingJob.location,
          type: editingJob.type,
          duration: editingJob.duration,
          stipend: editingJob.stipend,
          category: editingJob.category,
          description: editingJob.description,
          requirements: editingJob.requirements,
          apply_by: editingJob.apply_by,
          apply_link: editingJob.apply_link,
          poster_url: editingJob.poster_url,
        })
        .eq("id", editingJob.id);

      if (error) throw error;
      toast({ title: "Success", description: "Job updated" });
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  if (job && (!editingJob || editingJob.id !== job.id)) {
    setEditingJob(job);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Job
          </DialogTitle>
          <DialogDescription>
            Update job details and requirements
          </DialogDescription>
        </DialogHeader>
        
        {editingJob && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  value={editingJob.title}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={editingJob.company}
                  onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editingJob.description || ""}
                onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                rows={4}
                placeholder="Job description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={editingJob.location}
                  onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={editingJob.type} 
                  onValueChange={(v) => setEditingJob({ ...editingJob, type: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input
                  value={editingJob.duration}
                  onChange={(e) => setEditingJob({ ...editingJob, duration: e.target.value })}
                  placeholder="e.g., 3 months"
                />
              </div>
              <div className="space-y-2">
                <Label>Stipend/Salary</Label>
                <Input
                  value={editingJob.stipend}
                  onChange={(e) => setEditingJob({ ...editingJob, stipend: e.target.value })}
                  placeholder="e.g., ₹15,000/month"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={editingJob.category} 
                  onValueChange={(v) => setEditingJob({ ...editingJob, category: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                    <SelectItem value="Government">Government</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Apply By</Label>
                <Input
                  type="date"
                  value={editingJob.apply_by || ""}
                  onChange={(e) => setEditingJob({ ...editingJob, apply_by: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Application Link
              </Label>
              <Input
                type="url"
                value={editingJob.apply_link || ""}
                onChange={(e) => setEditingJob({ ...editingJob, apply_link: e.target.value })}
                placeholder="https://company.com/careers/apply"
              />
            </div>

            <div className="space-y-2">
              <Label>Requirements</Label>
              <Textarea
                value={editingJob.requirements || ""}
                onChange={(e) => setEditingJob({ ...editingJob, requirements: e.target.value })}
                rows={3}
                placeholder="Job requirements and qualifications..."
              />
            </div>

            {/* AI Poster Generation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Job Poster</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePoster}
                  disabled={generatingPoster}
                  className="gap-1.5 text-xs"
                >
                  {generatingPoster ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  )}
                  {generatingPoster ? "Generating..." : "AI Generate Poster"}
                </Button>
              </div>
              {editingJob.poster_url && (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img
                    src={editingJob.poster_url}
                    alt="Job poster"
                    className="w-full max-h-64 object-contain bg-muted"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 text-xs"
                    onClick={() => setEditingJob({ ...editingJob, poster_url: null })}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={processing}>
                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShareButtons } from "@/components/ShareButtons";
import { 
  Building, 
  MapPin, 
  Clock, 
  Banknote, 
  ExternalLink, 
  Calendar, 
  Briefcase,
  FileText,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";

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
  created_at?: string;
}

interface JobDetailModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: () => void;
}

const typeColors: Record<string, string> = {
  "Internship": "bg-blue-500",
  "Full-time": "bg-emerald-500",
  "Part-time": "bg-amber-500",
  "Contract": "bg-violet-500",
  "Remote": "bg-cyan-500",
};

export function JobDetailModal({ job, open, onOpenChange, onApply }: JobDetailModalProps) {
  if (!job) return null;

  const getDaysRemaining = () => {
    if (!job.apply_by) return null;
    try {
      const deadline = parseISO(job.apply_by);
      const days = differenceInDays(deadline, new Date());
      return days;
    } catch {
      return null;
    }
  };

  const daysRemaining = getDaysRemaining();
  const isUrgent = daysRemaining !== null && daysRemaining <= 3 && daysRemaining >= 0;
  const isExpired = daysRemaining !== null && daysRemaining < 0;

  const handleApplyClick = () => {
    if (job.apply_link) {
      window.open(job.apply_link, '_blank', 'noopener,noreferrer');
    } else {
      onApply();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header with gradient accent */}
        <div className="relative">
          <div className={`h-2 w-full ${typeColors[job.type] || 'bg-primary'}`} />
          <div className="p-6 pb-4">
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className={`${typeColors[job.type] || 'bg-primary'} text-white border-0`}>
                  {job.type}
                </Badge>
                <Badge variant="outline" className="bg-background/50">
                  {job.category}
                </Badge>
                {isUrgent && !isExpired && (
                  <Badge className="bg-red-500 text-white border-0 animate-pulse">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {daysRemaining === 0 ? "Last day!" : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`}
                  </Badge>
                )}
                {isExpired && (
                  <Badge variant="destructive">Deadline Passed</Badge>
                )}
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                {job.title}
              </DialogTitle>
            </DialogHeader>
          </div>
        </div>

        <div className="p-6 pt-2 space-y-6">
          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Building className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Company</p>
                <p className="font-semibold">{job.company}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MapPin className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-semibold">{job.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Clock className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-semibold">{job.duration}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Banknote className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stipend/Salary</p>
                <p className="font-bold text-emerald-600">{job.stipend}</p>
              </div>
            </div>
          </div>

          {/* Opportunity / Apply Link - prominent display */}
          {job.apply_link && (
            <a 
              href={job.apply_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 hover:border-emerald-500/50 transition-colors group/link"
            >
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <ExternalLink className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Opportunity Link</p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 truncate">{job.apply_link}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-emerald-500 group-hover/link:translate-x-1 transition-transform flex-shrink-0" />
            </a>
          )}

          {/* Deadline */}
          {job.apply_by && (
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
              isUrgent && !isExpired 
                ? 'bg-red-500/10 border-red-500/30' 
                : isExpired 
                  ? 'bg-muted border-muted-foreground/20' 
                  : 'bg-amber-500/10 border-amber-500/30'
            }`}>
              <Calendar className={`h-5 w-5 ${
                isUrgent && !isExpired ? 'text-red-500' : isExpired ? 'text-muted-foreground' : 'text-amber-600'
              }`} />
              <div>
                <p className="text-sm font-medium">Application Deadline</p>
                <p className={`text-sm ${
                  isUrgent && !isExpired ? 'text-red-600 font-bold' : isExpired ? 'text-muted-foreground' : 'text-amber-700'
                }`}>
                  {job.apply_by}
                  {daysRemaining !== null && !isExpired && (
                    <span className="ml-2">({daysRemaining === 0 ? "Today" : `${daysRemaining} days remaining`})</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <Briefcase className="h-4 w-4 text-orange-500" />
                Job Description
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {job.description}
              </p>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <FileText className="h-4 w-4 text-blue-500" />
                Requirements & Skills
              </h3>
              <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {job.requirements.split('\n').map((req, idx) => (
                  <div key={idx} className="flex items-start gap-2 mb-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{req.replace(/^[-•*]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share & Apply Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Share:</span>
              <ShareButtons 
                title={job.title}
                url={job.apply_link || `${window.location.origin}/jobs?id=${job.id}`}
                type="job"
                referenceId={job.id}
              />
            </div>
            
            <div className="flex-1" />
            
            <Button
              onClick={handleApplyClick}
              disabled={isExpired}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg h-12 text-base"
            >
              {job.apply_link ? (
                <>
                  Apply on Company Site
                  <ExternalLink className="h-5 w-5 ml-2" />
                </>
              ) : (
                <>
                  Apply Now
                  <ExternalLink className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

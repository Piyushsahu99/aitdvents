import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, Calendar, Trophy, Briefcase, GraduationCap, 
  Users, Play, Tag, Settings, Sparkles, Mail, Download
} from "lucide-react";

interface AdminQuickActionsProps {
  onTabChange: (tab: string) => void;
  pendingEvents: number;
  pendingJobs: number;
  pendingHackathons: number;
}

export function AdminQuickActions({ 
  onTabChange, 
  pendingEvents, 
  pendingJobs, 
  pendingHackathons 
}: AdminQuickActionsProps) {
  const totalPending = pendingEvents + pendingJobs + pendingHackathons;

  const quickActions = [
    { 
      label: "Create Event", 
      icon: Calendar, 
      color: "bg-gradient-events text-white",
      action: () => onTabChange("events")
    },
    { 
      label: "Add Bounty", 
      icon: Trophy, 
      color: "bg-gradient-bounties text-white",
      action: () => onTabChange("bounties")
    },
    { 
      label: "Post Job", 
      icon: Briefcase, 
      color: "bg-gradient-jobs text-white",
      action: () => onTabChange("jobs")
    },
    { 
      label: "Add Scholarship", 
      icon: GraduationCap, 
      color: "bg-gradient-scholarships text-white",
      action: () => onTabChange("scholarships")
    },
  ];

  return (
    <Card className="p-4 sm:p-6 mb-6 bg-gradient-to-br from-card to-muted/30 border-border/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Actions
          </h3>
          <p className="text-sm text-muted-foreground">
            Common tasks at your fingertips
          </p>
        </div>
        
        {totalPending > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {totalPending} pending approval{totalPending > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="outline"
              className={`h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-transform border-dashed group`}
              onClick={action.action}
            >
              <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Pending Items */}
      {totalPending > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-sm font-medium mb-2 text-muted-foreground">Pending Approvals</p>
          <div className="flex flex-wrap gap-2">
            {pendingEvents > 0 && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => onTabChange("events")}
                className="text-xs gap-1"
              >
                <Calendar className="h-3.5 w-3.5" />
                {pendingEvents} Event{pendingEvents > 1 ? 's' : ''}
              </Button>
            )}
            {pendingJobs > 0 && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => onTabChange("jobs")}
                className="text-xs gap-1"
              >
                <Briefcase className="h-3.5 w-3.5" />
                {pendingJobs} Job{pendingJobs > 1 ? 's' : ''}
              </Button>
            )}
            {pendingHackathons > 0 && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => onTabChange("hackathons")}
                className="text-xs gap-1"
              >
                <Play className="h-3.5 w-3.5" />
                {pendingHackathons} Hackathon{pendingHackathons > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DigitalBadgeProps {
  recipientName: string;
  badgeType: "achievement" | "participation" | "completion" | "leaderboard" | "membership";
  rank?: number;
  issueDate: string;
  certificateNumber: string;
}

const badgeConfig = {
  achievement: { 
    icon: "🏆", 
    label: "Achievement", 
    gradient: "from-primary to-warning" 
  },
  participation: { 
    icon: "🎯", 
    label: "Participation", 
    gradient: "from-info to-accent" 
  },
  completion: { 
    icon: "🎓", 
    label: "Completion", 
    gradient: "from-success to-accent" 
  },
  leaderboard: { 
    icon: "⭐", 
    label: "Top Contributor", 
    gradient: "from-warning to-primary" 
  },
  membership: { 
    icon: "🛡️", 
    label: "Member", 
    gradient: "from-primary to-accent" 
  },
};

const rankIcons: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export const DigitalBadge = ({ recipientName, badgeType, rank, issueDate, certificateNumber }: DigitalBadgeProps) => {
  const badgeRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const config = badgeConfig[badgeType];
  const displayIcon = rank && rankIcons[rank] ? rankIcons[rank] : config.icon;

  const handleDownload = async () => {
    if (!badgeRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(badgeRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `AITD-Badge-${recipientName.replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "Badge downloaded!" });
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={badgeRef}
        className={`relative w-40 h-40 rounded-full bg-gradient-to-br ${config.gradient} p-1 shadow-lg`}
      >
        <div className="w-full h-full rounded-full bg-card flex flex-col items-center justify-center text-center p-3">
          <span className="text-3xl mb-1">{displayIcon}</span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary leading-tight">
            {config.label}
          </p>
          <p className="text-xs font-semibold text-foreground mt-1 leading-tight line-clamp-2">
            {recipientName}
          </p>
          <p className="text-[8px] text-muted-foreground mt-0.5">AITD Events</p>
        </div>
        {/* Decorative ring */}
        <div className="absolute inset-[3px] rounded-full border-2 border-primary/20 pointer-events-none" />
      </div>

      <Button size="sm" variant="outline" onClick={handleDownload} disabled={downloading} className="gap-1.5 text-xs">
        {downloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
        Download Badge
      </Button>
    </div>
  );
};

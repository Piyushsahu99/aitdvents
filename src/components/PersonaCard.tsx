import { LucideIcon } from "lucide-react";

interface PersonaCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const PersonaCard = ({ title, description, icon: Icon }: PersonaCardProps) => {
  return (
    <div className="group p-6 bg-card rounded-xl border border-border hover:shadow-[var(--shadow-hover)] transition-all cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
};

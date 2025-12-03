import { LucideIcon } from "lucide-react";

interface PersonaCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const PersonaCard = ({ title, description, icon: Icon }: PersonaCardProps) => {
  return (
    <div className="group p-6 bg-card rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

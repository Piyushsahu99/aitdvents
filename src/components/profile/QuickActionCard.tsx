import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  gradient: string;
  iconColor?: string;
}

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  gradient,
  iconColor = "text-white",
}: QuickActionCardProps) {
  return (
    <Link to={href}>
      <Card className="group relative overflow-hidden p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        <div
          className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity ${gradient}`}
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${gradient}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{title}</h4>
            <p className="text-xs text-muted-foreground truncate">
              {description}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

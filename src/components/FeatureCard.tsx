import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  link: string;
  gradient: string;
  className?: string;
}

export const FeatureCard = ({ title, subtitle, icon: Icon, link, gradient, className = "" }: FeatureCardProps) => {
  return (
    <Link
      to={link}
      className={`group relative overflow-hidden rounded-2xl p-6 transition-all hover:scale-105 hover:shadow-[var(--shadow-hover)] ${gradient} ${className}`}
    >
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-white/90 text-sm">{subtitle}</p>
        </div>
        <Icon className="h-8 w-8 text-white/80 group-hover:scale-110 transition-transform" />
      </div>
      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
    </Link>
  );
};

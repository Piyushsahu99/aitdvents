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
      className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${gradient} ${className}`}
      style={{ 
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      {/* Content */}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-primary-foreground mb-1 group-hover:translate-x-1 transition-transform duration-300">{title}</h3>
          <p className="text-primary-foreground/90 text-sm">{subtitle}</p>
        </div>
        <Icon className="h-8 w-8 text-primary-foreground/90 group-hover:scale-125 group-hover:rotate-6 transition-all duration-300" />
      </div>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
    </Link>
  );
};

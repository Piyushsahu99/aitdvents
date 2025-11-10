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
      className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${gradient} ${className} shadow-lg hover:shadow-2xl`}
    >
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Icon className="h-10 w-10 text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
          <div className="h-2 w-2 rounded-full bg-white/40 group-hover:bg-white/60 transition-colors" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-1.5 group-hover:translate-x-1 transition-transform duration-300">{title}</h3>
          <p className="text-white/90 text-sm leading-relaxed">{subtitle}</p>
        </div>
      </div>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 rounded-2xl" />
    </Link>
  );
};

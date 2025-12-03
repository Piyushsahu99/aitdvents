import { Link } from "react-router-dom";
import { LucideIcon, ArrowRight } from "lucide-react";

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
      className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 ${gradient} ${className} shadow-lg hover:shadow-xl`}
    >
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4 h-full min-h-[140px]">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1.5">
            {title}
          </h3>
          <p className="text-white/80 text-sm leading-relaxed">
            {subtitle}
          </p>
        </div>
        
        {/* Arrow indicator */}
        <div className="flex items-center text-white/70 group-hover:text-white transition-colors duration-300 text-sm font-medium">
          <span>Explore</span>
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </Link>
  );
};

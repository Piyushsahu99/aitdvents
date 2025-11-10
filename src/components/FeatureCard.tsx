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
      className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:scale-110 ${gradient} ${className} shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] perspective-1000`}
      style={{ 
        transform: 'translateZ(0)',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* 3D Depth Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
           style={{ transform: 'translateZ(-10px)' }} />
      
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      {/* Glow ring effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/5 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4 h-full min-h-[140px]">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110"
               style={{ transform: 'translateZ(20px)' }}>
            <Icon className="h-8 w-8 text-white drop-shadow-lg" />
          </div>
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-white/30 group-hover:bg-white/60 transition-all duration-300 animate-pulse" />
            <div className="h-2 w-2 rounded-full bg-white/20 group-hover:bg-white/50 transition-all duration-300 animate-pulse" style={{ animationDelay: '150ms' }} />
          </div>
        </div>
        <div className="flex-1" style={{ transform: 'translateZ(15px)' }}>
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:translate-x-2 transition-transform duration-300 drop-shadow-md">
            {title}
          </h3>
          <p className="text-white/95 text-base leading-relaxed font-medium drop-shadow-sm">
            {subtitle}
          </p>
        </div>
        
        {/* Arrow indicator */}
        <div className="flex items-center text-white/80 group-hover:text-white transition-colors duration-300 text-sm font-semibold">
          <span className="group-hover:translate-x-1 transition-transform duration-300">Explore</span>
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      
      {/* Bottom gradient accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Link>
  );
};

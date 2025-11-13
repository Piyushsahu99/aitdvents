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
      className={`group relative overflow-hidden rounded-3xl p-6 md:p-8 transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${gradient} ${className} shadow-lg hover:shadow-2xl border border-white/10`}
      style={{ 
        transform: 'translateZ(0)',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* 3D Depth Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
           style={{ transform: 'translateZ(-10px)' }} />
      
      {/* Shimmer effect overlay (removed to improve color visibility) */}
      {/* <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" /> */}
      
      {/* Glow ring effect (only on hover, very subtle) */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col gap-3 md:gap-4 h-full min-h-[120px]">
        <div className="flex items-start justify-between">
          <div className="p-2.5 md:p-3 rounded-xl bg-white/15 backdrop-blur-sm group-hover:bg-white/25 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110"
               style={{ transform: 'translateZ(20px)' }}>
            <Icon className="h-6 w-6 md:h-8 md:w-8 text-white drop-shadow-lg" />
          </div>
          <div className="flex gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-white/40 group-hover:bg-white/70 transition-all duration-300 animate-pulse" />
            <div className="h-1.5 w-1.5 rounded-full bg-white/30 group-hover:bg-white/60 transition-all duration-300 animate-pulse" style={{ animationDelay: '150ms' }} />
          </div>
        </div>
        <div className="flex-1" style={{ transform: 'translateZ(15px)' }}>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-1.5 md:mb-2 group-hover:translate-x-1 transition-transform duration-300 drop-shadow-md">
            {title}
          </h3>
          <p className="text-white/90 text-sm md:text-base leading-relaxed font-medium drop-shadow-sm">
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

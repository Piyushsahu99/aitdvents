import { Button } from "@/components/ui/button";
import { Linkedin, Github, Globe, Twitter, Instagram } from "lucide-react";

interface SocialLinksDisplayProps {
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

const socialConfig = {
  linkedin: {
    icon: Linkedin,
    label: "LinkedIn",
    bgColor: "bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20",
    textColor: "text-[#0A66C2]",
    borderColor: "border-[#0A66C2]/30",
  },
  github: {
    icon: Github,
    label: "GitHub",
    bgColor: "bg-[#24292e]/10 hover:bg-[#24292e]/20 dark:bg-white/10 dark:hover:bg-white/20",
    textColor: "text-[#24292e] dark:text-white",
    borderColor: "border-[#24292e]/30 dark:border-white/30",
  },
  portfolio: {
    icon: Globe,
    label: "Portfolio",
    bgColor: "bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20",
    textColor: "text-primary",
    borderColor: "border-primary/30",
  },
};

export function SocialLinksDisplay({
  linkedinUrl,
  githubUrl,
  portfolioUrl,
  size = "md",
  showLabels = false,
}: SocialLinksDisplayProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const links = [
    { url: linkedinUrl, config: socialConfig.linkedin, key: "linkedin" },
    { url: githubUrl, config: socialConfig.github, key: "github" },
    { url: portfolioUrl, config: socialConfig.portfolio, key: "portfolio" },
  ].filter((link) => link.url);

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(({ url, config, key }) => {
        const Icon = config.icon;
        return (
          <a
            key={key}
            href={url!}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              inline-flex items-center justify-center gap-2 rounded-xl
              ${config.bgColor} ${config.textColor} 
              border ${config.borderColor}
              transition-all duration-300 hover:scale-105 hover:shadow-lg
              ${showLabels ? "px-4 py-2" : sizeClasses[size]}
            `}
          >
            <Icon className={iconSizes[size]} />
            {showLabels && (
              <span className="text-sm font-medium">{config.label}</span>
            )}
          </a>
        );
      })}
    </div>
  );
}

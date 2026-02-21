import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverScale?: number;
  hoverY?: number;
}

export const AnimatedCard = ({ 
  children, 
  className = "",
  delay = 0,
  hoverScale = 1.03,
  hoverY = -8
}: AnimatedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        scale: hoverScale,
        y: hoverY,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={cn(
        "transition-all duration-300",
        "hover:shadow-xl hover:shadow-primary/10",
        "border-border/50 hover:border-primary/50",
        className
      )}>
        {children}
      </Card>
    </motion.div>
  );
};

// Variant with glow effect
export const AnimatedGlowCard = ({ 
  children, 
  className = "",
  delay = 0 
}: AnimatedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        scale: 1.02,
        y: -8,
        transition: { duration: 0.2 }
      }}
      className="relative group"
    >
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />
      
      <Card className={cn(
        "relative transition-all duration-300",
        "hover:shadow-2xl",
        "border-border/50 hover:border-primary/30",
        className
      )}>
        {children}
      </Card>
    </motion.div>
  );
};

// Feature card with gradient border
export const AnimatedFeatureCard = ({ 
  children, 
  className = "",
  delay = 0 
}: AnimatedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -10,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="relative group"
    >
      {/* Animated gradient border */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-accent to-primary rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 animate-gradient" style={{backgroundSize: '200% 200%'}} />
      
      <Card className={cn(
        "relative bg-card backdrop-blur-sm",
        "transition-all duration-300",
        "hover:shadow-2xl",
        "border border-border/50 group-hover:border-transparent",
        className
      )}>
        {children}
      </Card>
    </motion.div>
  );
};

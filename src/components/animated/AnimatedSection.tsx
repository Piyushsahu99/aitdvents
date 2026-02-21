import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface AnimatedSectionProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
}

export const AnimatedSection = ({ 
  children, 
  delay = 0, 
  duration = 0.6,
  y = 30,
  className = "",
  ...props 
}: AnimatedSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0], // Custom easing
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Slide from left
export const AnimatedSlideLeft = ({ 
  children, 
  delay = 0, 
  className = "",
  ...props 
}: AnimatedSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Slide from right
export const AnimatedSlideRight = ({ 
  children, 
  delay = 0, 
  className = "",
  ...props 
}: AnimatedSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Scale in animation
export const AnimatedScale = ({ 
  children, 
  delay = 0, 
  className = "",
  ...props 
}: AnimatedSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Stagger children animation
interface AnimatedStaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const AnimatedStagger = ({ 
  children, 
  className = "",
  staggerDelay = 0.1
}: AnimatedStaggerProps) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Item for stagger
export const AnimatedStaggerItem = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1]
          }
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

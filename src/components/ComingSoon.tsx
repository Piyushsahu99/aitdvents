import { Construction, Clock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export const ComingSoon = ({ title, description }: ComingSoonProps) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-pulse">
            <Construction className="w-12 h-12 text-primary" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center animate-bounce">
            <Clock className="w-4 h-4 text-accent" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="text-gradient-primary">{title}</span>
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-lg mb-8">
          {description || "We're working hard to bring you something amazing. Stay tuned for updates!"}
        </p>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border mb-6">
          <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground">Coming Soon</span>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" className="gap-2">
            <Bell className="w-4 h-4" />
            Notify Me
          </Button>
        </div>
      </div>
    </div>
  );
};

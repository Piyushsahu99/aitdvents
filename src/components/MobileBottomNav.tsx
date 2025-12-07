import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Trophy, Briefcase, Menu, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: ShoppingBag, label: "Store", path: "/store" },
  { icon: Trophy, label: "Bounties", path: "/bounties" },
  { icon: Briefcase, label: "Jobs", path: "/jobs" },
];

interface MobileNavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const allNavItems: { category: string; items: MobileNavItem[] }[] = [
  {
    category: "Main",
    items: [
      { name: "Events", path: "/events", icon: BookOpen },
      { name: "Hackathons", path: "/hackathons", icon: Trophy },
      { name: "Courses", path: "/courses", icon: BookOpen },
    ],
  },
  {
    category: "Learning",
    items: [
      { name: "My Courses", path: "/my-courses", icon: BookOpen },
      { name: "Practice", path: "/practice", icon: Trophy },
      { name: "Scholarships", path: "/scholarships", icon: BookOpen },
    ],
  },
  {
    category: "Connect",
    items: [
      { name: "Network", path: "/network", icon: Briefcase },
      { name: "Groups", path: "/groups", icon: Briefcase },
      { name: "Mentorship", path: "/mentorship", icon: Briefcase },
      { name: "Community", path: "/community", icon: Briefcase },
    ],
  },
  {
    category: "Tools",
    items: [
      { name: "AI Chat", path: "/ai-chat", icon: Menu },
      { name: "AI Tools", path: "/ai-tools", icon: Menu },
      { name: "Reels", path: "/reels", icon: Menu },
      { name: "Blogs", path: "/blogs", icon: Menu },
    ],
  },
];

export function MobileBottomNav() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-200 touch-manipulation",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200",
                  active && "bg-primary/10"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "scale-110")} />
              </div>
              <span className={cn("text-[10px] font-medium mt-0.5", active && "font-semibold")}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* More Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-200 touch-manipulation",
                "text-muted-foreground hover:text-foreground active:scale-95"
              )}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl">
                <Menu className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium mt-0.5">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl p-0">
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mt-3 mb-4" />
            <ScrollArea className="h-full px-4 pb-8">
              <div className="space-y-6">
                {allNavItems.map((category) => (
                  <div key={category.category}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                      {category.category}
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {category.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex flex-col items-center p-3 rounded-2xl transition-all duration-200 touch-manipulation active:scale-95",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/50 hover:bg-muted"
                            )}
                          >
                            <Icon className="h-5 w-5 mb-1.5" />
                            <span className="text-[10px] font-medium text-center line-clamp-1">
                              {item.name}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

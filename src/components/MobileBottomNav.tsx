import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, Briefcase, Menu, Calendar, ShoppingBag, BookOpen, Users, MessageCircle, Sparkles, Video, FileText, GraduationCap, Target, ChevronRight, Gamepad2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Calendar, label: "Events", path: "/events" },
  { icon: Gamepad2, label: "Quiz", path: "/quiz" },
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
      { name: "Store", path: "/store", icon: ShoppingBag },
      { name: "Bounties", path: "/bounties", icon: Trophy },
      { name: "Hackathons", path: "/hackathons", icon: Trophy },
      { name: "Live Chat", path: "/live-chat", icon: MessageCircle },
    ],
  },
  {
    category: "Learning",
    items: [
      { name: "Courses", path: "/courses", icon: BookOpen },
      { name: "My Courses", path: "/my-courses", icon: GraduationCap },
      { name: "Study Materials", path: "/study-materials", icon: FileText },
      { name: "Practice", path: "/practice", icon: Target },
      { name: "Scholarships", path: "/scholarships", icon: GraduationCap },
    ],
  },
  {
    category: "Connect",
    items: [
      { name: "Network", path: "/network", icon: Users },
      { name: "Groups", path: "/groups", icon: Users },
      { name: "Community", path: "/community", icon: MessageCircle },
      { name: "Mentorship", path: "/mentorship", icon: Users },
    ],
  },
  {
    category: "Tools",
    items: [
      { name: "AI Chat", path: "/ai-chat", icon: Sparkles },
      { name: "AI Tools", path: "/ai-tools", icon: Sparkles },
      { name: "Reels", path: "/reels", icon: Video },
      { name: "Blogs", path: "/blogs", icon: FileText },
      { name: "Resume", path: "/resume", icon: FileText },
    ],
  },
];

export function MobileBottomNav() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [moreSearch, setMoreSearch] = useState("");

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/98 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around h-14 sm:h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all duration-150 touch-manipulation active:scale-95",
                active
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all",
                  active && "bg-primary/10"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "scale-110")} />
              </div>
              <span className={cn("text-[10px] font-medium mt-0.5", active && "font-semibold")}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-1 w-4 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}

        {/* More Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all duration-150 touch-manipulation active:scale-95",
                "text-muted-foreground"
              )}
            >
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl">
                <Menu className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium mt-0.5">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl p-0 bg-background">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-2.5 mb-3" />
            <div className="px-3 mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={moreSearch}
                  onChange={(e) => setMoreSearch(e.target.value)}
                  className="pl-9 h-9 rounded-xl bg-muted/50 border-border/30 text-sm"
                />
              </div>
            </div>
            <ScrollArea className="h-[calc(100%-5rem)] px-3 pb-6">
              <div className="space-y-4">
                {allNavItems.filter(cat => 
                  !moreSearch || cat.items.some(i => i.name.toLowerCase().includes(moreSearch.toLowerCase()))
                ).map((category) => {
                  const filteredItems = moreSearch 
                    ? category.items.filter(i => i.name.toLowerCase().includes(moreSearch.toLowerCase()))
                    : category.items;
                  if (filteredItems.length === 0) return null;
                  return (
                    <div key={category.category}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                      {category.category}
                    </p>
                    <div className="bg-card/50 rounded-xl border border-border/30 overflow-hidden">
                      {filteredItems.map((item, idx) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2.5 text-sm transition-colors active:bg-muted/50",
                              active
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-foreground",
                              idx !== filteredItems.length - 1 && "border-b border-border/30"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={cn(
                                "p-1.5 rounded-lg",
                                active ? "bg-primary/20" : "bg-muted/50"
                              )}>
                                <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                              </div>
                              <span>{item.name}</span>
                            </div>
                            <ChevronRight className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground/40")} />
                          </Link>
                        );
                      })}
                    </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
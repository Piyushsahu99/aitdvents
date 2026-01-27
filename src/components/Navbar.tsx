import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Settings, Sparkles, Trophy, LayoutDashboard, ChevronDown, Calendar, Briefcase, Code, GraduationCap, MessageCircle, Users, Target, DollarSign, BookOpen, Rss, Video, UserCircle, Wrench, FileText, ChevronRight, ShoppingBag, Rocket, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { CartIcon } from "@/components/CartIcon";
import { PointsWidget } from "@/components/PointsWidget";
import logo from "@/assets/aitd-logo.png";

// Primary navigation items - shown directly in navbar
const primaryNavLinks = [
  { name: "Events", path: "/events", icon: Calendar },
  { name: "Bounties", path: "/bounties", icon: DollarSign },
  { name: "Jobs", path: "/jobs", icon: Briefcase },
  { name: "Quiz", path: "/quiz", icon: Gamepad2 },
];

// Secondary navigation items - shown in "More" dropdown
const moreNavLinks = [
  { 
    category: "Main",
    items: [
      { name: "Store", path: "/store", icon: ShoppingBag },
    ]
  },
  { 
    category: "Learning",
    items: [
      { name: "Courses", path: "/courses", icon: BookOpen },
      { name: "Study Materials", path: "/study-materials", icon: FileText },
      { name: "My Courses", path: "/my-courses", icon: GraduationCap },
      { name: "Practice", path: "/practice", icon: Target },
      { name: "Scholarships", path: "/scholarships", icon: GraduationCap },
    ]
  },
  { 
    category: "Compete",
    items: [
      { name: "Hackathons", path: "/hackathons", icon: Code },
      { name: "Rewards", path: "/rewards", icon: Trophy },
      { name: "Live Chat", path: "/live-chat", icon: MessageCircle },
    ]
  },
  { 
    category: "Connect",
    items: [
      { name: "Network", path: "/network", icon: Users },
      { name: "Groups", path: "/groups", icon: Users },
      { name: "Community", path: "/community", icon: MessageCircle },
      { name: "Mentorship", path: "/mentorship", icon: MessageCircle },
      { name: "Campus Ambassador", path: "/campus-ambassador", icon: Users },
    ]
  },
  { 
    category: "Tools & Resources",
    items: [
      { name: "AI Chat", path: "/ai-chat", icon: Sparkles },
      { name: "AI Tools", path: "/ai-tools", icon: Wrench },
      { name: "Resume Builder", path: "/resume", icon: FileText },
      { name: "Blogs", path: "/blogs", icon: Rss },
      { name: "Reels", path: "/reels", icon: Video },
      { name: "Alumni", path: "/alumni", icon: UserCircle },
    ]
  },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
  };

  return (
    <nav className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
      scrolled 
        ? 'bg-background/98 backdrop-blur-xl shadow-lg border-border/80' 
        : 'bg-background/95 backdrop-blur-md border-border/50'
    }`}>
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 lg:h-16 items-center justify-between gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md group-hover:bg-primary/30 transition-all duration-300" />
              <img 
                src={logo} 
                alt="AITD Events" 
                className="h-8 w-8 sm:h-10 sm:w-10 lg:h-11 lg:w-11 rounded-lg relative z-10 group-hover:scale-105 transition-transform duration-300 shadow-lg" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base lg:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                aitd.events
              </span>
              <span className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground -mt-0.5 hidden sm:block">Learn • Compete • Grow</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center">
            {primaryNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 group ${
                    isActive(link.path)
                      ? "text-primary-foreground"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {isActive(link.path) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl" />
                  )}
                  <Icon className={`h-4 w-4 relative z-10 ${isActive(link.path) ? '' : 'group-hover:scale-110'}`} />
                  <span className="relative z-10">{link.name}</span>
                </Link>
              );
            })}

            {/* More Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="px-3 xl:px-4 py-2 rounded-xl text-sm font-medium hover:text-primary hover:bg-transparent group relative"
                >
                  <span>More</span>
                  <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 animate-in slide-in-from-top-2 duration-300">
                {moreNavLinks.map((category, idx) => (
                  <div key={category.category}>
                    {idx > 0 && <DropdownMenuSeparator className="my-2" />}
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1">
                      {category.category}
                    </DropdownMenuLabel>
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem key={item.path} asChild className="cursor-pointer rounded-lg">
                          <Link
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2 ${
                              isActive(item.path) ? "bg-primary/10 text-primary" : ""
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart Icon */}
            <CartIcon />

            {/* Points Widget - Only show when logged in */}
            {user && <PointsWidget />}

            <div className="h-6 w-px bg-border mx-1 xl:mx-2" />

            {/* About */}
            <Link to="/about">
              <Button size="sm" variant="ghost" className="rounded-xl hover:text-primary group relative">
                About
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Button>
            </Link>

            {/* Auth Buttons */}
            {user ? (
              <>
                <Link to="/profile">
                  <Button size="sm" variant="outline" className="rounded-xl hover:scale-105 transition-transform duration-300">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="sm" variant="outline" className="rounded-xl hover:scale-105 transition-transform duration-300">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button size="sm" variant="outline" className="rounded-xl hover:scale-105 transition-transform duration-300">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button size="sm" variant="outline" className="rounded-xl hover:scale-105 transition-transform duration-300" onClick={handleSignOut}>
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="rounded-xl bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                  Get Started
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center gap-1.5 sm:gap-2">
            <CartIcon />
            {user && <PointsWidget />}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl h-9 w-9 sm:h-10 sm:w-10 border border-primary/20 bg-primary/5 active:scale-95 transition-transform"
                >
                  {isOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-[340px] sm:max-w-[380px] p-0 border-l border-primary/20">
                <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
                  {/* Header with gradient */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/10">
                    <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/30 rounded-xl blur-md" />
                        <img src={logo} alt="AITD Events" className="h-10 w-10 rounded-xl relative z-10 shadow-md" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">aitd.events</span>
                        <span className="text-[10px] text-muted-foreground">Learn • Compete • Grow</span>
                      </div>
                    </Link>
                  </div>

                  {/* Scrollable Content */}
                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-4">
                      {/* Primary Links - Featured Cards */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest px-2 flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3" />
                          Quick Access
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {primaryNavLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                              <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex flex-col items-center p-3 rounded-2xl text-center transition-all active:scale-95 ${
                                  isActive(link.path)
                                    ? "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg"
                                    : "bg-card border border-border/50 text-foreground"
                                }`}
                              >
                                <div className={`p-2.5 rounded-xl mb-2 ${
                                  isActive(link.path) 
                                    ? "bg-white/20" 
                                    : "bg-gradient-to-br from-primary/10 to-accent/10"
                                }`}>
                                  <Icon className={`h-5 w-5 ${isActive(link.path) ? "text-white" : "text-primary"}`} />
                                </div>
                                <span className="font-semibold text-xs">{link.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      {/* More Items by Category */}
                      {moreNavLinks.map((category) => (
                        <div key={category.category} className="space-y-1.5">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">
                            {category.category}
                          </p>
                          <div className="bg-card/50 rounded-2xl border border-border/30 overflow-hidden">
                            {category.items.map((item, idx) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.path}
                                  to={item.path}
                                  onClick={() => setIsOpen(false)}
                                  className={`flex items-center justify-between px-3 py-3 text-sm transition-all active:bg-muted/80 ${
                                    isActive(item.path)
                                      ? "bg-primary/10 text-primary font-semibold"
                                      : "text-foreground"
                                  } ${idx !== category.items.length - 1 ? "border-b border-border/30" : ""}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${isActive(item.path) ? "bg-primary/20" : "bg-muted/50"}`}>
                                      <Icon className={`h-4 w-4 ${isActive(item.path) ? "text-primary" : "text-muted-foreground"}`} />
                                    </div>
                                    <span>{item.name}</span>
                                  </div>
                                  <ChevronRight className={`h-4 w-4 ${isActive(item.path) ? "text-primary" : "text-muted-foreground/50"}`} />
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* About */}
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">Info</p>
                        <div className="bg-card/50 rounded-2xl border border-border/30 overflow-hidden">
                          <Link
                            to="/about"
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center justify-between px-3 py-3 text-sm transition-all active:bg-muted/80 ${
                              isActive("/about")
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg ${isActive("/about") ? "bg-primary/20" : "bg-muted/50"}`}>
                                <Users className={`h-4 w-4 ${isActive("/about") ? "text-primary" : "text-muted-foreground"}`} />
                              </div>
                              <span>About Us</span>
                            </div>
                            <ChevronRight className={`h-4 w-4 ${isActive("/about") ? "text-primary" : "text-muted-foreground/50"}`} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>

                  {/* Footer Actions - Enhanced */}
                  <div className="p-3 border-t border-primary/10 bg-gradient-to-r from-muted/50 to-muted/30 space-y-2">
                    {user ? (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <Link to="/profile" onClick={() => setIsOpen(false)} className="block">
                            <Button variant="outline" size="sm" className="w-full justify-center rounded-xl h-10 text-xs font-semibold border-primary/20 active:scale-95 transition-transform">
                              <UserCircle className="mr-1.5 h-4 w-4" />
                              Profile
                            </Button>
                          </Link>
                          <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block">
                            <Button variant="outline" size="sm" className="w-full justify-center rounded-xl h-10 text-xs font-semibold border-primary/20 active:scale-95 transition-transform">
                              <LayoutDashboard className="mr-1.5 h-4 w-4" />
                              Dashboard
                            </Button>
                          </Link>
                        </div>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setIsOpen(false)} className="block">
                            <Button variant="outline" size="sm" className="w-full justify-center rounded-xl h-10 text-xs font-semibold border-orange-500/30 text-orange-600 active:scale-95 transition-transform">
                              <Settings className="mr-1.5 h-4 w-4" />
                              Admin Panel
                            </Button>
                          </Link>
                        )}
                        <Button variant="ghost" size="sm" className="w-full rounded-xl h-10 text-xs text-muted-foreground active:scale-95 transition-transform" onClick={handleSignOut}>
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <Link to="/auth" onClick={() => setIsOpen(false)} className="block">
                        <Button className="w-full rounded-xl h-12 font-semibold bg-gradient-to-r from-primary to-accent shadow-lg active:scale-95 transition-transform">
                          <Rocket className="mr-2 h-4 w-4" />
                          Get Started Free
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

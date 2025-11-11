import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Settings, Sparkles, Trophy, LayoutDashboard, ChevronDown, Calendar, Briefcase, Code, GraduationCap, MessageCircle, Users, Target, DollarSign, BookOpen, Rss, Video, UserCircle, Wrench, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { GlobalSearch } from "@/components/GlobalSearch";
import logo from "@/assets/aitd-logo.png";

// Primary navigation items - shown directly in navbar
const primaryNavLinks = [
  { name: "Courses", path: "/courses", icon: BookOpen },
  { name: "Events", path: "/events", icon: Calendar },
  { name: "Bounties", path: "/bounties", icon: DollarSign },
  { name: "Jobs", path: "/jobs", icon: Briefcase },
];

// Secondary navigation items - shown in "More" dropdown
const moreNavLinks = [
  { 
    category: "Learning",
    items: [
      { name: "My Courses", path: "/my-courses", icon: GraduationCap },
      { name: "Practice", path: "/practice", icon: Target },
      { name: "Scholarships", path: "/scholarships", icon: GraduationCap },
    ]
  },
  { 
    category: "Compete",
    items: [
      { name: "Hackathons", path: "/hackathons", icon: Code },
      { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    ]
  },
  { 
    category: "Connect",
    items: [
      { name: "Network", path: "/network", icon: Users },
      { name: "Groups", path: "/groups", icon: Users },
      { name: "Community", path: "/community", icon: MessageCircle },
      { name: "Mentorship", path: "/mentorship", icon: MessageCircle },
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
    // Handle scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    // Listen for auth changes
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

  return (
    <nav className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
      scrolled 
        ? 'bg-background/98 backdrop-blur-xl shadow-lg border-border/80' 
        : 'bg-background/95 backdrop-blur-md border-border/50'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md group-hover:bg-primary/30 transition-all duration-300" />
              <img 
                src={logo} 
                alt="AITD Events" 
                className="h-11 w-11 rounded-xl relative z-10 group-hover:scale-110 transition-transform duration-300 shadow-lg" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:from-accent group-hover:to-primary transition-all duration-300">
                aitd.events
              </span>
              <span className="text-xs text-muted-foreground -mt-1">Learn • Compete • Grow</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Search Bar */}
            <div className="mr-2">
              <GlobalSearch />
            </div>

            <div className="h-6 w-px bg-border" />

            {primaryNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 group ${
                    isActive(link.path)
                      ? "text-primary-foreground"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {isActive(link.path) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl animate-gradient" style={{ backgroundSize: '200% 200%' }} />
                  )}
                  <Icon className={`h-4 w-4 relative z-10 transition-transform duration-300 ${isActive(link.path) ? '' : 'group-hover:scale-110 group-hover:rotate-6'}`} />
                  <span className="relative z-10">{link.name}</span>
                  {!isActive(link.path) && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  )}
                </Link>
              );
            })}

            {/* More Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="px-4 py-2 rounded-xl text-sm font-medium hover:text-primary hover:bg-transparent group relative"
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

            <div className="h-6 w-px bg-border mx-2" />

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
                <Button size="sm" variant="outline" className="rounded-xl hover:scale-105 transition-transform duration-300" onClick={() => supabase.auth.signOut()}>
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

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-xl"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 space-y-3 animate-in slide-in-from-top duration-300">
            {/* Mobile Search */}
            <div className="px-2 mb-4">
              <GlobalSearch />
            </div>

            <div className="h-px bg-border" />

            {/* Primary Links */}
            <div className="space-y-1">
              {primaryNavLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive(link.path)
                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* More Items */}
            {moreNavLinks.map((category) => (
              <div key={category.category} className="space-y-1">
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground">
                  {category.category}
                </div>
                {category.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
                        isActive(item.path)
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            ))}

            <div className="h-px bg-border my-3" />

            {/* Bottom Actions */}
            <div className="space-y-2">
              <Link to="/about" onClick={() => setIsOpen(false)}>
                <Button size="sm" variant="ghost" className="w-full rounded-xl">About</Button>
              </Link>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button size="sm" variant="outline" className="w-full rounded-xl">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)}>
                      <Button size="sm" variant="outline" className="w-full rounded-xl">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button size="sm" variant="outline" className="w-full rounded-xl" onClick={() => supabase.auth.signOut()}>
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="w-full rounded-xl bg-gradient-to-r from-primary to-accent">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

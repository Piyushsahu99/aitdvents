import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Users, Loader2, MessageCircle, Zap, Sparkles, ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { LiveChat } from "@/components/LiveChat";

interface CommunityLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  description: string;
  is_active: boolean;
}

export default function Community() {
  const [links, setLinks] = useState<CommunityLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommunityLinks();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchCommunityLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("community_links")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error("Error fetching community links:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || Users;
    return Icon;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Responsive */}
      <section className="relative py-10 sm:py-14 md:py-20 px-3 sm:px-4 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-sm sm:text-base md:text-lg px-3 sm:px-4 md:px-6 py-1.5 sm:py-2">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Join Our Community
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            CONNECT WITH{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              50,000+ STUDENTS
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join our thriving community across multiple platforms.
          </p>
        </div>
      </section>

      {/* Live Chat Feature Section - Responsive */}
      <section className="py-8 sm:py-10 md:py-12 px-3 sm:px-4 bg-gradient-to-b from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            {/* Left side - Feature description */}
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full">
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                <span className="text-xs sm:text-sm font-semibold text-primary">Live & Real-time</span>
              </div>
              
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                Chat with Students{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Right Now
                </span>
              </h2>
              
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                Join our live community chat! Connect with fellow students in real-time.
              </p>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-background/80 border border-border/50">
                  <div className="p-1.5 sm:p-2 rounded-full bg-success/10">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-success rounded-full animate-pulse" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs sm:text-sm">Real-time</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Instant messages</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-background/80 border border-border/50">
                  <div className="p-1.5 sm:p-2 rounded-full bg-primary/10">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs sm:text-sm">Live Presence</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">See who's online</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-background/80 border border-border/50">
                  <div className="p-1.5 sm:p-2 rounded-full bg-accent/10">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs sm:text-sm">Engaging</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Active community</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-background/80 border border-border/50">
                  <div className="p-1.5 sm:p-2 rounded-full bg-primary/10">
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs sm:text-sm">24/7 Chat</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Always available</p>
                  </div>
                </div>
              </div>

              {!user && (
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                    <strong className="text-foreground">Login to join!</strong> Create an account to start chatting.
                  </p>
                  <Button 
                    onClick={() => navigate("/auth")}
                    size="sm"
                    className="bg-gradient-to-r from-primary to-accent text-xs sm:text-sm h-8 sm:h-9"
                  >
                    Login to Chat
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2" />
                  </Button>
                </div>
              )}

              <Button 
                onClick={() => navigate("/live-chat")}
                size="sm"
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10 text-xs sm:text-sm h-9 sm:h-10"
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                Open Full Chat
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2" />
              </Button>
            </div>

            {/* Right side - Live chat preview */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl" />
              <div className="relative">
                <LiveChat compact />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Links Grid - Responsive */}
      <section className="py-10 sm:py-12 md:py-16 px-3 sm:px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">
              Join Us Across Platforms
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Connect with our community on your favorite platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {links.map((link, index) => {
              const Icon = getIcon(link.icon);
              return (
                <Card
                  key={link.id}
                  className="group relative p-4 sm:p-6 md:p-8 hover:shadow-[var(--shadow-hover)] transition-all duration-300 active:scale-[0.98] sm:hover:-translate-y-1 overflow-hidden"
                  style={{
                    animationDelay: `${Math.min(index * 50, 200)}ms`,
                  }}
                >
                  <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                  <div className="relative z-10">
                    <div className="p-2.5 sm:p-3 md:p-4 bg-primary/10 rounded-xl sm:rounded-2xl w-fit mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary" />
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1.5 sm:mb-2">{link.platform}</h3>
                    <p className="text-muted-foreground mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {link.description}
                    </p>
                    <Button
                      asChild
                      size="sm"
                      className="w-full text-xs sm:text-sm h-9 sm:h-10"
                    >
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        Join Now
                        <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2" />
                      </a>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Join Section - Responsive */}
      <section className="py-10 sm:py-12 md:py-16 px-3 sm:px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-8 sm:mb-10 md:mb-12 text-center">
            Why Join Our Community?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <Card className="p-3 sm:p-4 md:p-6 hover:shadow-[var(--shadow-hover)] transition-all active:scale-[0.98]">
              <h3 className="text-sm sm:text-base md:text-xl font-bold mb-1.5 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-xl md:text-2xl">💬</span>
                <span className="truncate">Real-Time Support</span>
              </h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2">
                Get instant help from peers and mentors
              </p>
            </Card>
            <Card className="p-3 sm:p-4 md:p-6 hover:shadow-[var(--shadow-hover)] transition-all active:scale-[0.98]">
              <h3 className="text-sm sm:text-base md:text-xl font-bold mb-1.5 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-xl md:text-2xl">🤝</span>
                <span className="truncate">Networking</span>
              </h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2">
                Connect with students and professionals
              </p>
            </Card>
            <Card className="p-3 sm:p-4 md:p-6 hover:shadow-[var(--shadow-hover)] transition-all active:scale-[0.98]">
              <h3 className="text-sm sm:text-base md:text-xl font-bold mb-1.5 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-xl md:text-2xl">🎯</span>
                <span className="truncate">Exclusive Updates</span>
              </h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2">
                Be the first to know about opportunities
              </p>
            </Card>
            <Card className="p-3 sm:p-4 md:p-6 hover:shadow-[var(--shadow-hover)] transition-all active:scale-[0.98]">
              <h3 className="text-sm sm:text-base md:text-xl font-bold mb-1.5 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-xl md:text-2xl">🚀</span>
                <span className="truncate">Collaboration</span>
              </h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2">
                Find teammates for hackathons
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

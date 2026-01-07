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
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-lg px-6 py-2">
            <Users className="h-4 w-4 mr-2" />
            Join Our Community
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            CONNECT WITH{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              50,000+ STUDENTS
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join our thriving community across multiple platforms. Get support, share experiences, and grow together.
          </p>
        </div>
      </section>

      {/* Live Chat Feature Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-orange-500/5 to-amber-500/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Feature description */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-full">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">Live & Real-time</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold">
                Chat with Students{" "}
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Right Now
                </span>
              </h2>
              
              <p className="text-lg text-muted-foreground">
                Join our live community chat! Connect with fellow students, ask questions, share resources, and make friends in real-time.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border border-border/50">
                  <div className="p-2 rounded-full bg-green-500/10">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Real-time</p>
                    <p className="text-xs text-muted-foreground">Instant messages</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border border-border/50">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Live Presence</p>
                    <p className="text-xs text-muted-foreground">See who's online</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border border-border/50">
                  <div className="p-2 rounded-full bg-purple-500/10">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Engaging</p>
                    <p className="text-xs text-muted-foreground">Active community</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border border-border/50">
                  <div className="p-2 rounded-full bg-orange-500/10">
                    <MessageCircle className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">24/7 Chat</p>
                    <p className="text-xs text-muted-foreground">Always available</p>
                  </div>
                </div>
              </div>

              {!user && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong className="text-foreground">Login to join the conversation!</strong> Create an account to start chatting with other students.
                  </p>
                  <Button 
                    onClick={() => navigate("/auth")}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  >
                    Login to Chat
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}

              <Button 
                onClick={() => navigate("/live-chat")}
                size="lg"
                variant="outline"
                className="border-orange-500/50 text-orange-600 hover:bg-orange-500/10"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Open Full Chat
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Right side - Live chat preview */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl" />
              <div className="relative">
                <LiveChat compact />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Links Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Us Across Platforms
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with our community on your favorite platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.map((link, index) => {
              const Icon = getIcon(link.icon);
              return (
                <Card
                  key={link.id}
                  className="group relative p-8 hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                  <div className="relative z-10">
                    <div className="p-4 bg-primary/10 rounded-2xl w-fit mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{link.platform}</h3>
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                      {link.description}
                    </p>
                    <Button
                      asChild
                      className="w-full group-hover:shadow-[var(--shadow-card)]"
                    >
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        Join Now
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Why Join Our Community?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 hover:shadow-[var(--shadow-hover)] transition-all">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">💬</span>
                Real-Time Support
              </h3>
              <p className="text-muted-foreground">
                Get instant help from peers and mentors whenever you need it
              </p>
            </Card>
            <Card className="p-6 hover:shadow-[var(--shadow-hover)] transition-all">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">🤝</span>
                Networking
              </h3>
              <p className="text-muted-foreground">
                Connect with students from top colleges and industry professionals
              </p>
            </Card>
            <Card className="p-6 hover:shadow-[var(--shadow-hover)] transition-all">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Exclusive Updates
              </h3>
              <p className="text-muted-foreground">
                Be the first to know about new opportunities and events
              </p>
            </Card>
            <Card className="p-6 hover:shadow-[var(--shadow-hover)] transition-all">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                Collaboration
              </h3>
              <p className="text-muted-foreground">
                Find teammates for hackathons and collaborative projects
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
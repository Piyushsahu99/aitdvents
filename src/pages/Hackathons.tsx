import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, Trophy, Clock, Zap, Globe, User, Coins, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthModal } from "@/components/AuthModal";
import { HackathonSubmissionModal } from "@/components/HackathonSubmissionModal";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import hackathonBanner from "@/assets/hackathon-banner.jpg";
import { POINT_VALUES } from "@/hooks/useEarnCoins";

export default function Hackathons() {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchHackathons();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchHackathons = async () => {
    try {
      const { data, error } = await supabase
        .from("hackathons")
        .select("*")
        .eq("status", "live")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHackathons(data || []);
    } catch (error) {
      console.error("Error fetching hackathons:", error);
      toast({
        title: "Error",
        description: "Failed to load hackathons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = ["all", ...Array.from(new Set(hackathons.map((h) => h.category)))];

  const filteredHackathons = hackathons.filter((hackathon) => {
    const matchesSearch = hackathon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hackathon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hackathon.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || hackathon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRegister = (hackathon: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (hackathon.external_link) {
      window.open(hackathon.external_link, '_blank');
    } else {
      toast({
        title: "Registration",
        description: "Registration feature coming soon!",
      });
    }
  };

  const handleSubmitHackathon = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowSubmitModal(true);
  };

  const getDaysUntil = (date: string) => {
    const days = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-success/10 text-success border-success/20';
      case 'intermediate': return 'bg-warning/10 text-warning border-warning/20';
      case 'advanced': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'online': return <Globe className="h-4 w-4" />;
      case 'offline': return <MapPin className="h-4 w-4" />;
      case 'hybrid': return <Zap className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20">
        <img 
          src={hackathonBanner} 
          alt="Hackathon" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 mb-4">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Build. Compete. Win.</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-3">Hackathons</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-3">
              Join exciting hackathons, collaborate with talented developers, and bring your innovative ideas to life
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge className="bg-yellow-500/90 text-white border-0">
                <Coins className="w-4 h-4 mr-2" />
                Earn {POINT_VALUES.HACKATHON_REGISTER} coins per submission!
              </Badge>
              <Button onClick={handleSubmitHackathon} className="gap-2">
                <Plus className="h-4 w-4" />
                Submit a Hackathon
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* HackSamarth 2026 Featured Banner */}
        <Card className="mb-8 overflow-hidden border-primary/30 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 hover:shadow-lg transition-all">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">HackSamarth 2026</h3>
                  <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs">Featured</Badge>
                </div>
                <p className="text-sm text-muted-foreground">PPT Submission Round is LIVE! Submit your innovation idea now.</p>
              </div>
            </div>
            <Button onClick={() => window.location.href = '/hacksamarth'} className="shrink-0 gap-2">
              View Details <Zap className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <SearchBar
            placeholder="Search hackathons by name, organizer, or keywords..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
          <CategoryFilter
            categories={categories.filter(c => c !== 'all')}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="hover-lift bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{hackathons.length}</div>
              <p className="text-xs text-muted-foreground font-medium">Active Hackathons</p>
            </CardContent>
          </Card>
          <Card className="hover-lift bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">₹{(hackathons.reduce((sum, h) => sum + parseInt(h.prize_pool.replace(/[^0-9]/g, '') || '0'), 0) / 100000).toFixed(1)}L+</div>
              <p className="text-xs text-muted-foreground font-medium">Total Prize Pool</p>
            </CardContent>
          </Card>
          <Card className="hover-lift bg-gradient-to-br from-info/5 to-info/10 border-info/20">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-info to-primary bg-clip-text text-transparent">{hackathons.reduce((sum, h) => sum + (h.total_participants || 0), 0)}</div>
              <p className="text-xs text-muted-foreground font-medium">Participants</p>
            </CardContent>
          </Card>
          <Card className="hover-lift bg-gradient-to-br from-success/5 to-success/10 border-success/20">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">{categories.length - 1}</div>
              <p className="text-xs text-muted-foreground font-medium">Categories</p>
            </CardContent>
          </Card>
        </div>

      {/* Hackathons Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {[...Array(8)].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-muted" />
              <CardHeader className="space-y-2">
                <div className="h-5 w-20 bg-muted rounded-full" />
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-16 bg-muted rounded" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-muted rounded w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredHackathons.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl border border-dashed border-muted-foreground/20">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <p className="text-foreground text-xl font-semibold mb-2">No hackathons found</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search or filters to find hackathons
          </p>
          <Button onClick={handleSubmitHackathon} className="mt-6 gap-2">
            <Plus className="h-4 w-4" />
            Submit a Hackathon
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {filteredHackathons.map((hackathon) => {
            const daysUntilStart = getDaysUntil(hackathon.start_date);
            const daysUntilDeadline = getDaysUntil(hackathon.registration_deadline);
            const themes = Array.isArray(hackathon.themes) ? hackathon.themes : [];

            return (
              <Card key={hackathon.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
                  {hackathon.banner_url ? (
                    <img 
                      src={hackathon.banner_url} 
                      alt={hackathon.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/30 flex items-center justify-center">
                      <Trophy className="h-12 w-12 text-primary/50" />
                    </div>
                  )}
                </div>
                
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className={getDifficultyColor(hackathon.difficulty)} variant="outline">
                      {hackathon.difficulty}
                    </Badge>
                    {daysUntilDeadline > 0 && daysUntilDeadline <= 7 && (
                      <Badge variant="destructive" className="animate-pulse">
                        <Clock className="h-3 w-3 mr-1" />
                        {daysUntilDeadline}d left
                      </Badge>
                    )}
                  </div>
                  
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {hackathon.title}
                  </CardTitle>
                  
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <User className="h-3 w-3" />
                    {hackathon.organizer}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {hackathon.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">{hackathon.prize_pool}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {getModeIcon(hackathon.mode)}
                      <span className="capitalize">{hackathon.mode}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Team of {hackathon.max_team_size}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{daysUntilStart}d away</span>
                    </div>
                  </div>

                  {themes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {themes.slice(0, 3).map((theme: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                      {themes.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{themes.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      📍 {hackathon.location}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      🗓️ {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-destructive mt-1 font-medium">
                      ⏰ Register by: {new Date(hackathon.registration_deadline).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button 
                    onClick={() => handleRegister(hackathon)}
                    className="flex-1"
                    disabled={daysUntilDeadline < 0}
                  >
                    {daysUntilDeadline < 0 ? 'Registration Closed' : 'Register Now'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      <HackathonSubmissionModal 
        open={showSubmitModal} 
        onOpenChange={setShowSubmitModal}
        onSuccess={fetchHackathons}
      />
      </div>
    </div>
  );
}

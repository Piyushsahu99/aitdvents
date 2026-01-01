import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Calendar, DollarSign, Users, Loader2, Coins, Sparkles, Gift, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthModal } from "@/components/AuthModal";
import { useToast } from "@/hooks/use-toast";

export default function Scholarships() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchScholarships();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchScholarships = async () => {
    try {
      const { data, error } = await supabase
        .from("scholarships")
        .select("*")
        .eq("status", "live")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setScholarships(data || []);
    } catch (error) {
      console.error("Error fetching scholarships:", error);
      toast({
        title: "Error",
        description: "Failed to load scholarships",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(scholarships.map((s: any) => s.category))];

  const filteredScholarships = scholarships.filter(
    (scholarship: any) =>
      (category === "All" || scholarship.category === category) &&
      (scholarship.title.toLowerCase().includes(search.toLowerCase()) ||
        scholarship.description.toLowerCase().includes(search.toLowerCase()) ||
        scholarship.provider.toLowerCase().includes(search.toLowerCase()))
  );

  const handleApply = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      toast({
        title: "Application Submitted",
        description: "Your scholarship application has been submitted!",
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 px-4 overflow-hidden bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-indigo-500/10">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-cyan-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/20 rounded-full blur-3xl animate-float-delayed" />
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-10 animate-fade-in-up">
            <Badge className="mb-4 bg-cyan-500/10 text-cyan-600 border-cyan-500/20 hover:bg-cyan-500/20">
              <Sparkles className="h-3 w-3 mr-1.5" />
              Financial Aid
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Scholarships
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Find financial aid and scholarship opportunities for your education
            </p>
          </div>

          {/* Coin Earning Banner */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up stagger-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-500/20">
                <Coins className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Earn coins while you learn!</p>
                <p className="text-sm text-muted-foreground">Complete courses & events to build your profile</p>
              </div>
            </div>
            <Link to="/rewards">
              <Button variant="outline" className="border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10">
                <Gift className="h-4 w-4 mr-2" />
                View Rewards
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Telegram Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 py-3 px-4">
        <div className="container mx-auto max-w-6xl flex items-center justify-center gap-2 text-white text-sm sm:text-base">
          <Send className="h-4 w-4 animate-pulse" />
          <span className="font-medium">Get scholarship alerts on Telegram!</span>
          <a 
            href="https://t.me/aitdevents" 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold transition-colors"
          >
            Join Now →
          </a>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6 mb-8">
          <SearchBar
            placeholder="Search scholarships..."
            value={search}
            onChange={setSearch}
          />
          <CategoryFilter
            categories={categories}
            selected={category}
            onSelect={setCategory}
          />
        </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {filteredScholarships.map((scholarship) => (
              <div
                key={scholarship.id}
                className="p-6 bg-card rounded-lg border border-border hover:shadow-[var(--shadow-hover)] transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{scholarship.title}</h3>
                      <Badge variant="secondary">{scholarship.category}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      <span className="font-medium">{scholarship.provider}</span>
                    </div>

                    <p className="text-muted-foreground mb-4">{scholarship.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="font-medium">{scholarship.amount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>Deadline: {scholarship.deadline}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{scholarship.eligibility}</span>
                      </div>
                    </div>

                    {scholarship.requirements && (
                      <div className="text-sm">
                        <span className="font-medium">Requirements: </span>
                        <span className="text-muted-foreground">{scholarship.requirements}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button onClick={handleApply}>Apply Now</Button>
                </div>
              </div>
            ))}
          </div>

          {filteredScholarships.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No scholarships found matching your criteria
              </p>
            </div>
          )}
        </>
      )}

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </div>
    </div>
  );
}

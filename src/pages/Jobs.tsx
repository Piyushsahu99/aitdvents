import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Building, MapPin, Clock, Banknote, Loader2, Briefcase, Sparkles, Users, TrendingUp, ExternalLink, Send, Coins, Gift, Plus, Rocket, CheckCircle2, FileText, GraduationCap, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthModal } from "@/components/AuthModal";
import { JobSubmissionModal } from "@/components/JobSubmissionModal";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "live")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...new Set(jobs.map((j: any) => j.category))];

  const filteredJobs = jobs.filter(
    (job: any) =>
      (category === "All" || job.category === category) &&
      (job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()))
  );

  const handleApply = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully!",
      });
    }
  };

  const handlePostJob = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowJobModal(true);
    }
  };

  const typeColors: Record<string, string> = {
    "Internship": "bg-blue-500",
    "Full-time": "bg-emerald-500",
    "Part-time": "bg-amber-500",
    "Contract": "bg-violet-500",
    "Remote": "bg-cyan-500",
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 px-4 overflow-hidden bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-yellow-500/10">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-orange-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-amber-500/20 rounded-full blur-3xl animate-float-delayed" />
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-10 animate-fade-in-up">
            <Badge className="mb-4 bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20">
              <Sparkles className="h-3 w-3 mr-1.5" />
              Career Opportunities
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
              Jobs & Internships
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Launch your career with opportunities from top companies. Find internships, jobs, and more.
            </p>
            
            {/* Post Job Button */}
            <Button 
              onClick={handlePostJob}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post a Job / Internship
            </Button>
          </div>

          {/* Stats Row - Real Data */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-fade-in-up stagger-1">
            {[
              { label: "Open Positions", value: jobs.length, icon: Briefcase },
              { label: "Companies", value: new Set(jobs.map(j => j.company)).size, icon: Building },
              { label: "Categories", value: new Set(jobs.map(j => j.category)).size, icon: TrendingUp },
              { label: "Job Types", value: new Set(jobs.map(j => j.type)).size, icon: Users },
            ].map((stat, idx) => (
              <div key={idx} className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Coin Earning Banner */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up stagger-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-500/20">
                <Coins className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Earn AITD Coins while job hunting!</p>
                <p className="text-sm text-muted-foreground">Complete bounties, courses & events to earn rewards</p>
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
          <span className="font-medium">Join our Telegram for daily job updates!</span>
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

      {/* Main Content */}
      <section className="py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Search & Filter */}
          <div className="mb-8 space-y-4 animate-fade-in">
            <SearchBar
              placeholder="Search jobs, companies..."
              value={search}
              onChange={setSearch}
            />
            
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    category === cat
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg"
                      : "bg-card border border-border hover:border-orange-500/50 text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* AITD Hiring Featured Banner */}
              <Card className="mb-8 overflow-hidden border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 relative">
                <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  🔥 FEATURED
                </div>
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Image Section */}
                    <div className="lg:w-72 h-48 lg:h-auto flex-shrink-0">
                      <img
                        src="/images/aitd-hiring-2025.png"
                        alt="AITD Events is Hiring - Join our team"
                        className="w-full h-full object-cover lg:object-contain lg:p-4"
                      />
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge className="bg-orange-500 text-white border-0 animate-pulse">
                          <Rocket className="h-3 w-3 mr-1" />
                          We Are Hiring!
                        </Badge>
                        <Badge variant="outline" className="border-orange-500/30 text-orange-600">
                          Open to All Students
                        </Badge>
                      </div>
                      
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                        Join AITD Events Team - Multiple Roles
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Be part of our student-driven community! We're looking for passionate students to join exciting roles.
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {["Graphic Designer", "Video Editor", "Event Manager", "Sponsorship Team", "Marketing & PR", "Community Lead"].map((role) => (
                          <div key={role} className="flex items-center gap-1 text-xs bg-orange-500/10 text-orange-700 rounded-full px-2.5 py-1 border border-orange-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{role}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5 text-orange-500" />
                          <span>Free Event Access</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-orange-500" />
                          <span>Offer Letter</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-orange-500" />
                          <span>Certificate</span>
                        </div>
                      </div>
                      
                      <a href="https://forms.gle/12yBH78tNfAzhDFm6" target="_blank" rel="noopener noreferrer">
                        <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg">
                          Apply Now
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {filteredJobs.map((job, index) => (
                  <Card
                    key={job.id}
                    className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Left accent */}
                        <div className={`w-full lg:w-2 h-2 lg:h-auto ${typeColors[job.type] || 'bg-primary'}`} />
                        
                        <div className="flex-1 p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                              {/* Header */}
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <h3 className="text-xl font-bold text-foreground group-hover:text-orange-500 transition-colors">
                                  {job.title}
                                </h3>
                                <Badge className={`${typeColors[job.type] || 'bg-primary'} text-white border-0`}>
                                  {job.type}
                                </Badge>
                              </div>
                              
                              {/* Details Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-orange-500/10">
                                    <Building className="h-4 w-4 text-orange-500" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Company</p>
                                    <p className="text-sm font-medium">{job.company}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                                    <MapPin className="h-4 w-4 text-blue-500" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Location</p>
                                    <p className="text-sm font-medium">{job.location}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-violet-500/10">
                                    <Clock className="h-4 w-4 text-violet-500" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Duration</p>
                                    <p className="text-sm font-medium">{job.duration}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-emerald-500/10">
                                    <Banknote className="h-4 w-4 text-emerald-500" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Stipend</p>
                                    <p className="text-sm font-bold text-emerald-600">{job.stipend}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {job.description && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {job.description}
                                </p>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="rounded-full">
                                  {job.category}
                                </Badge>
                                {job.apply_by && (
                                  <Badge variant="secondary" className="rounded-full bg-amber-500/10 text-amber-600 border-amber-500/20">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Apply by: {job.apply_by}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex sm:flex-col gap-2">
                              <Button 
                                onClick={handleApply}
                                className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg"
                              >
                                Apply Now
                                <ExternalLink className="h-4 w-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredJobs.length === 0 && !loading && (
                <Card className="border-dashed border-2">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="p-4 rounded-full bg-orange-500/10 mb-4">
                      <Briefcase className="h-12 w-12 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      No jobs match your search criteria. Try adjusting your filters or check back later!
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </section>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      <JobSubmissionModal 
        open={showJobModal} 
        onOpenChange={setShowJobModal}
        onSuccess={fetchJobs}
      />
    </div>
  );
}
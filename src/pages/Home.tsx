import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PersonaCard } from "@/components/PersonaCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileCompletionPopup } from "@/components/ProfileCompletionPopup";
import { ContributorLeaderboard } from "@/components/ContributorLeaderboard";
import { EventCard } from "@/components/EventCard";
import { POINT_VALUES } from "@/hooks/useEarnCoins";
import aitdMascot from "@/assets/aitd-mascot.png";
import { supabase } from "@/integrations/supabase/client";
import { TeamShowcaseSection } from "@/components/home/TeamShowcaseSection";
import { EventGallerySection } from "@/components/home/EventGallerySection";
import { BlogsSection } from "@/components/home/BlogsSection";
import {
  Calendar, Briefcase, GraduationCap, Sparkles, Users, Trophy,
  Target, Building, Zap, ArrowRight, BookOpen, Star, Clock, Play,
  CheckCircle2, Send, FileText, Rocket, TrendingUp, Coins, Globe,
  Lightbulb, Gamepad2, Heart, Megaphone,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  category: string;
  level: string;
  duration: string;
  thumbnail_url: string | null;
  enrolled_count: number;
  rating: number;
  is_free: boolean;
  price: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  poster_url: string | null;
  external_link: string | null;
  is_online: boolean;
  is_free: boolean;
  days_left: number | null;
  applied_count: number;
  created_at: string | null;
  college?: string | null;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  stipend: string;
  category: string;
  created_at: string | null;
}

interface PlatformStats {
  students: number;
  events: number;
  jobs: number;
  courses: number;
  bounties: number;
  ambassadors: number;
  colleges: number;
}

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [highlightedEvents, setHighlightedEvents] = useState<Event[]>([]);
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    students: 0, events: 0, jobs: 0, courses: 0, bounties: 0, ambassadors: 0, colleges: 0,
  });

  useEffect(() => {
    fetchFeaturedCourses();
    fetchHighlightedEvents();
    fetchLatestJobs();
    fetchPlatformStats();

    // Auto-refresh stats every 10 seconds for real-time feel
    const interval = setInterval(() => {
      fetchPlatformStats();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchHighlightedEvents = async () => {
    try {
      // First try featured events ordered by position
      const { data: featured, error: featuredErr } = await supabase
        .from("events")
        .select("*")
        .eq("status", "live")
        .eq("is_featured", true)
        .order("home_position", { ascending: true })
        .limit(4);

      if (!featuredErr && featured && featured.length > 0) {
        setHighlightedEvents(featured);
        return;
      }

      // Fallback: newest live events
      const { data, error } = await supabase
        .from("events").select("*").eq("status", "live")
        .order("created_at", { ascending: false }).limit(4);
      if (error) throw error;
      setHighlightedEvents(data || []);
    } catch (error) { console.error("Error fetching events:", error); }
  };

  const fetchLatestJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs").select("*").eq("status", "live")
        .order("created_at", { ascending: false }).limit(4);
      if (error) throw error;
      setLatestJobs(data || []);
    } catch (error) { console.error("Error fetching jobs:", error); }
  };

  const fetchFeaturedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses").select("*").eq("status", "live")
        .order("enrolled_count", { ascending: false }).limit(3);
      if (error) throw error;
      setFeaturedCourses(data || []);
    } catch (error) { console.error("Error fetching courses:", error); }
  };

  const fetchPlatformStats = async () => {
    try {
      const [studentsRes, eventsRes, jobsRes, coursesRes, bountiesRes, ambassadorsRes, collegesRes] = await Promise.all([
        supabase.from("student_profiles").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "live"),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "live"),
        supabase.from("courses").select("id", { count: "exact", head: true }).eq("status", "live"),
        supabase.from("bounties").select("id", { count: "exact", head: true }).eq("status", "live"),
        supabase.from("campus_ambassadors").select("id", { count: "exact", head: true }),
        supabase.from("campus_ambassadors").select("college"),
      ]);
      const uniqueColleges = new Set(collegesRes.data?.map(a => a.college) || []).size;
      setStats({
        students: studentsRes.count || 0, events: eventsRes.count || 0, jobs: jobsRes.count || 0,
        courses: coursesRes.count || 0, bounties: bountiesRes.count || 0, ambassadors: ambassadorsRes.count || 0,
        colleges: uniqueColleges,
      });
    } catch (error) { console.error("Error fetching stats:", error); }
  };

  const features = [
    { icon: BookOpen, title: "Courses", link: "/courses", gradient: "from-blue-500 to-cyan-400", coins: POINT_VALUES.COURSE_ENROLL },
    { icon: Trophy, title: "Bounties", link: "/bounties", gradient: "from-emerald-500 to-teal-400", coins: POINT_VALUES.BOUNTY_SUBMIT },
    { icon: Calendar, title: "Events", link: "/events", gradient: "from-orange-500 to-amber-400", coins: POINT_VALUES.EVENT_REGISTER },
    { icon: Gamepad2, title: "Live Quiz", link: "/quiz", gradient: "from-purple-500 to-pink-400", coins: 50 },
    { icon: Briefcase, title: "Jobs", link: "/jobs", gradient: "from-orange-500 to-amber-400", coins: 0 },
    { icon: FileText, title: "Notes", link: "/study-materials", gradient: "from-blue-500 to-indigo-400", coins: POINT_VALUES.STUDY_MATERIAL_UPLOAD },
    { icon: Target, title: "Practice", link: "/practice", gradient: "from-teal-500 to-emerald-400", coins: 0 },
    { icon: GraduationCap, title: "Scholarships", link: "/scholarships", gradient: "from-cyan-500 to-blue-400", coins: 0 },
  ];

  const personas = [
    { icon: GraduationCap, title: "Students & Professionals", description: "Unlock Your Potential: Compete, Build Resume, Grow and get Hired!" },
    { icon: Building, title: "Companies & Recruiters", description: "Discover Right Talent: Hire, Engage, and Brand Like Never Before!" },
    { icon: Users, title: "Colleges & Institutions", description: "Bridge Academia and Industry: Empower Students with Real-World Opportunities!" },
  ];

  const missionItems = [
    { icon: Calendar, title: "Share & Discover Events", desc: "Post hackathons, workshops & competitions for fellow students", color: "from-orange-500 to-amber-500" },
    { icon: Briefcase, title: "Jobs & Internships", desc: "Share opportunities and help peers land their dream roles", color: "from-blue-500 to-cyan-500" },
    { icon: FileText, title: "Upload Study Material", desc: "Share handwritten notes, quantums, books & PYQ PDFs", color: "from-emerald-500 to-teal-500" },
    { icon: Play, title: "Informational Reels", desc: "Create & watch short educational videos to learn faster", color: "from-purple-500 to-pink-500" },
    { icon: Users, title: "Alumni & Mentor Connect", desc: "Get free roadmaps, guidance & career advice from seniors", color: "from-teal-500 to-cyan-500" },
    { icon: BookOpen, title: "Free Courses & Events", desc: "Access free courses, workshops & skill-building content", color: "from-indigo-500 to-blue-500" },
    { icon: GraduationCap, title: "Scholarship Updates", desc: "Never miss a scholarship — all updates at one place", color: "from-amber-500 to-yellow-500" },
    { icon: Lightbulb, title: "All-in-One Platform", desc: "Everything a student needs — learn, earn, grow & connect", color: "from-rose-500 to-orange-500" },
  ];

  const gameCards = [
    { title: "Live Quiz", icon: Gamepad2, color: "from-purple-400 to-pink-400", badge: "Popular", link: "/quiz" },
    { title: "IPL Auction", icon: Trophy, color: "from-blue-400 to-cyan-400", badge: "Coming Soon", link: "/ipl-auction" },
    { title: "Spin & Win", icon: Target, color: "from-orange-400 to-amber-400", badge: "Coming Soon", link: "/spin-wheel" },
    { title: "Lucky Draw", icon: Lightbulb, color: "from-green-400 to-emerald-400", badge: "Coming Soon", link: "/lucky-draw" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <ProfileCompletionPopup />

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[50vh] sm:min-h-[55vh] lg:min-h-[70vh] flex items-center py-5 sm:py-8 lg:py-14 px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-24 sm:w-40 h-24 sm:h-40 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-[5%] right-[10%] w-32 sm:w-48 h-32 sm:h-48 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute bottom-[15%] left-[15%] w-36 sm:w-56 h-36 sm:h-56 bg-warning/8 rounded-full blur-3xl animate-float-slow" />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <Badge className="mb-3 px-3 py-1.5 text-xs sm:text-sm bg-primary/10 text-primary border-primary/20 animate-fade-in-down">
                <Heart className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Built for Tier 2 & Tier 3 College Students
              </Badge>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 animate-fade-in-up leading-tight tracking-tight">
                <span className="text-primary">AITD</span>{" "}
                <span className="text-foreground">Events</span>
                <span className="block mt-1.5 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold">
                  <span className="text-foreground">Learn.</span>{" "}
                  <span className="bg-gradient-to-r from-primary to-warning bg-clip-text text-transparent">Earn.</span>{" "}
                  <span className="text-foreground">Grow.</span>
                </span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-5 sm:mb-7 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-in-up">
                India's student-powered platform where you share opportunities, upload notes, watch reels, find jobs & scholarships — all at one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-in-up">
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-12 sm:h-13 px-6 sm:px-8 rounded-xl shadow-lg active:scale-95 transition-transform bg-primary text-primary-foreground">
                    <Rocket className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Join Free — Earn Coins
                  </Button>
                </Link>
                <Link to="/events" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-13 px-6 sm:px-8 rounded-xl active:scale-95 transition-transform border-2 border-primary/40 text-primary">
                    <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Explore Events
                  </Button>
                </Link>
              </div>

              {/* Trust pills */}
              <div className="flex flex-wrap items-center gap-2 mt-5 justify-center lg:justify-start animate-fade-in-up">
                {[
                  { icon: CheckCircle2, label: "100% Free" },
                  { icon: Coins, label: "Earn While Learning" },
                  { icon: Globe, label: "Pan-India Network" },
                ].map(pill => (
                  <div key={pill.label} className="flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/15">
                    <pill.icon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs sm:text-sm text-primary font-medium">{pill.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Mascot */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end animate-fade-in-up">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-warning/20 rounded-full blur-3xl scale-90 animate-pulse-soft" />
                <div className="absolute inset-4 bg-gradient-to-tr from-warning/15 to-primary/15 rounded-full blur-2xl scale-75 animate-float" />
                <div className="relative z-10 rounded-full p-1 bg-gradient-to-br from-primary/30 via-warning/20 to-accent/30 ring-2 ring-primary/20 ring-offset-2 ring-offset-background animate-float-slow">
                  <div className="rounded-full p-1 bg-background/50 backdrop-blur-sm">
                    <img
                      src={aitdMascot}
                      alt="AITD Events Mascot"
                      className="w-40 sm:w-60 md:w-68 lg:w-80 h-auto drop-shadow-2xl mascot-hover rounded-full"
                      loading="eager"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-5 sm:gap-10 lg:gap-16 mt-8 sm:mt-12 pt-6 border-t border-border/50 animate-fade-in-up">
            {[
              { value: stats.students, label: "Students" },
              { value: stats.colleges, label: "Colleges" },
              { value: stats.jobs, label: "Opportunities" },
              { value: stats.courses, label: "Courses" },
            ].map((s, i) => (
              <div key={s.label} className={`text-center ${i >= 3 ? "hidden sm:block" : ""}`}>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">{s.value || 0}+</div>
                <div className="text-[10px] sm:text-sm text-muted-foreground">{s.label}</div>
              </div>
            )).reduce<React.ReactNode[]>((acc, item, i) => {
              if (i > 0) acc.push(
                <div key={`sep-${i}`} className={`w-px h-8 bg-border/50 ${i >= 3 ? "hidden sm:block" : ""}`} />
              );
              acc.push(item);
              return acc;
            }, [])}
          </div>
        </div>
      </section>

      {/* ─── HACKSAMARTH 2026 HIGHLIGHT ─── */}
      <section className="py-6 sm:py-8 px-4">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/15 via-background to-accent/10 shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/8 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-accent/10 blur-3xl" />
            
            <div className="relative z-10 p-5 sm:p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start mb-3">
                    <Badge className="bg-primary/15 text-primary border-primary/30 text-xs sm:text-sm px-3 py-1">
                      <Trophy className="w-3.5 h-3.5 mr-1.5" />
                      Organized by AITD Events
                    </Badge>
                    <Badge className="bg-green-500/15 text-green-600 border-green-500/30 text-xs px-3 py-1 animate-pulse">
                      🔥 2000+ Registrations
                    </Badge>
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight tracking-tight">
                    HackSamarth 2026
                  </h2>
                  <p className="text-sm sm:text-base text-foreground/80 mb-1.5 font-semibold">
                    🏆 National Level Hackathon — PPT Submission Round Now Open!
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-5 max-w-lg">
                    Submit your innovative idea as a PPT and compete with the best minds across India. Download the official template and submit through our Google Form.
                  </p>

                  {/* Stats row */}
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-5">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground/70">
                      <Users className="h-4 w-4 text-primary" />
                      <span><strong className="text-foreground">2000+</strong> Registrations</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground/70">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span><strong className="text-foreground">₹50K+</strong> Prizes</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground/70">
                      <Zap className="h-4 w-4 text-primary" />
                      <span><strong className="text-foreground">Pan India</strong> Participation</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                    <Link to="/hacksamarth">
                      <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg active:scale-95 transition-transform text-base font-bold">
                        <FileText className="h-4 w-4" />
                        Submit Your PPT
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <a href="/templates/HackSamarth-PPT-Template.pdf" download>
                      <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 border-2 border-primary/40 text-primary active:scale-95 transition-transform font-semibold">
                        <FileText className="h-4 w-4" />
                        Download Template
                      </Button>
                    </a>
                  </div>
                  <div className="mt-4">
                    <a
                      href="https://forms.gle/AjZr3XjvZvbjZJKLA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-primary hover:underline font-medium"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Or submit directly via Google Form →
                    </a>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4 shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl animate-pulse" />
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
                      <Rocket className="h-16 w-16 sm:h-20 sm:w-20 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <Badge className="bg-destructive/10 text-destructive border-destructive/30 text-xs animate-pulse font-semibold">
                    <Clock className="w-3 h-3 mr-1" />
                    Submissions Open
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MISSION — Tier 2/3 Focus ─── */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 bg-gradient-to-b from-muted/40 to-background">
        <div className="container mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <Badge className="mb-2 text-xs sm:text-sm bg-primary/10 text-primary border-primary/20">
              <Target className="w-3 h-3 mr-1" />
              Our Mission
            </Badge>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 leading-tight">
              Empowering <span className="bg-gradient-to-r from-primary to-warning bg-clip-text text-transparent">Tier 2 & Tier 3</span> College Students
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Every student deserves equal access to opportunities — no matter which college or city.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {missionItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group p-3 sm:p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 active:scale-[0.97] transition-all duration-200 hover:shadow-md animate-fade-in"
                  style={{ animationDelay: `${idx * 0.04}s` }}
                >
                  <div className={`relative inline-flex p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${item.color} text-white mb-2 sm:mb-2.5 shadow-md group-hover:scale-110 transition-transform`}>
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${item.color} opacity-20 blur-md`} />
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm mb-0.5 text-foreground leading-tight">{item.title}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-5 sm:mt-7">
            <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-full px-4 sm:px-6 py-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] sm:text-sm font-medium text-primary">
                Built by students, for students — from every corner of India 🇮🇳
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Telegram CTA ─── */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 py-2.5 px-4">
        <div className="container mx-auto flex items-center justify-center gap-2 sm:gap-3 text-white">
          <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse" />
          <span className="font-medium text-xs sm:text-sm">Join Telegram for updates & gifts!</span>
          <a href="https://t.me/aitdevents" target="_blank" rel="noopener noreferrer"
            className="px-2.5 sm:px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-[10px] sm:text-xs font-medium transition-all active:scale-95">
            Join →
          </a>
        </div>
      </div>

      {/* ─── QUICK ACCESS FEATURES ─── */}
      <section className="py-7 sm:py-10 lg:py-14 px-3 sm:px-4">
        <div className="container mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <Badge className="mb-2 text-xs sm:text-sm bg-primary/10 text-primary border-primary/20">
              <Zap className="w-3 h-3 mr-1" />
              Explore
            </Badge>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1">
              What do you want to <span className="bg-gradient-to-r from-primary to-warning bg-clip-text text-transparent">do today?</span>
            </h2>
            <p className="text-[11px] sm:text-sm text-muted-foreground">Tap to explore opportunities</p>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.title} to={feature.link} className="animate-fade-in group" style={{ animationDelay: `${index * 0.03}s` }}>
                  <div className="relative flex flex-col items-center p-2.5 sm:p-3 lg:p-4 rounded-xl bg-card border border-border/50 hover:border-primary/40 active:scale-95 transition-all duration-200 hover:shadow-md">
                    {feature.coins > 0 && (
                      <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-gradient-to-r from-warning to-primary text-white text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                        <Coins className="h-2 w-2 sm:h-2.5 sm:w-2.5" />+{feature.coins}
                      </div>
                    )}
                    <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-1.5 sm:mb-2 shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <span className="font-medium text-[10px] sm:text-xs lg:text-sm text-center leading-tight text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FEATURED COURSES ─── */}
      {featuredCourses.length > 0 && (
        <section className="py-8 sm:py-12 lg:py-16 px-4 bg-muted/20">
          <div className="container mx-auto">
            <div className="text-center mb-5 sm:mb-8">
              <Badge className="mb-2 sm:mb-3 text-xs sm:text-sm bg-info/10 text-info border-info/20">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                Featured Courses
              </Badge>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1.5">
                Start Learning <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Today</span>
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
                Master new skills with expert-led courses
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-5 sm:mb-7">
              {featuredCourses.map((course, index) => (
                <Link key={course.id} to={`/courses/${course.id}`} className="animate-fade-in" style={{ animationDelay: `${index * 0.08}s` }}>
                  <Card className="group hover:shadow-lg active:scale-[0.98] transition-all duration-300 cursor-pointer overflow-hidden h-full border-border/50">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${
                          index % 3 === 0 ? 'from-blue-500 to-cyan-500' : index % 3 === 1 ? 'from-emerald-500 to-teal-500' : 'from-purple-500 to-pink-500'
                        } flex items-center justify-center`}>
                          <BookOpen className="w-10 h-10 text-white/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                        {course.is_free ? (
                          <Badge className="bg-success text-success-foreground border-0 text-[10px] sm:text-xs">Free</Badge>
                        ) : (
                          <Badge className="bg-primary text-primary-foreground border-0 text-[10px] sm:text-xs">₹{course.price}</Badge>
                        )}
                      </div>
                      <Badge className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-white/90 text-foreground text-[10px] sm:text-xs">{course.category}</Badge>
                    </div>
                    <CardHeader className="p-3 sm:p-4 pb-1.5">
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-sm sm:text-base">{course.title}</CardTitle>
                      <p className="text-[11px] sm:text-sm text-muted-foreground">by {course.instructor_name}</p>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                      <div className="flex items-center justify-between text-[10px] sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1"><Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-500 text-yellow-500" /><span className="font-medium">{course.rating.toFixed(1)}</span></div>
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3 sm:w-4 sm:h-4" /><span>{course.duration}</span></div>
                        <div className="flex items-center gap-1"><Users className="w-3 h-3 sm:w-4 sm:h-4" /><span>{course.enrolled_count}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link to="/courses">
                <Button variant="outline" className="rounded-xl text-sm sm:text-base px-4 sm:px-6 active:scale-95 transition-transform">
                  View All Courses <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── HIGHLIGHTED EVENTS — Using EventCard ─── */}
      {highlightedEvents.length > 0 && (
        <section className="py-8 sm:py-12 lg:py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-5 sm:mb-8">
              <Badge className="mb-2 sm:mb-3 text-xs sm:text-sm bg-primary/10 text-primary border-primary/20">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                Newly Added
              </Badge>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1.5">
                Latest <span className="bg-gradient-to-r from-primary to-warning bg-clip-text text-transparent">Events</span>
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
                Join hackathons, workshops, and competitions
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-7">
              {highlightedEvents.map((event, index) => (
                <div key={event.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.06}s` }}>
                  <EventCard
                    title={event.title}
                    description={event.description}
                    date={event.date}
                    location={event.location}
                    category={event.category}
                    poster_url={event.poster_url || undefined}
                    external_link={event.external_link || undefined}
                    is_online={event.is_online}
                    is_free={event.is_free}
                    days_left={event.days_left ?? undefined}
                    applied_count={event.applied_count}
                    gradientIndex={index}
                    college={event.college}
                    onClick={() => window.location.href = '/events'}
                  />
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link to="/events">
                <Button variant="outline" className="rounded-xl text-sm sm:text-base px-4 sm:px-6 active:scale-95 transition-transform">
                  View All Events <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── GAMES ARENA ─── */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 bg-gradient-to-br from-purple-600 via-primary to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-[15%] left-[5%] w-40 sm:w-64 h-40 sm:h-64 bg-black/10 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            <div className="text-center lg:text-left text-white">
              <Badge className="mb-3 bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm animate-pulse">
                <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                Games Arena
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
                Play, Compete & <span className="opacity-90">Win!</span>
              </h2>
              <p className="text-sm sm:text-base lg:text-lg opacity-90 mb-4 max-w-xl mx-auto lg:mx-0">
                Join live quizzes hosted by top brands, compete in real-time, and win cash prizes & certificates!
              </p>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 max-w-sm mx-auto lg:mx-0">
                {[{ icon: Trophy, label: "Win Prizes" }, { icon: Users, label: "Compete Live" }, { icon: Zap, label: "Instant Results" }].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1.5 text-xs sm:text-sm bg-white/15 rounded-xl px-3 py-2.5 backdrop-blur-sm border border-white/20 active:scale-95 transition-transform">
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6" /><span>{item.label}</span>
                  </div>
                ))}
              </div>
              <Link to="/quiz">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 text-sm sm:text-base px-6 sm:px-8 py-3 rounded-xl active:scale-95 transition-transform font-semibold">
                  <Gamepad2 className="mr-2 h-4 w-4" />Enter Games Arena<ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 max-w-sm lg:max-w-md">
                {gameCards.map((game) => (
                  <Link key={game.title} to={game.link}>
                    <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3.5 sm:p-4 border border-white/20 active:scale-95 hover:bg-white/25 transition-all duration-200 cursor-pointer">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-2 shadow-lg`}>
                        <game.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-xs sm:text-sm text-white">{game.title}</h3>
                      <Badge className="mt-1 text-[10px] bg-white/20 border-white/30 text-white">{game.badge}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LATEST JOBS ─── */}
      {latestJobs.length > 0 && (
        <section className="py-8 sm:py-12 lg:py-16 px-4 bg-muted/20">
          <div className="container mx-auto">
            <div className="text-center mb-5 sm:mb-8">
              <Badge className="mb-2 sm:mb-3 text-xs sm:text-sm bg-primary/10 text-primary border-primary/20">
                <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                Newly Added
              </Badge>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1.5">
                Latest <span className="bg-gradient-to-r from-primary to-warning bg-clip-text text-transparent">Opportunities</span>
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
                Freshly added internships and job openings
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-7">
              {latestJobs.map((job, index) => {
                const companyInitial = job.company?.charAt(0)?.toUpperCase() || "?";
                const hashCode = job.company?.split("").reduce((a: number, b: string) => ((a << 5) - a) + b.charCodeAt(0), 0) || 0;
                const colors = ["bg-primary", "bg-accent", "bg-info", "bg-success", "bg-warning"];
                const bgColor = colors[Math.abs(hashCode) % colors.length];
                return (
                <Link key={job.id} to="/jobs" className="animate-fade-in" style={{ animationDelay: `${index * 0.06}s` }}>
                  <Card className="group hover:shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer h-full border-border/50 hover:border-primary/30">
                    <CardHeader className="p-3 sm:p-4 pb-1.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge className="bg-primary text-primary-foreground border-0 text-[10px] sm:text-xs px-1.5 py-0.5 animate-pulse">New</Badge>
                        <Badge variant="outline" className="text-[10px] sm:text-xs">{job.type}</Badge>
                      </div>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-sm sm:text-base">{job.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${bgColor} flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0`}>
                          {companyInitial}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium">{job.company}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                      <div className="flex flex-col gap-1 text-[10px] sm:text-xs text-muted-foreground">
                        <div className="flex items-center gap-1"><Target className="w-3 h-3" /><span>{job.location}</span></div>
                        <div className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /><span className="font-semibold text-success">{job.stipend}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                );
              })}
            </div>

            <div className="text-center">
              <Link to="/jobs">
                <Button variant="outline" className="rounded-xl text-sm sm:text-base px-4 sm:px-6 active:scale-95 transition-transform">
                  View All Jobs <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── CAMPUS AMBASSADOR ─── */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 bg-gradient-to-br from-primary via-warning to-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-[10%] right-[5%] w-40 sm:w-64 h-40 sm:h-64 bg-white/10 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-3 bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                Campus Ambassador Program
              </Badge>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
                Represent AITD at Your College
              </h2>
              <p className="text-sm sm:text-base opacity-90 mb-4 max-w-lg mx-auto lg:mx-0">
                Join our campus ambassador program and earn rewards while helping fellow students discover opportunities!
              </p>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-5 max-w-sm mx-auto lg:mx-0">
                {[
                  { icon: TrendingUp, label: "Earn Upto ₹10,000" },
                  { icon: Star, label: "Verified Certificate" },
                  { icon: Calendar, label: "Free Event Access" },
                  { icon: Megaphone, label: "Build Network" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg"><item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <a href="https://forms.gle/5hyQgiaEGQ7uBw857" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="secondary" className="text-sm sm:text-base px-5 sm:px-6 py-3 rounded-xl active:scale-95 transition-transform">
                  Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              {[
                { value: stats.ambassadors.toString(), label: "Campus Ambassadors" },
                { value: stats.colleges.toString(), label: "Colleges" },
                { value: stats.students.toString(), label: "Students" },
                { value: stats.events.toString(), label: "Events" },
              ].map((stat) => (
                <div key={stat.label} className="p-3 sm:p-4 lg:p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 active:scale-95 transition-transform">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-0.5">{stat.value}</div>
                  <div className="text-[11px] sm:text-sm opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TEAM & AMBASSADORS SHOWCASE ─── */}
      <TeamShowcaseSection />

      {/* ─── EVENT PHOTO GALLERY ─── */}
      <EventGallerySection />

      {/* ─── BLOGS ─── */}
      <BlogsSection />

      {/* ─── WHO'S USING ─── */}
      <section className="py-8 sm:py-12 lg:py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-1.5 sm:mb-2">
            Who's using <span className="bg-gradient-to-r from-primary to-warning bg-clip-text text-transparent">AITD</span>?
          </h2>
          <p className="text-center text-muted-foreground mb-5 sm:mb-8 max-w-xl mx-auto text-xs sm:text-sm md:text-base">
            Join thousands of students, companies, and institutions transforming tech education
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {personas.map((persona, index) => (
              <div key={persona.title} className="animate-fade-in" style={{ animationDelay: `${index * 0.08}s` }}>
                <PersonaCard {...persona} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMMUNITY & LEADERBOARD ─── */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 bg-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-40 sm:w-64 h-40 sm:h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-[20%] right-[10%] w-48 sm:w-80 h-48 sm:h-80 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-6 sm:mb-10">
            <Badge className="mb-2 sm:mb-3 text-xs sm:text-sm bg-primary/10 text-primary border-primary/20">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
              Growing Community
            </Badge>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1.5">
              Join Our <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Community</span>
            </h2>
          </div>

          <div className="max-w-xl mx-auto">
            <ContributorLeaderboard />
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 bg-gradient-to-br from-primary via-warning to-accent text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="container mx-auto relative z-10 text-center">
          <Badge className="mb-3 bg-white/20 text-white border-white/30 text-xs sm:text-sm">
            <Rocket className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
            Start Your Journey
          </Badge>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
            Ready to Build Your Future?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg opacity-90 mb-5 sm:mb-7 max-w-xl mx-auto">
            Join thousands of students already learning, competing, and growing with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 sm:px-0">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-sm sm:text-base px-5 sm:px-6 py-3 rounded-xl active:scale-95 transition-transform">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base px-5 sm:px-6 py-3 rounded-xl active:scale-95 transition-transform bg-transparent border-white/30 text-white hover:bg-white/10">
                Learn More About AITD
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

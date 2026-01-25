import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PersonaCard } from "@/components/PersonaCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ProfileCompletionPopup } from "@/components/ProfileCompletionPopup";
import { CoinBadge } from "@/components/CoinBadge";
import { ContributorLeaderboard } from "@/components/ContributorLeaderboard";
import { POINT_VALUES } from "@/hooks/useEarnCoins";
import aitdMascot from "@/assets/aitd-mascot.png";

import { supabase } from "@/integrations/supabase/client";
import {
  Calendar,
  Briefcase,
  GraduationCap,
  Sparkles,
  Users,
  Trophy,
  MessageCircle,
  Target,
  Building,
  Zap,
  ArrowRight,
  BookOpen,
  Star,
  Clock,
  Play,
  CheckCircle2,
  Send,
  Gift,
  Megaphone,
  FileText,
  Rocket,
  TrendingUp,
  Coins,
  QrCode,
  Globe,
  Lightbulb,
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
    students: 0,
    events: 0,
    jobs: 0,
    courses: 0,
    bounties: 0,
    ambassadors: 0,
    colleges: 0,
  });

  useEffect(() => {
    fetchFeaturedCourses();
    fetchHighlightedEvents();
    fetchLatestJobs();
    fetchPlatformStats();
  }, []);

  const fetchHighlightedEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "live")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) throw error;
      setHighlightedEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchLatestJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "live")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) throw error;
      setLatestJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchFeaturedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("status", "live")
        .order("enrolled_count", { ascending: false })
        .limit(3);

      if (error) throw error;
      setFeaturedCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
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
        students: studentsRes.count || 0,
        events: eventsRes.count || 0,
        jobs: jobsRes.count || 0,
        courses: coursesRes.count || 0,
        bounties: bountiesRes.count || 0,
        ambassadors: ambassadorsRes.count || 0,
        colleges: uniqueColleges,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const features = [
    { icon: BookOpen, title: "Courses", link: "/courses", gradient: "from-blue-500 to-cyan-400", coins: POINT_VALUES.COURSE_ENROLL },
    { icon: Trophy, title: "Bounties", link: "/bounties", gradient: "from-emerald-500 to-teal-400", coins: POINT_VALUES.BOUNTY_SUBMIT },
    { icon: Calendar, title: "Events", link: "/events", gradient: "from-orange-500 to-amber-400", coins: POINT_VALUES.EVENT_REGISTER },
    { icon: MessageCircle, title: "Live Chat", link: "/live-chat", gradient: "from-teal-500 to-cyan-400", coins: 0 },
    { icon: Briefcase, title: "Jobs", link: "/jobs", gradient: "from-orange-500 to-amber-400", coins: 0 },
    { icon: FileText, title: "Notes", link: "/study-materials", gradient: "from-blue-500 to-indigo-400", coins: POINT_VALUES.STUDY_MATERIAL_UPLOAD },
    { icon: Target, title: "Practice", link: "/practice", gradient: "from-teal-500 to-emerald-400", coins: 0 },
    { icon: GraduationCap, title: "Scholarships", link: "/scholarships", gradient: "from-cyan-500 to-blue-400", coins: 0 },
  ];

  const personas = [
    {
      icon: GraduationCap,
      title: "Students & Professionals",
      description: "Unlock Your Potential: Compete, Build Resume, Grow and get Hired!",
    },
    {
      icon: Building,
      title: "Companies & Recruiters",
      description: "Discover Right Talent: Hire, Engage, and Brand Like Never Before!",
    },
    {
      icon: Users,
      title: "Colleges & Institutions",
      description: "Bridge Academia and Industry: Empower Students with Real-World Opportunities!",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <ProfileCompletionPopup />
      
      
      {/* Hero Section - Enhanced with Mascot */}
      <section className="relative min-h-[70vh] sm:min-h-[75vh] lg:min-h-[85vh] flex items-center py-8 sm:py-12 lg:py-20 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-background to-orange-100/30 dark:from-orange-950/20 dark:via-background dark:to-orange-900/10" />
        
        {/* Animated decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-2xl animate-float" />
          <div className="absolute top-[5%] right-[10%] w-20 sm:w-32 lg:w-40 h-20 sm:h-32 lg:h-40 bg-gradient-to-br from-orange-500/15 to-red-400/15 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute bottom-[15%] left-[10%] w-24 sm:w-36 lg:w-48 h-24 sm:h-36 lg:h-48 bg-gradient-to-br from-yellow-400/15 to-orange-400/15 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-[20%] right-[5%] w-16 sm:w-28 lg:w-36 h-16 sm:h-28 lg:h-36 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-2xl animate-float" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* Badge with orange theme */}
              <Badge className="mb-4 sm:mb-5 px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30 hover:from-orange-500/30 hover:to-amber-500/30 animate-fade-in-down shadow-sm">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 text-orange-500 animate-pulse" />
                {stats.students > 0 ? `${stats.students.toLocaleString()}+ Students Growing` : "India's #1 Student Platform"}
              </Badge>
              
              {/* Main heading with AITD branding */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-5 animate-fade-in-up leading-tight">
                <span className="text-orange-500">AITD</span>{" "}
                <span className="text-foreground">Events</span>
                <span className="block mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                  <span className="text-foreground">Learn.</span>{" "}
                  <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Earn.</span>{" "}
                  <span className="text-foreground">Grow.</span>
                </span>
              </h1>
              
              {/* Subheading */}
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-in-up stagger-1">
                Join India's fastest-growing platform for students to learn new skills, win bounties & land dream jobs
              </p>

              {/* CTA Buttons with orange theme */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-fade-in-up stagger-2">
              <Link to="/auth" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-8 rounded-xl shadow-lg active:scale-95 transition-transform duration-150 bg-gradient-to-r from-orange-500 to-amber-500 border-0 text-white">
                    <Rocket className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Start Free - Earn Coins
                  </Button>
                </Link>
                <Link to="/bounties" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-8 rounded-xl active:scale-95 transition-transform duration-150 border-2 border-orange-500/50 text-orange-600 dark:text-orange-400">
                    <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Win Money
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6 sm:mt-8 justify-center lg:justify-start animate-fade-in-up stagger-3">
                <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/30 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800/50">
                  <CheckCircle2 className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs sm:text-sm text-orange-700 dark:text-orange-400">100% Free</span>
                </div>
                <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/30 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800/50">
                  <Coins className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs sm:text-sm text-orange-700 dark:text-orange-400">Earn While Learning</span>
                </div>
                <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/30 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800/50">
                  <Globe className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs sm:text-sm text-orange-700 dark:text-orange-400">Pan-India Network</span>
                </div>
              </div>
            </div>

            {/* Right Side - Mascot Image */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end animate-fade-in-up">
              <div className="relative">
                {/* Animated glow effects behind mascot */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/25 to-amber-400/25 rounded-full blur-3xl scale-90 animate-pulse-soft" />
                <div className="absolute inset-4 bg-gradient-to-tr from-amber-300/20 to-orange-500/20 rounded-full blur-2xl scale-75 animate-float" />
                <div className="absolute -inset-4 bg-gradient-to-bl from-orange-300/15 to-yellow-400/15 rounded-full blur-3xl scale-110 animate-float-delayed opacity-60" />
                
                <img 
                  src={aitdMascot} 
                  alt="AITD Events Mascot - A friendly student holding QR code" 
                  className="relative z-10 w-56 sm:w-72 md:w-80 lg:w-96 h-auto drop-shadow-2xl animate-float-slow"
                  loading="eager"
                />
              </div>
            </div>
          </div>
          
          {/* Quick stats row below hero */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 lg:gap-16 mt-10 sm:mt-14 pt-8 border-t border-orange-200/50 dark:border-orange-800/30 animate-fade-in-up stagger-3">
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-500">{stats.students || 0}+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Students</div>
            </div>
            <div className="w-px h-10 bg-orange-200 dark:bg-orange-800/50" />
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-500">{stats.colleges || 0}+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Colleges</div>
            </div>
            <div className="w-px h-10 bg-orange-200 dark:bg-orange-800/50" />
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-500">{stats.jobs || 0}+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Job Openings</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-orange-200 dark:bg-orange-800/50" />
            <div className="hidden sm:block text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-500">{stats.courses || 0}+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Courses</div>
            </div>
          </div>
        </div>
      </section>

      {/* Earning Opportunities Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-2.5 sm:py-3 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center gap-2 sm:gap-4 text-white">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Coins className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
              <span className="font-semibold text-xs sm:text-sm">Earn Coins</span>
            </div>
            <span className="text-white/60 hidden sm:inline">|</span>
            <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs">
              <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                <BookOpen className="h-3 w-3" /> +{POINT_VALUES.COURSE_ENROLL} Enroll
              </span>
              <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                <Trophy className="h-3 w-3" /> +{POINT_VALUES.BOUNTY_SUBMIT} Bounty
              </span>
              <span className="hidden sm:flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                <FileText className="h-3 w-3" /> +{POINT_VALUES.STUDY_MATERIAL_UPLOAD} Upload
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Banner - More compact on mobile */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 py-2 sm:py-3 px-4">
        <div className="container mx-auto flex items-center justify-center gap-2 sm:gap-3 text-white">
          <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse" />
          <span className="font-medium text-xs sm:text-sm">Join Telegram for updates & gifts!</span>
          <a 
            href="https://t.me/aitdevents" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-[10px] sm:text-xs font-medium transition-all hover:scale-105"
          >
            Join →
          </a>
        </div>
      </div>

      {/* Quick Access Features - Mobile Optimized */}
      <section className="py-6 sm:py-10 lg:py-14 px-3 sm:px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-5 sm:mb-8">
            <Badge className="mb-2 text-xs sm:text-sm bg-orange-500/10 text-orange-600 border-orange-500/20">
              <Zap className="w-3 h-3 mr-1" />
              Explore
            </Badge>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1.5 sm:mb-2">
              What do you want to <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">do today?</span>
            </h2>
            <p className="text-[11px] sm:text-sm text-muted-foreground">
              Tap to explore opportunities
            </p>
          </div>

          {/* Mobile: 2x4 grid, Desktop: 1x8 row */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  to={feature.link}
                  className="animate-fade-in-up group"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="relative flex flex-col items-center p-2.5 sm:p-3 lg:p-4 rounded-xl bg-card border border-border/50 hover:border-orange-500/50 active:scale-95 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                    {feature.coins > 0 && (
                      <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                        <Coins className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                        +{feature.coins}
                      </div>
                    )}
                    <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-1.5 sm:mb-2 active:scale-95 transition-all shadow-md group-hover:scale-110 group-hover:shadow-lg`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="font-medium text-[10px] sm:text-xs lg:text-sm text-center leading-tight text-foreground group-hover:text-orange-600 transition-colors">
                      {feature.title}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      {featuredCourses.length > 0 && (
        <section className="py-10 sm:py-14 lg:py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-6 sm:mb-10">
              <Badge className="mb-2 sm:mb-3 text-xs sm:text-sm bg-blue-500/10 text-blue-600 border-blue-500/20">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                Featured Courses
              </Badge>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                Start Learning <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Today</span>
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
                Master new skills with expert-led courses
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8">
              {featuredCourses.map((course, index) => (
                <Link 
                  key={course.id} 
                  to={`/courses/${course.id}`} 
                  className="animate-fade-in-up" 
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden h-full border-border/50">
                    <div className="relative h-36 sm:h-40 lg:h-48 overflow-hidden">
                      <img
                        src={course.thumbnail_url || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 right-3">
                        {course.is_free ? (
                          <Badge className="bg-emerald-500 text-white border-0 text-xs">Free</Badge>
                        ) : (
                          <Badge className="bg-primary text-primary-foreground border-0 text-xs">₹{course.price}</Badge>
                        )}
                      </div>
                      <Badge className="absolute bottom-3 left-3 bg-white/90 text-foreground text-xs">{course.category}</Badge>
                    </div>
                    <CardHeader className="p-3 sm:p-4 pb-2">
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-sm sm:text-base lg:text-lg">
                        {course.title}
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        by {course.instructor_name}
                      </p>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-500 text-yellow-500" />
                          <span className="font-medium">{course.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{course.enrolled_count}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            <div className="text-center">
              <Link to="/courses">
                <Button variant="outline" className="hover:scale-[1.02] transition-all rounded-xl text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
                  View All Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Highlighted Events Section */}
      {highlightedEvents.length > 0 && (
        <section className="py-10 sm:py-14 lg:py-20 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-6 sm:mb-10">
              <Badge className="mb-2 sm:mb-3 text-xs sm:text-sm bg-orange-500/10 text-orange-600 border-orange-500/20">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                Newly Added Events
              </Badge>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                Latest <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Events</span>
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
                Join hackathons, workshops, and competitions
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              {highlightedEvents.map((event, index) => (
                <Link 
                  key={event.id} 
                  to="/events" 
                  className="animate-fade-in-up" 
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden h-full border-border/50 hover:border-orange-500/30">
                    <div className="relative h-28 sm:h-32 lg:h-40 overflow-hidden">
                      {event.poster_url ? (
                        <img
                          src={event.poster_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${
                          index % 4 === 0 ? 'from-orange-500 to-amber-600' : 
                          index % 4 === 1 ? 'from-teal-500 to-cyan-600' :
                          index % 4 === 2 ? 'from-blue-500 to-cyan-600' : 'from-emerald-500 to-teal-600'
                        }`} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        <Badge className="bg-orange-500 text-white border-0 text-[10px] sm:text-xs px-1.5 py-0.5 animate-pulse">New</Badge>
                        {event.is_free && (
                          <Badge className="bg-emerald-500 text-white border-0 text-[10px] sm:text-xs px-1.5 py-0.5">Free</Badge>
                        )}
                        <Badge className="bg-white/90 text-foreground text-[10px] sm:text-xs px-1.5 py-0.5">{event.category}</Badge>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-white font-semibold text-xs sm:text-sm line-clamp-2 drop-shadow-lg">{event.title}</h3>
                      </div>
                    </div>
                    <CardContent className="p-2 sm:p-3">
                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{event.applied_count || 0}</span>
                        </div>
                        {event.days_left !== null && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{event.days_left}d left</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            <div className="text-center">
              <Link to="/events">
                <Button variant="outline" className="hover:scale-[1.02] transition-all rounded-xl text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
                  View All Events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* AITD Hiring Banner - Featured */}
      <section className="py-10 sm:py-14 lg:py-20 px-4 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-[15%] left-[5%] w-40 sm:w-64 h-40 sm:h-64 bg-black/10 rounded-full blur-3xl animate-float-delayed" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left text-white">
              <Badge className="mb-3 sm:mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm animate-pulse">
                <Rocket className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                We Are Hiring!
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                Join AITD Events <span className="opacity-90">Team</span>
              </h2>
              <p className="text-sm sm:text-base lg:text-lg opacity-90 mb-4 sm:mb-6 max-w-xl mx-auto lg:mx-0">
                Be part of our student-driven community! We're looking for passionate students to join multiple exciting roles.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6 max-w-lg mx-auto lg:mx-0">
                {["Graphic Designer", "Video Editor", "Event Manager", "Sponsorship Team", "Marketing & PR", "Community Lead"].map((role) => (
                  <div key={role} className="flex items-center gap-1.5 text-xs sm:text-sm bg-white/15 rounded-full px-3 py-1.5 backdrop-blur-sm border border-white/20">
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{role}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 mb-6 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-2">
                  <Gift className="w-4 h-4" />
                  <span>Free Event Access</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-2">
                  <FileText className="w-4 h-4" />
                  <span>Offer Letter</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Certificate</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a href="https://forms.gle/12yBH78tNfAzhDFm6" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90 text-sm sm:text-base px-5 sm:px-6 py-3 sm:py-4 rounded-xl hover:scale-[1.02] transition-all font-semibold w-full sm:w-auto">
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <Link to="/jobs">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-sm sm:text-base px-5 sm:px-6 py-3 sm:py-4 rounded-xl hover:scale-[1.02] transition-all w-full sm:w-auto">
                    View in Jobs
                    <Briefcase className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative max-w-sm lg:max-w-md">
                <img
                  src="/images/aitd-hiring-2025.png"
                  alt="AITD Events is Hiring - Join our team as Graphic Designer, Video Editor, Event Manager, and more"
                  className="w-full h-auto rounded-2xl shadow-2xl border-4 border-white/20"
                />
                <div className="absolute -bottom-3 -right-3 bg-white text-orange-600 rounded-full px-4 py-2 shadow-lg font-bold text-sm animate-bounce">
                  Limited Seats!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Jobs Section */}
      {latestJobs.length > 0 && (
        <section className="py-10 sm:py-14 lg:py-20 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-6 sm:mb-10">
              <Badge className="mb-2 sm:mb-3 text-xs sm:text-sm bg-orange-500/10 text-orange-600 border-orange-500/20">
                <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                Newly Added Jobs
              </Badge>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                Latest <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Opportunities</span>
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
                Freshly added internships and job openings
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              {latestJobs.map((job, index) => (
                <Link 
                  key={job.id} 
                  to="/jobs" 
                  className="animate-fade-in-up" 
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden h-full border-border/50 hover:border-orange-500/30">
                    <CardHeader className="p-3 sm:p-4 pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-orange-500 text-white border-0 text-[10px] sm:text-xs px-1.5 py-0.5 animate-pulse">New</Badge>
                        <Badge variant="outline" className="text-[10px] sm:text-xs">{job.type}</Badge>
                      </div>
                      <CardTitle className="line-clamp-2 group-hover:text-orange-600 transition-colors text-sm sm:text-base">
                        {job.title}
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                        {job.company}
                      </p>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                      <div className="flex flex-col gap-1 text-[10px] sm:text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span className="font-semibold text-emerald-600">{job.stipend}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            <div className="text-center">
              <Link to="/jobs">
                <Button variant="outline" className="hover:scale-[1.02] transition-all rounded-xl text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
                  View All Jobs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Campus Ambassador Section */}
      <section className="py-10 sm:py-14 lg:py-20 px-4 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-[10%] right-[5%] w-40 sm:w-64 h-40 sm:h-64 bg-white/10 rounded-full blur-3xl animate-float-delayed" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-3 sm:mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                Campus Ambassador Program
              </Badge>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                Represent AITD at Your College
              </h2>
              <p className="text-sm sm:text-base opacity-90 mb-4 sm:mb-6 max-w-lg mx-auto lg:mx-0">
                Join our campus ambassador program and earn rewards while helping fellow students discover opportunities!
              </p>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 max-w-sm mx-auto lg:mx-0">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                    <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span>Earn Upto ₹10,000</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                    <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span>Verified Certificate</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span>Free Event Access</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                    <Megaphone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span>Build Network</span>
                </div>
              </div>

              <a href="https://forms.gle/5hyQgiaEGQ7uBw857" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="secondary" className="text-sm sm:text-base px-5 sm:px-6 py-3 sm:py-4 rounded-xl hover:scale-[1.02] transition-all">
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>

            {/* Stats grid - REAL DATA from database */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              {[
                { value: stats.ambassadors.toString(), label: "Campus Ambassadors" },
                { value: stats.colleges.toString(), label: "Colleges" },
                { value: stats.students.toString(), label: "Students" },
                { value: stats.events.toString(), label: "Events" },
              ].map((stat) => (
                <div key={stat.label} className="p-3 sm:p-4 lg:p-6 bg-white/10 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-white/20">
                  <div className="text-xl sm:text-2xl lg:text-4xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who's Using Section */}
      <section className="py-10 sm:py-14 lg:py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-2 sm:mb-3">
            Who's using <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">AITD</span>?
          </h2>
          <p className="text-center text-muted-foreground mb-6 sm:mb-10 max-w-xl mx-auto text-xs sm:text-sm md:text-base">
            Join thousands of students, companies, and institutions transforming tech education
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {personas.map((persona, index) => (
              <div key={persona.title} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <PersonaCard {...persona} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 sm:py-14 lg:py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-background to-teal-500/5" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-40 sm:w-64 h-40 sm:h-64 bg-orange-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-[20%] right-[10%] w-48 sm:w-80 h-48 sm:h-80 bg-teal-500/10 rounded-full blur-3xl animate-float-delayed" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-2 sm:mb-3 text-xs sm:text-sm bg-orange-500/10 text-orange-600 border-orange-500/20">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
              Growing Community
            </Badge>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
              Join Our <span className="bg-gradient-to-r from-orange-500 to-teal-500 bg-clip-text text-transparent">Community</span>
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-lg mx-auto">
              Thousands of students are already building their future with us
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[
              { value: stats.students, label: "Students", sublabel: "Learning & Growing", color: "text-orange-500" },
              { value: stats.jobs, label: "Jobs", sublabel: "Active Listings", color: "text-teal-500" },
              { value: stats.events, label: "Events", sublabel: "Hackathons & More", color: "text-blue-500" },
              { value: stats.courses, label: "Courses", sublabel: "Expert-Led Content", color: "text-emerald-500" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="text-center p-4 sm:p-5 lg:p-6 rounded-xl lg:rounded-2xl bg-card border border-border/50 hover:border-orange-500/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up cursor-default"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 ${stat.color}`}>
                  {stat.value.toLocaleString()}
                </div>
                <div className="font-medium text-foreground text-sm sm:text-base">{stat.label}</div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{stat.sublabel}</p>
              </div>
            ))}
          </div>

          {/* Contributor Leaderboard */}
          <div className="mt-8 sm:mt-12 max-w-xl mx-auto">
            <ContributorLeaderboard />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-14 lg:py-20 px-4 bg-gradient-to-br from-orange-500 via-amber-500 to-teal-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="container mx-auto relative z-10 text-center">
          <Badge className="mb-3 sm:mb-4 bg-white/20 text-white border-white/30 text-xs sm:text-sm">
            <Rocket className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
            Start Your Journey
          </Badge>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            Ready to Build Your Future?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg opacity-90 mb-6 sm:mb-8 max-w-xl mx-auto">
            Join thousands of students already learning, competing, and growing with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 sm:px-0">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-sm sm:text-base px-5 sm:px-6 py-3 sm:py-4 rounded-xl hover:scale-[1.02] transition-all">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base px-5 sm:px-6 py-3 sm:py-4 rounded-xl hover:scale-[1.02] transition-all bg-transparent border-white/30 text-white hover:bg-white/10">
                Learn More About AITD
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

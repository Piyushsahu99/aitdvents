import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PersonaCard } from "@/components/PersonaCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FloatingTelegram } from "@/components/FloatingTelegram";
import { ProfileCompletionPopup } from "@/components/ProfileCompletionPopup";
import { CoinBadge } from "@/components/CoinBadge";
import { POINT_VALUES } from "@/hooks/useEarnCoins";

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
}

interface PlatformStats {
  students: number;
  events: number;
  jobs: number;
  courses: number;
}

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [highlightedEvents, setHighlightedEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    students: 0,
    events: 0,
    jobs: 0,
    courses: 0,
  });

  useEffect(() => {
    fetchFeaturedCourses();
    fetchHighlightedEvents();
    fetchPlatformStats();
  }, []);

  const fetchHighlightedEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "live")
        .order("applied_count", { ascending: false })
        .limit(4);

      if (error) throw error;
      setHighlightedEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
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
      const [studentsRes, eventsRes, jobsRes, coursesRes] = await Promise.all([
        supabase.from("student_profiles").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "live"),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "live"),
        supabase.from("courses").select("id", { count: "exact", head: true }).eq("status", "live"),
      ]);

      setStats({
        students: studentsRes.count || 0,
        events: eventsRes.count || 0,
        jobs: jobsRes.count || 0,
        courses: coursesRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const features = [
    { icon: BookOpen, title: "Courses", link: "/courses", gradient: "from-blue-500 to-cyan-400", coins: POINT_VALUES.COURSE_ENROLL },
    { icon: Trophy, title: "Bounties", link: "/bounties", gradient: "from-emerald-500 to-teal-400", coins: POINT_VALUES.BOUNTY_SUBMIT },
    { icon: Calendar, title: "Events", link: "/events", gradient: "from-violet-500 to-purple-400", coins: POINT_VALUES.EVENT_REGISTER },
    { icon: FileText, title: "Study Materials", link: "/study-materials", gradient: "from-indigo-500 to-violet-400", coins: POINT_VALUES.STUDY_MATERIAL_UPLOAD },
    { icon: Briefcase, title: "Jobs", link: "/jobs", gradient: "from-orange-500 to-amber-400", coins: 0 },
    { icon: MessageCircle, title: "Mentors", link: "/mentorship", gradient: "from-yellow-500 to-orange-400", coins: 0 },
    { icon: Target, title: "Practice", link: "/practice", gradient: "from-pink-500 to-rose-400", coins: 0 },
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
      <FloatingTelegram />
      
      {/* Hero Section - Student Focused Mobile First */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh] flex items-center py-6 sm:py-10 lg:py-16 px-4 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-background to-pink-500/10" />
        
        {/* Animated orbs - smaller on mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[5%] left-[5%] w-24 sm:w-40 lg:w-56 h-24 sm:h-40 lg:h-56 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-[15%] right-[5%] w-28 sm:w-48 lg:w-72 h-28 sm:h-48 lg:h-72 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute bottom-[10%] left-[15%] w-20 sm:w-36 lg:w-56 h-20 sm:h-36 lg:h-56 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-float-slow" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Animated student count badge */}
            <Badge className="mb-3 sm:mb-5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-violet-500/20 to-pink-500/20 text-foreground border-violet-500/30 hover:from-violet-500/30 hover:to-pink-500/30 animate-fade-in-down shadow-sm">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 text-violet-500 animate-pulse" />
              {stats.students > 0 ? `${stats.students.toLocaleString()}+ Students Growing` : "Join Our Community"}
            </Badge>
            
            {/* Main heading - optimized for mobile */}
            <h1 className="text-[1.75rem] leading-[1.2] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-5 animate-fade-in-up">
              <span className="block sm:inline">Learn.</span>{" "}
              <span className="block sm:inline text-gradient-primary">Earn.</span>{" "}
              <span className="block sm:inline">Grow.</span>
            </h1>
            
            {/* Subheading - mobile optimized */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-5 sm:mb-7 leading-relaxed max-w-xl mx-auto px-1 animate-fade-in-up stagger-1">
              India's #1 platform for students to learn skills, win bounties & land dream jobs
            </p>

            {/* Mobile-first CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center animate-fade-in-up stagger-2">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 border-0">
                  <Rocket className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-bounce" />
                  Start Free - Earn Coins
                </Button>
              </Link>
              <Link to="/bounties" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-8 rounded-xl hover:scale-[1.02] transition-all border-2 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500">
                  <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Win Money
                </Button>
              </Link>
            </div>

            {/* Quick stats for mobile - compact row */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 mt-5 sm:mt-7 animate-fade-in-up stagger-3">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-primary">{stats.courses || 50}+</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Courses</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-emerald-500">₹10K+</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">In Bounties</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-violet-500">{stats.jobs || 25}+</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Jobs</div>
              </div>
            </div>

            {/* Trust indicators - simplified for mobile */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 sm:mt-6 justify-center text-[10px] sm:text-xs text-muted-foreground animate-fade-in-up stagger-3">
              <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>Earn While Learning</span>
              </div>
              <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>Real Opportunities</span>
              </div>
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
            <Badge className="mb-2 text-xs sm:text-sm bg-violet-500/10 text-violet-600 border-violet-500/20">
              <Zap className="w-3 h-3 mr-1" />
              Explore
            </Badge>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1.5 sm:mb-2">
              What do you want to <span className="text-gradient-primary">do today?</span>
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
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="relative flex flex-col items-center p-2.5 sm:p-3 lg:p-4 rounded-xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300 active:scale-95 hover:-translate-y-1">
                    {feature.coins > 0 && (
                      <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                        <Coins className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                        +{feature.coins}
                      </div>
                    )}
                    <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-1.5 sm:mb-2 group-hover:scale-110 group-active:scale-95 transition-transform shadow-md`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="font-medium text-[10px] sm:text-xs lg:text-sm text-center leading-tight text-foreground">
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
                Start Learning <span className="text-gradient-primary">Today</span>
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
              <Badge className="mb-2 sm:mb-3 text-xs sm:text-sm bg-violet-500/10 text-violet-600 border-violet-500/20">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                Trending Events
              </Badge>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                Don't Miss <span className="text-gradient-primary">These Events</span>
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
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden h-full border-border/50">
                    <div className="relative h-28 sm:h-32 lg:h-40 overflow-hidden">
                      {event.poster_url ? (
                        <img
                          src={event.poster_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${
                          index % 4 === 0 ? 'from-violet-500 to-purple-600' : 
                          index % 4 === 1 ? 'from-pink-500 to-rose-600' :
                          index % 4 === 2 ? 'from-blue-500 to-cyan-600' : 'from-emerald-500 to-teal-600'
                        }`} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
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

      {/* Campus Ambassador Section */}
      <section className="py-10 sm:py-14 lg:py-20 px-4 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
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
                    <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span>Exclusive Goodies</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                    <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span>Cash Rewards</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                    <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span>Certificates</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                    <Megaphone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span>Build Network</span>
                </div>
              </div>

              <Link to="/campus-ambassador">
                <Button size="lg" variant="secondary" className="text-sm sm:text-base px-5 sm:px-6 py-3 sm:py-4 rounded-xl hover:scale-[1.02] transition-all">
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Stats grid - visible on all screens */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              {[
                { value: "500+", label: "Campus Ambassadors" },
                { value: "100+", label: "Colleges" },
                { value: "₹50K+", label: "Rewards Given" },
                { value: "20+", label: "Cities" },
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
            Who's using <span className="text-gradient-primary">AITD</span>?
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-40 sm:w-64 h-40 sm:h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-[20%] right-[10%] w-48 sm:w-80 h-48 sm:h-80 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-2 sm:mb-3 text-xs sm:text-sm bg-primary/10 text-primary border-primary/20">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
              Growing Community
            </Badge>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
              Join Our <span className="text-gradient-primary">Community</span>
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-lg mx-auto">
              Thousands of students are already building their future with us
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[
              { value: stats.students, label: "Students", sublabel: "Learning & Growing", color: "text-primary" },
              { value: stats.jobs, label: "Jobs", sublabel: "Active Listings", color: "text-accent" },
              { value: stats.events, label: "Events", sublabel: "Hackathons & More", color: "text-blue-500" },
              { value: stats.courses, label: "Courses", sublabel: "Expert-Led Content", color: "text-emerald-500" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="text-center p-4 sm:p-5 lg:p-6 rounded-xl lg:rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 ${stat.color}`}>
                  {stat.value.toLocaleString()}+
                </div>
                <div className="font-medium text-foreground text-sm sm:text-base">{stat.label}</div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-14 lg:py-20 px-4 bg-gradient-to-br from-primary via-primary/90 to-accent text-white relative overflow-hidden">
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
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

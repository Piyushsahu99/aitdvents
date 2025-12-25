import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PersonaCard } from "@/components/PersonaCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FloatingTelegram } from "@/components/FloatingTelegram";

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
    { icon: BookOpen, title: "Courses", link: "/courses", gradient: "from-blue-500 to-cyan-400" },
    { icon: Trophy, title: "Bounties", link: "/bounties", gradient: "from-emerald-500 to-teal-400" },
    { icon: Calendar, title: "Events", link: "/events", gradient: "from-violet-500 to-purple-400" },
    { icon: Briefcase, title: "Jobs", link: "/jobs", gradient: "from-orange-500 to-amber-400" },
    { icon: MessageCircle, title: "Mentors", link: "/mentorship", gradient: "from-yellow-500 to-orange-400" },
    { icon: Target, title: "Practice", link: "/practice", gradient: "from-pink-500 to-rose-400" },
    { icon: GraduationCap, title: "Scholarships", link: "/scholarships", gradient: "from-cyan-500 to-blue-400" },
    { icon: FileText, title: "Study Materials", link: "/study-materials", gradient: "from-indigo-500 to-violet-400" },
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
      <FloatingTelegram />
      
      {/* Hero Section - Optimized for all devices */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] lg:min-h-[85vh] flex items-center py-8 sm:py-12 lg:py-16 px-4 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-primary/15 rounded-full blur-3xl animate-float" />
          <div className="absolute top-[20%] right-[5%] w-40 sm:w-56 lg:w-80 h-40 sm:h-56 lg:h-80 bg-accent/15 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute bottom-[15%] left-[20%] w-36 sm:w-52 lg:w-72 h-36 sm:h-52 lg:h-72 bg-blue-500/10 rounded-full blur-3xl animate-float-slow" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Student count badge */}
            {stats.students > 0 && (
              <Badge className="mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 animate-fade-in-down">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                Join {stats.students.toLocaleString()}+ Students
              </Badge>
            )}
            
            {/* Main heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight animate-fade-in-up">
              Your Career Journey{" "}
              <span className="text-gradient-primary">Starts Here</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto px-2 animate-fade-in-up stagger-1">
              Learn skills, earn money, win competitions & land your dream job — all in one platform built for students.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0 animate-fade-in-up stagger-2">
              <Link to="/courses" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base px-5 sm:px-6 py-4 sm:py-5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group bg-primary hover:bg-primary/90">
                  <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Start Learning Free
                </Button>
              </Link>
              <Link to="/events" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base px-5 sm:px-6 py-4 sm:py-5 rounded-xl hover:scale-[1.02] transition-all border-border hover:border-primary/50 hover:bg-primary/5">
                  Explore Opportunities
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-6 sm:mt-8 justify-center text-xs sm:text-sm text-muted-foreground animate-fade-in-up stagger-3">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>100% Free to Start</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Community Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Telegram Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 py-3 sm:py-4 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-white">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
            <span className="font-medium text-sm sm:text-base">Join our Telegram for daily updates!</span>
          </div>
          <a 
            href="https://t.me/aitdevents" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 rounded-full text-xs sm:text-sm font-medium transition-all hover:scale-105"
          >
            Join Now →
          </a>
        </div>
      </div>

      {/* Quick Access Features */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-6 sm:mb-10">
            <Badge className="mb-2 sm:mb-3 text-xs sm:text-sm bg-primary/10 text-primary border-primary/20">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
              Quick Access
            </Badge>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
              Everything You Need in <span className="text-gradient-primary">One Place</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
              From learning to earning, we've got all your career needs covered
            </p>
          </div>

          <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 lg:gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  to={feature.link}
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex flex-col items-center p-2 sm:p-3 lg:p-4 rounded-xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className={`p-2 sm:p-2.5 lg:p-3 rounded-lg bg-gradient-to-br ${feature.gradient} text-white mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform shadow-sm`}>
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
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

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import { PersonaCard } from "@/components/PersonaCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FloatingTelegram } from "@/components/FloatingTelegram";

import { supabase } from "@/integrations/supabase/client";
import {
  Calendar,
  Briefcase,
  Code,
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
} from "lucide-react";
import heroImage from "@/assets/hero-collaboration.jpg";
import internshipImage from "@/assets/internship-card.jpg";
import mentorshipImage from "@/assets/mentorship-card.jpg";
import practiceImage from "@/assets/practice-card.jpg";

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
    {
      icon: BookOpen,
      title: "Courses",
      subtitle: "Learn New Skills",
      link: "/courses",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Trophy,
      title: "Bounties",
      subtitle: "Earn Money",
      link: "/bounties",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Calendar,
      title: "Events",
      subtitle: "Hackathons",
      link: "/events",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: Briefcase,
      title: "Jobs",
      subtitle: "Careers",
      link: "/jobs",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      icon: MessageCircle,
      title: "Mentorship",
      subtitle: "Learn From Experts",
      link: "/mentorship",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Target,
      title: "Practice",
      subtitle: "Build Skills",
      link: "/practice",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: GraduationCap,
      title: "Scholarships",
      subtitle: "Get Funded",
      link: "/scholarships",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: Users,
      title: "Network",
      subtitle: "Connect",
      link: "/network",
      gradient: "from-purple-500 to-violet-500",
    },
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
    <div className="min-h-screen">
      <FloatingTelegram />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center py-20 px-4 overflow-hidden bg-mesh">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float-slow" />
        </div>
        
        {/* Background Image Overlay */}
        <div className="absolute inset-0 opacity-5">
          <img 
            src={heroImage} 
            alt="Students collaborating" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {stats.students > 0 && (
                <Badge className="mb-6 px-4 py-2 text-sm animate-fade-in-down bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Join {stats.students.toLocaleString()}+ Students
                </Badge>
              )}
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
                Build Your Future,{" "}
                <span className="text-gradient-primary animate-gradient bg-[length:200%_200%]">
                  One Skill at a Time
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fade-in-up stagger-1">
                Learn, compete, earn, and connect. Everything you need to launch your dream tech career in one platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up stagger-2">
                <Link to="/courses">
                  <Button size="lg" className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 group">
                    <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Start Learning Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/events">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl hover:scale-105 transition-all">
                    Explore Opportunities
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 mt-10 justify-center lg:justify-start text-sm text-muted-foreground animate-fade-in-up stagger-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>100% Free to Start</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>No Credit Card Required</span>
                </div>
              </div>
            </div>

            {/* Right Content - Feature Cards Grid */}
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <Link to="/jobs" className="group animate-fade-in-up stagger-1">
                <div className="relative h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500 p-5 text-white hover-lift cursor-pointer">
                  <img src={internshipImage} alt="Jobs" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity" loading="lazy" />
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="p-2 bg-white/20 rounded-xl w-fit mb-auto">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Jobs</h3>
                      <p className="text-sm opacity-90">Explore Careers</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link to="/mentorship" className="group animate-fade-in-up stagger-2">
                <div className="relative h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 p-5 text-white hover-lift cursor-pointer">
                  <img src={mentorshipImage} alt="Mentorships" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity" loading="lazy" />
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="p-2 bg-white/20 rounded-xl w-fit mb-auto">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Mentorship</h3>
                      <p className="text-sm opacity-90">Expert Guidance</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/practice" className="group animate-fade-in-up stagger-3">
                <div className="relative h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-500 to-purple-500 p-5 text-white hover-lift cursor-pointer">
                  <img src={practiceImage} alt="Practice" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity" loading="lazy" />
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="p-2 bg-white/20 rounded-xl w-fit mb-auto">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Practice</h3>
                      <p className="text-sm opacity-90">Build Skills</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/events" className="group animate-fade-in-up stagger-4">
                <div className="relative h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-500 to-rose-500 p-5 text-white hover-lift cursor-pointer">
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="p-2 bg-white/20 rounded-xl w-fit mb-auto">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Competitions</h3>
                      <p className="text-sm opacity-90">Win Prizes</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Quick Access
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need in <span className="text-gradient-primary">One Place</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From learning to earning, we've got all your career development needs covered
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  to={feature.link}
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex flex-col items-center p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-sm text-center">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground text-center mt-1">{feature.subtitle}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      {featuredCourses.length > 0 && (
        <section className="py-20 px-4 bg-mesh">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4">
                <BookOpen className="w-4 h-4 mr-2" />
                Featured Courses
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Start Learning <span className="text-gradient-primary">Today</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Master new skills with our expert-led courses designed for your success
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {featuredCourses.map((course, index) => (
                <Link key={course.id} to={`/courses/${course.id}`} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden h-full border-border/50">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={course.thumbnail_url || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 right-4">
                        {course.is_free ? (
                          <Badge className="bg-emerald-500 text-white border-0">Free</Badge>
                        ) : (
                          <Badge className="bg-primary text-primary-foreground border-0">${course.price}</Badge>
                        )}
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <Badge variant="secondary" className="bg-white/90 text-foreground">{course.category}</Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-lg">
                        {course.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        by {course.instructor_name}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          <span className="font-semibold">{course.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
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
                <Button size="lg" variant="outline" className="hover:scale-105 transition-all rounded-xl">
                  View All Courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Highlighted Events Section */}
      {highlightedEvents.length > 0 && (
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Trending Events
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Don't Miss <span className="text-gradient-primary">These Events</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join hackathons, workshops, and competitions happening right now
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {highlightedEvents.map((event, index) => (
                <Link key={event.id} to="/events" className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden h-full border-border/50">
                    <div className="relative h-40 overflow-hidden">
                      {event.poster_url ? (
                        <img
                          src={event.poster_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${
                          index % 2 === 0 ? 'from-violet-500 to-purple-600' : 'from-pink-500 to-rose-600'
                        }`} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {event.is_free && (
                          <Badge className="bg-emerald-500 text-white border-0 text-xs">Free</Badge>
                        )}
                        <Badge variant="secondary" className="bg-white/90 text-foreground text-xs">{event.category}</Badge>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-white font-bold text-sm line-clamp-2 drop-shadow-lg">{event.title}</h3>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{event.applied_count || 0} joined</span>
                        </div>
                        {event.days_left !== null && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
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
                <Button size="lg" variant="outline" className="hover:scale-105 transition-all rounded-xl">
                  View All Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Who's Using Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Who's using <span className="text-gradient-primary">AITD</span>?
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of students, companies, and institutions transforming tech education
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {personas.map((persona, index) => (
              <div key={persona.title} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <PersonaCard {...persona} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 bg-mesh relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Our Growing <span className="text-gradient-primary">Community</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Thousands of students are already building their future with us
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: stats.students, label: "Registered Students", sublabel: "Learning & Growing", color: "primary" },
              { value: stats.jobs, label: "Job Opportunities", sublabel: "Active Listings", color: "accent" },
              { value: stats.events, label: "Live Events", sublabel: "Hackathons & Workshops", color: "primary" },
              { value: stats.courses, label: "Courses", sublabel: "Expert-Led Content", color: "accent" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="text-center group cursor-pointer p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`text-4xl md:text-5xl font-bold mb-2 ${stat.color === 'primary' ? 'text-primary' : 'text-accent'}`}>
                  {stat.value.toLocaleString()}
                </div>
                <div className="font-semibold text-foreground">{stat.label}</div>
                <p className="text-sm text-muted-foreground mt-1">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary to-accent text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-10" />
        <div className="container mx-auto relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of students already learning, competing, and growing with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 rounded-xl hover:scale-105 transition-all">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl hover:scale-105 transition-all bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

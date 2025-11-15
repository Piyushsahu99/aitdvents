import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import { PersonaCard } from "@/components/PersonaCard";
import { TrustBadge } from "@/components/TrustBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

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

  const features = [
    {
      icon: BookOpen,
      title: "Courses",
      subtitle: "Learn New Skills",
      link: "/courses",
      gradient: "bg-gradient-courses",
    },
    {
      icon: Trophy,
      title: "Bounties",
      subtitle: "Earn Money Doing Tasks",
      link: "/bounties",
      gradient: "bg-gradient-bounties",
    },
    {
      icon: Calendar,
      title: "Events",
      subtitle: "Hackathons & Workshops",
      link: "/events",
      gradient: "bg-gradient-events",
    },
    {
      icon: Briefcase,
      title: "Jobs",
      subtitle: "Career Opportunities",
      link: "/jobs",
      gradient: "bg-gradient-jobs",
    },
    {
      icon: MessageCircle,
      title: "Mentorship",
      subtitle: "Learn From Experts",
      link: "/mentorship",
      gradient: "bg-gradient-mentorship",
    },
    {
      icon: Target,
      title: "Practice",
      subtitle: "Skill Development",
      link: "/practice",
      gradient: "bg-gradient-practice",
    },
    {
      icon: GraduationCap,
      title: "Scholarships",
      subtitle: "Financial Support",
      link: "/scholarships",
      gradient: "bg-gradient-scholarships",
    },
    {
      icon: Users,
      title: "Network",
      subtitle: "Connect With Peers",
      link: "/network",
      gradient: "bg-gradient-network",
    },
  ];

  const personas = [
    {
      icon: GraduationCap,
      title: "Students and Professionals",
      description: "Unlock Your Potential: Compete, Build Resume, Grow and get Hired!",
    },
    {
      icon: Building,
      title: "Companies and Recruiters",
      description: "Discover Right Talent: Hire, Engage, and Brand Like Never Before!",
    },
    {
      icon: Users,
      title: "Colleges and Institutions",
      description: "Bridge Academia and Industry: Empower Students with Real-World Opportunities!",
    },
  ];

  const companies = [
    "Google", "Microsoft", "Amazon", "Flipkart", "Walmart", 
    "TCS", "Infosys", "Wipro", "Cognizant", "Accenture"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/5">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-10">
          <img 
            src={heroImage} 
            alt="Students collaborating" 
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="animate-fade-in text-center lg:text-left">
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 animate-pulse text-base px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                Trusted by 10,000+ Students
              </Badge>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Build Your Future,{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                  One Skill at a Time
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-6 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Learn, compete, earn, and connect. Everything you need to launch your dream tech career in one platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/courses" className="w-full sm:w-auto">
                  <Button size="lg" className="text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full px-8 py-6">
                    Start Learning Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/events" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="text-lg hover:scale-105 transition-all w-full px-8 py-6">
                    Explore Opportunities
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Content - Feature Cards in Colorful Layout */}
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <Link to="/jobs" className="group">
                <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 p-6 text-white hover-lift cursor-pointer">
                  <img src={internshipImage} alt="Internships" className="absolute inset-0 w-full h-full object-cover opacity-30" loading="lazy" decoding="async" />
                  <div className="relative z-10">
                    <Briefcase className="h-8 w-8 mb-2" />
                    <h3 className="font-bold text-lg">Jobs</h3>
                    <p className="text-sm opacity-90">Explore Diverse Careers</p>
                  </div>
                </div>
              </Link>
              
              <Link to="/mentorship" className="group">
                <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 p-6 text-white hover-lift cursor-pointer">
                  <img src={mentorshipImage} alt="Mentorships" className="absolute inset-0 w-full h-full object-cover opacity-30" loading="lazy" decoding="async" />
                  <div className="relative z-10">
                    <MessageCircle className="h-8 w-8 mb-2" />
                    <h3 className="font-bold text-lg">Mentorships</h3>
                    <p className="text-sm opacity-90">Guidance From Top Mentors</p>
                  </div>
                </div>
              </Link>

              <Link to="/practice" className="group">
                <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-400 to-purple-600 p-6 text-white hover-lift cursor-pointer">
                  <img src={practiceImage} alt="Practice" className="absolute inset-0 w-full h-full object-cover opacity-30" loading="lazy" decoding="async" />
                  <div className="relative z-10">
                    <Target className="h-8 w-8 mb-2" />
                    <h3 className="font-bold text-lg">Practice</h3>
                    <p className="text-sm opacity-90">Refine Skills Daily</p>
                  </div>
                </div>
              </Link>

              <Link to="/events" className="group">
                <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 text-white hover-lift cursor-pointer">
                  <Calendar className="h-8 w-8 mb-2" />
                  <h3 className="font-bold text-lg">Competitions</h3>
                  <p className="text-sm opacity-90">Battle For Excellence</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Access Cards moved to its own section below for better contrast */}
        </div>
      </section>


      {/* Featured Courses Section */}
      {featuredCourses.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4">
                <BookOpen className="w-4 h-4 mr-2" />
                Featured Courses
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Start Learning Today
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Master new skills with our expert-led courses designed for your success
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {featuredCourses.map((course) => (
                <Link key={course.id} to={`/courses/${course.id}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={course.thumbnail_url || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute top-4 right-4">
                        {course.is_free ? (
                          <Badge className="bg-green-500">Free</Badge>
                        ) : (
                          <Badge className="bg-primary">${course.price}</Badge>
                        )}
                      </div>
                    </div>
                    <CardHeader>
                      <Badge className="w-fit mb-2">{course.category}</Badge>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
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
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{course.enrolled_count} students</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center">
              <Link to="/courses">
                <Button size="lg" variant="outline" className="hover:scale-105 transition-all">
                  View All Courses
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
            Who's using AITD?
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of students, companies, and institutions transforming tech education
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {personas.map((persona) => (
              <PersonaCard key={persona.title} {...persona} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">
            Industry veterans <span className="text-primary">Trust us</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {companies.map((company) => (
              <TrustBadge key={company} name={company} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with 3D Effect */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Our Growing <span className="text-primary">Community</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Thousands of students are already building their future with us
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group cursor-pointer transform transition-all duration-300 hover:scale-110 p-6 rounded-2xl hover:bg-background/50 backdrop-blur-sm">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                50K+
              </div>
              <div className="text-muted-foreground font-semibold text-lg">Active Students</div>
              <p className="text-sm text-muted-foreground/70 mt-2">Learning & Growing</p>
            </div>
            <div className="text-center group cursor-pointer transform transition-all duration-300 hover:scale-110 p-6 rounded-2xl hover:bg-background/50 backdrop-blur-sm">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-accent to-accent/60 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                500+
              </div>
              <div className="text-muted-foreground font-semibold text-lg">Partner Companies</div>
              <p className="text-sm text-muted-foreground/70 mt-2">Hiring Talent</p>
            </div>
            <div className="text-center group cursor-pointer transform transition-all duration-300 hover:scale-110 p-6 rounded-2xl hover:bg-background/50 backdrop-blur-sm">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                1000+
              </div>
              <div className="text-muted-foreground font-semibold text-lg">Events Hosted</div>
              <p className="text-sm text-muted-foreground/70 mt-2">Hackathons & Workshops</p>
            </div>
            <div className="text-center group cursor-pointer transform transition-all duration-300 hover:scale-110 p-6 rounded-2xl hover:bg-background/50 backdrop-blur-sm">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-accent to-primary bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                200+
              </div>
              <div className="text-muted-foreground font-semibold text-lg">Expert Mentors</div>
              <p className="text-sm text-muted-foreground/70 mt-2">Industry Veterans</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with 3D Effect */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 animate-gradient" 
             style={{ backgroundSize: '200% 200%' }} />
        
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-border/50 transform hover:scale-105 transition-all duration-500"
               style={{ transformStyle: 'preserve-3d' }}>
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 text-base px-6 py-2 animate-pulse">
              <Star className="h-4 w-4 mr-2 fill-primary" />
              Limited Spots Available
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of students who are already building their future with cutting-edge skills and real-world experience
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg hover:scale-110 transition-all shadow-xl hover:shadow-2xl px-8 py-6 group" asChild>
                <Link to="/auth">
                  <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Start Your Journey Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg hover:scale-110 transition-all px-8 py-6" asChild>
                <Link to="/courses">
                  Browse Courses
                </Link>
              </Button>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>100% Free to Start</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span>No Credit Card Required</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

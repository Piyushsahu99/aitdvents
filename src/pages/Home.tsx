import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import { PersonaCard } from "@/components/PersonaCard";
import { TrustBadge } from "@/components/TrustBadge";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import heroImage from "@/assets/hero-collaboration.jpg";
import internshipImage from "@/assets/internship-card.jpg";
import mentorshipImage from "@/assets/mentorship-card.jpg";
import practiceImage from "@/assets/practice-card.jpg";

export default function Home() {
  const features = [
    {
      icon: Trophy,
      title: "Bounties",
      subtitle: "Earn Money Doing Tasks",
      link: "/bounties",
      gradient: "bg-[image:var(--gradient-primary)]",
    },
    {
      icon: Calendar,
      title: "Events",
      subtitle: "Hackathons & Workshops",
      link: "/events",
      gradient: "bg-[image:var(--gradient-competitions)]",
    },
    {
      icon: Briefcase,
      title: "Jobs",
      subtitle: "Career Opportunities",
      link: "/jobs",
      gradient: "bg-[image:var(--gradient-jobs)]",
    },
    {
      icon: MessageCircle,
      title: "Mentorship",
      subtitle: "Learn From Experts",
      link: "/mentorship",
      gradient: "bg-[image:var(--gradient-mentorship)]",
    },
    {
      icon: Target,
      title: "Practice",
      subtitle: "Skill Development",
      link: "/practice",
      gradient: "bg-[image:var(--gradient-practice)]",
    },
    {
      icon: GraduationCap,
      title: "Scholarships",
      subtitle: "Financial Support",
      link: "/scholarships",
      gradient: "bg-primary",
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
      <section className="relative py-16 md:py-24 px-4 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/5">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-10">
          <img 
            src={heroImage} 
            alt="Students collaborating" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                Trusted by 10,000+ Students
              </Badge>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Unlock Your{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                  Career
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Explore opportunities from across the globe to grow, showcase skills, gain CV points & get hired by your dream company.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="text-lg shadow-lg hover:shadow-xl transition-shadow">
                  <Link to="/events">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg">
                  <Link to="/mentorship">Find a Mentor</Link>
                </Button>
              </div>
            </div>

            {/* Right Content - Feature Cards in Colorful Layout */}
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <Link to="/jobs" className="group">
                <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 p-6 text-white hover-lift cursor-pointer">
                  <img src={internshipImage} alt="Internships" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
                  <div className="relative z-10">
                    <Briefcase className="h-8 w-8 mb-2" />
                    <h3 className="font-bold text-lg">Jobs</h3>
                    <p className="text-sm opacity-90">Explore Diverse Careers</p>
                  </div>
                </div>
              </Link>
              
              <Link to="/mentorship" className="group">
                <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 p-6 text-white hover-lift cursor-pointer">
                  <img src={mentorshipImage} alt="Mentorships" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
                  <div className="relative z-10">
                    <MessageCircle className="h-8 w-8 mb-2" />
                    <h3 className="font-bold text-lg">Mentorships</h3>
                    <p className="text-sm opacity-90">Guidance From Top Mentors</p>
                  </div>
                </div>
              </Link>

              <Link to="/practice" className="group">
                <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-400 to-purple-600 p-6 text-white hover-lift cursor-pointer">
                  <img src={practiceImage} alt="Practice" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
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

          {/* Feature Cards Grid - Below Hero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-16">
            {features.map((feature, index) => (
              <div key={feature.title} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">Events</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">200+</div>
              <div className="text-muted-foreground">Mentors</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already building their future with AITD Events
          </p>
          <Button size="lg" asChild className="text-lg">
            <Link to="/events">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

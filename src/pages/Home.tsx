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

export default function Home() {
  const features = [
    {
      icon: Briefcase,
      title: "Internships",
      subtitle: "Gain Practical Experience",
      link: "/jobs",
      gradient: "bg-[image:var(--gradient-internship)]",
    },
    {
      icon: Briefcase,
      title: "Jobs",
      subtitle: "Explore Diverse Careers",
      link: "/jobs",
      gradient: "bg-[image:var(--gradient-jobs)]",
    },
    {
      icon: Trophy,
      title: "Competitions",
      subtitle: "Battle For Excellence",
      link: "/events",
      gradient: "bg-[image:var(--gradient-competitions)]",
    },
    {
      icon: MessageCircle,
      title: "Mentorships",
      subtitle: "Guidance From Top Mentors",
      link: "/mentorship",
      gradient: "bg-[image:var(--gradient-mentorship)]",
    },
    {
      icon: Target,
      title: "Practice",
      subtitle: "Refine Skills Daily",
      link: "/practice",
      gradient: "bg-[image:var(--gradient-practice)]",
    },
    {
      icon: Code,
      title: "Freelance",
      subtitle: "Work on Real Projects",
      link: "/tasks",
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
      <section className="relative py-16 md:py-24 px-4 overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto">
          <div className="max-w-2xl mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              <Zap className="h-3 w-3 mr-1" />
              Trusted by 10,000+ Students
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Unlock Your{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Career
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Explore opportunities from across the globe to grow, showcase skills, gain CV points & get hired by your dream company.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="text-lg">
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

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
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

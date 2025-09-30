import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Briefcase, Code, GraduationCap, Sparkles, Users } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Calendar,
      title: "Events & Hackathons",
      description: "Discover and participate in tech events across India",
      link: "/events",
    },
    {
      icon: Briefcase,
      title: "Jobs & Internships",
      description: "Find opportunities at top companies",
      link: "/jobs",
    },
    {
      icon: Code,
      title: "Freelance Tasks",
      description: "Earn by working on short-term projects",
      link: "/tasks",
    },
    {
      icon: GraduationCap,
      title: "Alumni Network",
      description: "Connect with successful alumni",
      link: "/alumni",
    },
    {
      icon: Sparkles,
      title: "AI Tools Library",
      description: "Explore cutting-edge AI tools",
      link: "/ai-tools",
    },
    {
      icon: Users,
      title: "Sponsors",
      description: "Partner with us for events",
      link: "/sponsors",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-10"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Empowering Indian Tech Students
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Your one-stop platform for events, opportunities, and growth in tech
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/events">Explore Events</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/ai-chat">Try AI Assistant</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.title}
                to={feature.link}
                className="group p-6 bg-card rounded-lg border border-border hover:shadow-[var(--shadow-hover)] transition-all hover:scale-105"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students building their future in tech
          </p>
          <Button size="lg" asChild>
            <Link to="/events">Join Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

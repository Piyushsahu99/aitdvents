import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Target, 
  Rocket, 
  Users, 
  Trophy, 
  GraduationCap, 
  Building,
  Zap,
  Globe,
  TrendingUp,
  Award,
  Lightbulb,
  Heart
} from "lucide-react";

export default function About() {
  const stats = [
    { label: "Active Students", value: "50K+", icon: Users },
    { label: "Partner Companies", value: "500+", icon: Building },
    { label: "Opportunities Posted", value: "10K+", icon: Rocket },
    { label: "Success Stories", value: "2K+", icon: Trophy },
  ];

  const steps = [
    {
      number: "01",
      title: "Discover",
      description: "Browse thousands of opportunities - internships, hackathons, competitions, and scholarships curated for Indian students",
      icon: Globe,
    },
    {
      number: "02",
      title: "Apply & Compete",
      description: "Submit applications, participate in events, complete challenges, and showcase your skills to top companies",
      icon: Target,
    },
    {
      number: "03",
      title: "Learn & Grow",
      description: "Access mentorship, practice coding challenges, attend workshops, and build your portfolio with real projects",
      icon: TrendingUp,
    },
    {
      number: "04",
      title: "Get Hired",
      description: "Land your dream internship or job with verified credentials, project experience, and direct company connections",
      icon: Award,
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Student-First",
      description: "Every feature, every opportunity is designed with student success in mind",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Leveraging AI and modern tech to make opportunity discovery seamless",
    },
    {
      icon: Users,
      title: "Community",
      description: "Building a thriving ecosystem of students, alumni, mentors, and companies",
    },
    {
      icon: Trophy,
      title: "Excellence",
      description: "Promoting quality opportunities and recognizing outstanding talent",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 px-4 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 md:mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-base md:text-lg px-4 md:px-6 py-1.5 md:py-2">
            <Zap className="h-3 w-3 md:h-4 md:w-4 mr-2" />
            About AITD Events
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight px-2">
            WHERE{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              AMBITION
            </span>
            <br />
            MEETS OPPORTUNITY
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            India's Largest Platform Connecting Students with Career-Defining Opportunities
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-center">
            THE CHALLENGE
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p className="text-center text-xl leading-relaxed">
              Students across India struggle to find genuine opportunities scattered across multiple platforms.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="p-6 text-center">
                <h3 className="text-4xl font-bold text-primary mb-2">70%</h3>
                <p className="text-sm">of students miss opportunities due to information overload</p>
              </Card>
              <Card className="p-6 text-center">
                <h3 className="text-4xl font-bold text-primary mb-2">85%</h3>
                <p className="text-sm">struggle to build impressive portfolios and CVs</p>
              </Card>
              <Card className="p-6 text-center">
                <h3 className="text-4xl font-bold text-primary mb-2">60%</h3>
                <p className="text-sm">lack access to quality mentorship and guidance</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">
            THE SOLUTION
          </h2>
          <div className="space-y-8">
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Rocket className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">All-in-One Platform</h3>
                  <p className="text-muted-foreground">
                    AITD Events brings everything together - internships, hackathons, scholarships, 
                    competitions, freelance tasks, workshops, and mentorship - all in one place.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <GraduationCap className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Personalized Discovery</h3>
                  <p className="text-muted-foreground">
                    AI-powered recommendations match you with opportunities based on your skills, 
                    interests, and career goals. Never miss what's meant for you.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Build Your Brand</h3>
                  <p className="text-muted-foreground">
                    Track achievements, earn badges, build portfolio, and create a verified profile 
                    that stands out to recruiters and companies.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">
            HOW IT WORKS
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.number} className="p-6 hover:shadow-[var(--shadow-hover)] transition-all">
                  <div className="text-6xl font-bold text-primary/20 mb-4">
                    {step.number}
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">
            OUR IMPACT
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">
            OUR VALUES
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="p-6 text-center hover:shadow-[var(--shadow-hover)] transition-all">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            OUR MISSION
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
            To democratize access to career opportunities for every Indian student, 
            regardless of their college, background, or location.
          </p>
          <div className="p-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl border border-primary/20">
            <p className="text-lg italic text-muted-foreground">
              "We believe every student deserves a fair shot at their dreams. AITD Events is 
              building the bridge between ambition and achievement, one opportunity at a time."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

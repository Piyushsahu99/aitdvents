import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
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
  Heart,
  Linkedin,
  Twitter,
  Instagram,
  Handshake,
  UserCircle,
  ExternalLink
} from "lucide-react";
import piyushSahuImg from "@/assets/piyush-sahu-director.png";
import companyMitraLogo from "@/assets/company-mitra-logo.jpg";
import step2getherLogo from "@/assets/step2gether-logo.jpg";

interface PlatformStats {
  students: number;
  events: number;
  jobs: number;
  courses: number;
  bounties: number;
  ambassadors: number;
  colleges: number;
}

export default function About() {
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
    fetchStats();
  }, []);

  const fetchStats = async () => {
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

  const platformStats = [
    { label: "Students Registered", value: stats.students, icon: Users },
    { label: "Campus Ambassadors", value: stats.ambassadors, icon: Users },
    { label: "Live Events", value: stats.events, icon: Rocket },
    { label: "Active Bounties", value: stats.bounties, icon: Trophy },
  ];

  const achievements = [
    {
      icon: Rocket,
      title: "CodeMatrix: Genesis Hackathon",
      description: "Our first community-organized hackathon with $500+ prize pool, hosted by GDG on Campus - Dr. AITD, Kanpur. 40+ teams participated in AI, Web & Cloud, and Blockchain tracks.",
      date: "Dec 2025",
      link: "https://codematrix-genesis.aitdevents.in",
      highlight: true,
    },
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

  const supportingCompanies = [
    {
      name: "Company Mitra",
      logo: companyMitraLogo,
      description: "Business consulting & support partner",
    },
    {
      name: "Raktchain",
      logo: null,
      description: "Blockchain innovation partner",
    },
    {
      name: "Step2gether Social Foundation",
      logo: step2getherLogo,
      description: "Social impact & community partner",
    },
  ];

  const mentors = [
    {
      name: "Hrishique Munshi",
      title: "Mentor",
    },
    {
      name: "Sandesh",
      title: "Mentor",
    },
    {
      name: "Prasenjit Gautam",
      title: "Mentor",
    },
    {
      name: "Pradeep Gupta",
      title: "Mentor",
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
            Empowering Tier 2 & Tier 3 College Students • Connecting Brands with India's Future Talent
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-base px-6 py-2">
              <Heart className="h-4 w-4 mr-2" />
              Our Mission
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              BRIDGING THE{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                OPPORTUNITY GAP
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              We believe every student deserves equal access to opportunities, regardless of their college tier
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Student Focus */}
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-primary/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">For Students</h3>
                  <p className="text-muted-foreground mb-4">
                    Empowering students from <span className="font-bold text-primary">Tier 2 & Tier 3 colleges</span> across India with:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Access to premium internships, hackathons & competitions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Career guidance and mentorship from industry experts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Skill development through courses & workshops</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Earn rewards while learning and growing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Brand Focus */}
            <Card className="p-8 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-accent/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Megaphone className="h-8 w-8 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors">For Brands</h3>
                  <p className="text-muted-foreground mb-4">
                    Helping brands <span className="font-bold text-accent">reach maximum students</span> across India through:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span>Direct access to 10,000+ engaged college students</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span>Campus ambassador programs for grassroots marketing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span>Product promotions and brand awareness campaigns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span>Talent acquisition and recruitment pipeline</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Impact Stats */}
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 border border-primary/10">
            <h3 className="text-2xl font-bold text-center mb-8">Our Impact</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stats.students.toLocaleString()}+</div>
                <div className="text-sm text-muted-foreground">Students Registered</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">{stats.colleges}+</div>
                <div className="text-sm text-muted-foreground">Colleges Reached</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stats.events}+</div>
                <div className="text-sm text-muted-foreground">Live Opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">{stats.ambassadors}+</div>
                <div className="text-sm text-muted-foreground">Campus Ambassadors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-16 md:py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">
            LEADERSHIP
          </h2>
          <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                  <img 
                    src={piyushSahuImg} 
                    alt="Piyush Sahu - Director" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                  Director
                </div>
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">Piyush Sahu</h3>
                <p className="text-primary font-semibold mb-3">Founder & Director, AitdEvents</p>
                <p className="text-muted-foreground mb-4 text-sm md:text-base">
                  Passionate about empowering students with opportunities that shape their careers. 
                  Building India's largest student opportunity platform to bridge the gap between 
                  ambition and achievement.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <a href="#" className="p-2 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors">
                    <Linkedin className="h-4 w-4 text-primary" />
                  </a>
                  <a href="#" className="p-2 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors">
                    <Twitter className="h-4 w-4 text-primary" />
                  </a>
                  <a href="#" className="p-2 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors">
                    <Instagram className="h-4 w-4 text-primary" />
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center">
            OUR ACHIEVEMENTS
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Real milestones that mark our journey in empowering students across India
          </p>
          <div className="grid gap-6">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              const isHighlight = 'highlight' in achievement && achievement.highlight;
              const hasLink = 'link' in achievement && achievement.link;
              
              const cardContent = (
                <Card key={index} className={`p-6 hover:shadow-lg transition-all group ${isHighlight ? 'border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10' : 'border-primary/10 hover:border-primary/30'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg group-hover:bg-primary/20 transition-colors ${isHighlight ? 'bg-primary/20' : 'bg-primary/10'}`}>
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant={isHighlight ? "default" : "secondary"} className="text-xs">{achievement.date}</Badge>
                    {hasLink && <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{achievement.title}</h3>
                  <p className="text-muted-foreground text-sm">{achievement.description}</p>
                </Card>
              );
              
              return hasLink ? (
                <a key={index} href={(achievement as any).link} target="_blank" rel="noopener noreferrer" className="block">
                  {cardContent}
                </a>
              ) : cardContent;
            })}
          </div>
        </div>
      </section>

      {/* Supporting Companies Section */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Handshake className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-5xl font-bold text-center">
              SUPPORTING PARTNERS
            </h2>
          </div>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Organizations that believe in our mission and support student growth
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {supportingCompanies.map((company, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all border-primary/10 hover:border-primary/30 group text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                  {company.logo ? (
                    <img 
                      src={company.logo} 
                      alt={company.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building className="h-10 w-10 text-primary" />
                  )}
                </div>
                <h3 className="text-lg font-bold mb-2">{company.name}</h3>
                <p className="text-muted-foreground text-sm">{company.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mentors Section */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-br from-accent/5 to-primary/5">
        <div className="container mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <UserCircle className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-5xl font-bold text-center">
              OUR MENTORS
            </h2>
          </div>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Industry experts guiding the next generation of talent
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {mentors.map((mentor, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all border-primary/10 hover:border-primary/30 group text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <UserCircle className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-bold mb-1">{mentor.name}</h3>
                <p className="text-primary text-sm font-medium">{mentor.title}</p>
              </Card>
            ))}
          </div>
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
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-3">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Information scattered across multiple platforms</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-3">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Difficulty finding relevant opportunities</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Limited access to mentorship & guidance</p>
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
            {platformStats.map((stat) => {
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

      {/* Vision & Mission Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-base px-6 py-2">
              <Lightbulb className="h-4 w-4 mr-2" />
              Our Vision & Mission
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              BUILDING INDIA'S{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                FUTURE
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Vision */}
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 hover:shadow-2xl transition-all duration-500 group">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-4 bg-primary/20 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-2 group-hover:text-primary transition-colors">Our Vision</h3>
                  <div className="h-1 w-20 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                To become <span className="font-bold text-primary">India's largest and most trusted platform</span> that connects every college student with life-changing opportunities, creating a level playing field where talent triumphs over privilege.
              </p>
              <p className="text-muted-foreground">
                By 2030, we envision reaching <span className="font-bold text-accent">10 million+ students</span> across 5,000+ colleges, especially in tier 2 & tier 3 cities, transforming how India discovers, nurtures, and places its young talent.
              </p>
            </Card>

            {/* Mission */}
            <Card className="p-8 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20 hover:shadow-2xl transition-all duration-500 group">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-4 bg-accent/20 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Rocket className="h-10 w-10 text-accent" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-2 group-hover:text-accent transition-colors">Our Mission</h3>
                  <div className="h-1 w-20 bg-gradient-to-r from-accent to-primary rounded-full"></div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                To <span className="font-bold text-accent">democratize access</span> to career opportunities for every Indian student, regardless of their college tier, background, or geographic location.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                  <span>Aggregate opportunities from 1000+ sources into one platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                  <span>Provide free skill development and mentorship</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                  <span>Connect brands directly with student communities</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Quote */}
          <div className="relative p-8 md:p-12 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl border border-primary/20 overflow-hidden">
            <div className="absolute top-0 left-0 text-9xl text-primary/10 font-serif">"</div>
            <p className="text-xl md:text-2xl italic text-foreground leading-relaxed text-center relative z-10">
              "We believe every student deserves a fair shot at their dreams. AITD Events is 
              building the bridge between <span className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ambition and achievement</span>, one opportunity at a time."
            </p>
            <p className="text-center mt-6 text-muted-foreground font-semibold">— Piyush Sahu, Founder & Director</p>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Gift,
  Trophy,
  Star,
  Megaphone,
  Target,
  Award,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Building,
  Rocket,
  Heart,
} from "lucide-react";

export default function CampusAmbassador() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    college: "",
    city: "",
    state: "",
    year_of_study: "",
    course: "",
    linkedin_url: "",
    instagram_url: "",
    why_ambassador: "",
    previous_experience: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.phone || !formData.college || 
        !formData.city || !formData.state || !formData.year_of_study || !formData.course || 
        !formData.why_ambassador) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("campus_ambassadors").insert({
        ...formData,
        user_id: user?.id || null,
      });

      if (error) throw error;

      toast.success("Application submitted successfully! We'll get back to you soon.");
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        college: "",
        city: "",
        state: "",
        year_of_study: "",
        course: "",
        linkedin_url: "",
        instagram_url: "",
        why_ambassador: "",
        previous_experience: "",
      });
      setShowForm(false);
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: Gift,
      title: "Exclusive Goodies",
      description: "Get branded merchandise, tech gadgets, and exclusive swag",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Trophy,
      title: "Rewards & Cash Prizes",
      description: "Earn money and rewards for every successful referral",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Star,
      title: "Recognition & Certificates",
      description: "Get certified as a Campus Ambassador with LinkedIn badges",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Megaphone,
      title: "Build Your Network",
      description: "Connect with industry leaders, mentors, and fellow ambassadors",
      color: "from-violet-500 to-purple-500",
    },
    {
      icon: Target,
      title: "Skill Development",
      description: "Develop leadership, marketing, and communication skills",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Award,
      title: "Letter of Recommendation",
      description: "Top performers get LORs from our leadership team",
      color: "from-indigo-500 to-blue-500",
    },
  ];

  const responsibilities = [
    "Promote AITD events, courses, and opportunities at your college",
    "Organize workshops, meetups, and info sessions",
    "Help fellow students discover career opportunities",
    "Share content on social media and college groups",
    "Provide feedback to help us improve our platform",
  ];

  const stats = [
    { value: "500+", label: "Ambassadors" },
    { value: "100+", label: "Colleges" },
    { value: "₹50K+", label: "Rewards Given" },
    { value: "20+", label: "Cities" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-mesh overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20">
              <Users className="h-4 w-4 mr-2" />
              Campus Ambassador Program
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Become a{" "}
              <span className="text-gradient-primary">Campus Ambassador</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Represent AITD at your college, help students discover opportunities, 
              and earn amazing rewards while building your career!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 rounded-xl hover:scale-105 transition-all"
                onClick={() => setShowForm(true)}
              >
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 rounded-xl hover:scale-105 transition-all"
                onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="p-4 rounded-xl bg-card/50 border border-border/50">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Why Join Us
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Exclusive <span className="text-gradient-primary">Benefits</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              As a Campus Ambassador, you'll unlock amazing perks and opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card 
                  key={benefit.title} 
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${benefit.color} text-white w-fit mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* What You'll Do Section */}
      <section className="py-20 px-4 bg-mesh">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4">
                <Target className="w-4 h-4 mr-2" />
                Responsibilities
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                What You'll <span className="text-gradient-primary">Do</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                As a Campus Ambassador, you'll be the face of AITD at your college, 
                helping students discover opportunities and grow their careers.
              </p>

              <div className="space-y-4">
                {responsibilities.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <GraduationCap className="h-10 w-10 mb-4" />
                <h3 className="font-bold text-lg mb-2">Any College</h3>
                <p className="text-sm opacity-90">Open to students from all colleges across India</p>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                <Building className="h-10 w-10 mb-4" />
                <h3 className="font-bold text-lg mb-2">Any Year</h3>
                <p className="text-sm opacity-90">1st to final year students can apply</p>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                <Rocket className="h-10 w-10 mb-4" />
                <h3 className="font-bold text-lg mb-2">Any Branch</h3>
                <p className="text-sm opacity-90">No specific branch or skill requirements</p>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                <Heart className="h-10 w-10 mb-4" />
                <h3 className="font-bold text-lg mb-2">Passion</h3>
                <p className="text-sm opacity-90">Just bring your enthusiasm and energy!</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      {showForm && (
        <section className="py-20 px-4 bg-muted/30" id="apply-form">
          <div className="container mx-auto max-w-2xl">
            <Card className="border-border/50">
              <CardHeader className="text-center">
                <Badge className="mb-4 w-fit mx-auto">
                  <Users className="w-4 h-4 mr-2" />
                  Application Form
                </Badge>
                <CardTitle className="text-2xl md:text-3xl">
                  Apply to Become a Campus Ambassador
                </CardTitle>
                <p className="text-muted-foreground">
                  Fill in your details and tell us why you'd be a great ambassador
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange("full_name", e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+91 9876543210"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="college">College Name *</Label>
                      <Input
                        id="college"
                        value={formData.college}
                        onChange={(e) => handleInputChange("college", e.target.value)}
                        placeholder="Your college name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Your city"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        placeholder="Your state"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year_of_study">Year of Study *</Label>
                      <Select
                        value={formData.year_of_study}
                        onValueChange={(value) => handleInputChange("year_of_study", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st Year">1st Year</SelectItem>
                          <SelectItem value="2nd Year">2nd Year</SelectItem>
                          <SelectItem value="3rd Year">3rd Year</SelectItem>
                          <SelectItem value="4th Year">4th Year</SelectItem>
                          <SelectItem value="5th Year">5th Year</SelectItem>
                          <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course">Course/Branch *</Label>
                      <Input
                        id="course"
                        value={formData.course}
                        onChange={(e) => handleInputChange("course", e.target.value)}
                        placeholder="e.g., B.Tech CSE"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin_url">LinkedIn Profile (Optional)</Label>
                      <Input
                        id="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                        placeholder="linkedin.com/in/yourprofile"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram_url">Instagram Handle (Optional)</Label>
                      <Input
                        id="instagram_url"
                        value={formData.instagram_url}
                        onChange={(e) => handleInputChange("instagram_url", e.target.value)}
                        placeholder="@yourhandle"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="why_ambassador">Why do you want to be a Campus Ambassador? *</Label>
                    <Textarea
                      id="why_ambassador"
                      value={formData.why_ambassador}
                      onChange={(e) => handleInputChange("why_ambassador", e.target.value)}
                      placeholder="Tell us about your motivation and what you can bring to the program..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="previous_experience">Previous Experience (Optional)</Label>
                    <Textarea
                      id="previous_experience"
                      value={formData.previous_experience}
                      onChange={(e) => handleInputChange("previous_experience", e.target.value)}
                      placeholder="Any relevant experience in organizing events, marketing, or community building..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary to-accent text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-10" />
        <div className="container mx-auto relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make an Impact?
          </h2>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join our campus ambassador program and start earning rewards while helping 
            fellow students discover amazing opportunities!
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-6 rounded-xl hover:scale-105 transition-all"
            onClick={() => {
              setShowForm(true);
              setTimeout(() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
            }}
          >
            Apply Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}

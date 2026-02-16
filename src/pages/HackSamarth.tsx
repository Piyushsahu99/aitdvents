import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trophy, FileText, CheckCircle, Clock, Users, ArrowRight, Lightbulb, Send, ExternalLink, Rocket, Target, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthModal } from "@/components/AuthModal";
import { useEffect } from "react";

const GOOGLE_FORM_URL = "https://forms.gle/AjZr3XjvZvbjZJKLA";

export default function HackSamarth() {
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmitPPT = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    window.open(GOOGLE_FORM_URL, "_blank");
  };

  const openForm = () => {
    window.open(GOOGLE_FORM_URL, "_blank");
  };

  const steps = [
    { icon: Users, title: "Sign Up on AITD", description: "Create your free account on the AITD platform to get started." },
    { icon: Lightbulb, title: "Prepare Your PPT", description: "Build a compelling presentation covering your idea, solution, and impact." },
    { icon: Send, title: "Submit via Form", description: "Upload your PPT through our Google Form before the deadline." },
  ];

  const guidelines = [
    { icon: FileText, text: "PPT format: .pptx or .pdf (max 20 slides)" },
    { icon: Target, text: "Clearly define the problem statement and your proposed solution" },
    { icon: Rocket, text: "Include tech stack, architecture, and implementation plan" },
    { icon: Users, text: "Team size: 2-4 members per team" },
    { icon: Clock, text: "Submission deadline: Check the form for exact dates" },
    { icon: Zap, text: "Shortlisted teams will advance to the prototype round" },
  ];

  const faqs = [
    { q: "What is HackSamarth 2026?", a: "HackSamarth 2026 is a national-level hackathon organized by AITD. The PPT submission round is the first phase where teams pitch their innovative ideas through presentations." },
    { q: "Who can participate?", a: "Any college student across India can participate. Teams of 2-4 members are allowed. Cross-college teams are welcome." },
    { q: "What should the PPT include?", a: "Your PPT should cover: Problem Statement, Proposed Solution, Tech Stack, Architecture Diagram, Implementation Plan, Expected Impact, and Team Details." },
    { q: "Is there a registration fee?", a: "No! Participation in HackSamarth 2026 is completely free." },
    { q: "What happens after PPT submission?", a: "Shortlisted teams will be notified and will proceed to the prototype/demo round where they build a working solution." },
    { q: "Can I submit individually?", a: "We encourage team participation (2-4 members), but individual submissions may be considered on a case-by-case basis." },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-accent/10 to-primary/20 py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30 text-sm px-4 py-1.5">
              <Trophy className="w-4 h-4 mr-2" />
              National Level Hackathon
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              HackSamarth 2026
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-3 font-medium">
              PPT Submission Round — Present Your Innovation
            </p>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Submit your idea as a PPT and compete with the best minds across India. Shortlisted teams advance to the prototype round!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={handleSubmitPPT} className="text-lg px-8 gap-2 shadow-lg">
                <FileText className="h-5 w-5" />
                Submit Your PPT
                <ArrowRight className="h-5 w-5" />
              </Button>
              {!user && (
                <Button size="lg" variant="outline" onClick={() => setShowAuthModal(true)} className="text-lg px-8">
                  Sign Up First
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">About HackSamarth 2026</h2>
            <p className="text-muted-foreground leading-relaxed">
              HackSamarth is AITD's flagship hackathon that brings together innovative student minds to solve real-world problems. 
              The PPT Submission Round is your gateway — pitch your idea, showcase your vision, and get shortlisted for the 
              prototype building phase. Whether it's AI, sustainability, fintech, or social impact — we want to see your best ideas!
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {steps.map((step, idx) => (
              <Card key={idx} className="relative overflow-hidden hover:shadow-lg transition-all group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-xs font-bold text-primary mb-2">STEP {idx + 1}</div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Submission Guidelines */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Submission Guidelines</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {guidelines.map((item, idx) => (
              <Card key={idx} className="hover:border-primary/30 transition-colors">
                <CardContent className="flex items-start gap-3 pt-5 pb-4">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Submit?</h2>
            <p className="text-muted-foreground mb-8">
              Don't miss your chance to be part of HackSamarth 2026. Submit your PPT now and take the first step towards building something amazing!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={handleSubmitPPT} className="text-lg px-10 gap-2 shadow-lg">
                <FileText className="h-5 w-5" />
                Submit PPT Now
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="ghost" onClick={openForm} className="gap-2 text-muted-foreground">
                Open Google Form Directly
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="text-left font-medium">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}

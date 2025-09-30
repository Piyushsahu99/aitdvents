import { Button } from "@/components/ui/button";
import { FileText, Github, Linkedin, ExternalLink } from "lucide-react";

export default function Resume() {
  const resources = [
    {
      title: "Resume Templates",
      description: "Download ATS-friendly resume templates",
      icon: FileText,
      action: "Download",
    },
    {
      title: "Portfolio Showcase",
      description: "Submit your GitHub portfolio for review",
      icon: Github,
      action: "Submit",
    },
    {
      title: "LinkedIn Optimization",
      description: "Tips to improve your LinkedIn profile",
      icon: Linkedin,
      action: "Learn More",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Resume & Portfolio</h1>
        <p className="text-muted-foreground">
          Build your professional presence with our resources
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {resources.map((resource) => (
          <div
            key={resource.title}
            className="p-6 bg-card rounded-lg border border-border hover:shadow-[var(--shadow-hover)] transition-all group"
          >
            <resource.icon className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
            <p className="text-muted-foreground mb-4">{resource.description}</p>
            <Button className="w-full">{resource.action}</Button>
          </div>
        ))}
      </div>

      <div className="p-8 bg-muted/30 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Portfolio Submission Guidelines</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Ensure your GitHub profile is public and up-to-date</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Include a detailed README for each project</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Add live demo links where possible</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Showcase your best 3-5 projects prominently</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

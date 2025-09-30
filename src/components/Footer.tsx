import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import logo from "@/assets/aitd-logo.png";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="AITD Events" className="h-10 w-10 rounded-md" />
              <span className="text-lg font-bold text-primary">aitd.events</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering Indian tech students with opportunities, events, and connections.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/events" className="text-muted-foreground hover:text-primary transition-colors">Events</Link></li>
              <li><Link to="/tasks" className="text-muted-foreground hover:text-primary transition-colors">Tasks</Link></li>
              <li><Link to="/jobs" className="text-muted-foreground hover:text-primary transition-colors">Jobs</Link></li>
              <li><Link to="/blogs" className="text-muted-foreground hover:text-primary transition-colors">Blogs</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/resume" className="text-muted-foreground hover:text-primary transition-colors">Resume Builder</Link></li>
              <li><Link to="/ai-tools" className="text-muted-foreground hover:text-primary transition-colors">AI Tools</Link></li>
              <li><Link to="/alumni" className="text-muted-foreground hover:text-primary transition-colors">Alumni Network</Link></li>
              <li><Link to="/ai-chat" className="text-muted-foreground hover:text-primary transition-colors">AI Assistant</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; 2025 AITD Events. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

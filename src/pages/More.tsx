import { Link } from "react-router-dom";
import { 
  FileText, 
  Video, 
  Users, 
  Sparkles, 
  MessageCircle, 
  Handshake,
  ArrowRight,
  Info
} from "lucide-react";

export default function More() {
  const resources = [
    {
      title: "Resume Builder",
      description: "Create ATS-friendly resumes and portfolios",
      icon: FileText,
      link: "/resume",
      color: "bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20",
    },
    {
      title: "Student Reels",
      description: "Share project demos and tech content",
      icon: Video,
      link: "/reels",
      color: "bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20",
    },
    {
      title: "Alumni Network",
      description: "Connect with successful alumni",
      icon: Users,
      link: "/alumni",
      color: "bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20",
    },
    {
      title: "AI Tools Library",
      description: "Explore cutting-edge AI tools",
      icon: Sparkles,
      link: "/ai-tools",
      color: "bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20",
    },
    {
      title: "AI Assistant",
      description: "Get instant help with your queries",
      icon: MessageCircle,
      link: "/ai-chat",
      color: "bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/20",
    },
    {
      title: "Sponsors",
      description: "Partner with us for events",
      icon: Handshake,
      link: "/sponsors",
      color: "bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20",
    },
    {
      title: "Blogs",
      description: "Read and share tech experiences",
      icon: FileText,
      link: "/blogs",
      color: "bg-gradient-to-br from-teal-500/10 to-teal-500/5 border-teal-500/20",
    },
    {
      title: "About Us",
      description: "Learn about our mission and vision",
      icon: Info,
      link: "/about",
      color: "bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-indigo-500/20",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 pb-24 lg:pb-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">More Resources</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Explore additional features and tools
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {resources.map((resource) => (
          <Link
            key={resource.title}
            to={resource.link}
            className={`group p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border transition-all active:scale-[0.98] hover:shadow-lg ${resource.color}`}
          >
            <resource.icon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mb-3 sm:mb-4 text-primary group-hover:scale-110 transition-transform" />
            <h3 className="text-sm sm:text-base lg:text-xl font-semibold mb-1 sm:mb-2 flex items-center justify-between">
              <span className="line-clamp-1">{resource.title}</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

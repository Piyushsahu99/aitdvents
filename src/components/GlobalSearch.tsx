import { useState, useEffect } from "react";
import { Search, BookOpen, Calendar, Briefcase, DollarSign, Rss, Wrench, UserCircle, Trophy, Users, Target } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { events, tasks, jobs, blogs, aiTools, alumni } from "@/data/mockData";

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: string;
  icon: any;
  path: string;
  metadata?: string;
}

export const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search Events
    events.forEach((event) => {
      if (
        event.title.toLowerCase().includes(lowerQuery) ||
        event.description.toLowerCase().includes(lowerQuery) ||
        event.category.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: `event-${event.id}`,
          title: event.title,
          description: event.description,
          category: "Event",
          icon: Calendar,
          path: "/events",
          metadata: `${event.date} • ${event.location}`,
        });
      }
    });

    // Search Bounties (Tasks)
    tasks.forEach((task) => {
      if (
        task.title.toLowerCase().includes(lowerQuery) ||
        task.description.toLowerCase().includes(lowerQuery) ||
        task.category.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: `bounty-${task.id}`,
          title: task.title,
          description: task.description,
          category: "Bounty",
          icon: DollarSign,
          path: "/bounties",
          metadata: `${task.budget} • ${task.duration}`,
        });
      }
    });

    // Search Jobs
    jobs.forEach((job) => {
      if (
        job.title.toLowerCase().includes(lowerQuery) ||
        job.company.toLowerCase().includes(lowerQuery) ||
        job.category.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: `job-${job.id}`,
          title: job.title,
          description: `${job.company} • ${job.type}`,
          category: "Job",
          icon: Briefcase,
          path: "/jobs",
          metadata: `${job.stipend} • ${job.location}`,
        });
      }
    });

    // Search Blogs
    blogs.forEach((blog) => {
      if (
        blog.title.toLowerCase().includes(lowerQuery) ||
        blog.category.toLowerCase().includes(lowerQuery) ||
        blog.author.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: `blog-${blog.id}`,
          title: blog.title,
          description: blog.excerpt,
          category: "Blog",
          icon: Rss,
          path: "/blogs",
          metadata: `${blog.author} • ${blog.readTime}`,
        });
      }
    });

    // Search AI Tools
    aiTools.forEach((tool) => {
      if (
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery) ||
        tool.category.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: `aitool-${tool.id}`,
          title: tool.name,
          description: tool.description,
          category: "AI Tool",
          icon: Wrench,
          path: "/ai-tools",
          metadata: tool.category,
        });
      }
    });

    // Search Alumni
    alumni.forEach((person) => {
      if (
        person.name.toLowerCase().includes(lowerQuery) ||
        person.company.toLowerCase().includes(lowerQuery) ||
        person.college.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: `alumni-${person.id}`,
          title: person.name,
          description: `${person.role} at ${person.company}`,
          category: "Alumni",
          icon: UserCircle,
          path: "/alumni",
          metadata: person.college,
        });
      }
    });

    // Add quick navigation items
    const quickNav = [
      { title: "Courses", path: "/courses", icon: BookOpen, category: "Page" },
      { title: "My Courses", path: "/my-courses", icon: BookOpen, category: "Page" },
      { title: "Practice", path: "/practice", icon: Target, category: "Page" },
      { title: "Leaderboard", path: "/leaderboard", icon: Trophy, category: "Page" },
      { title: "Network", path: "/network", icon: Users, category: "Page" },
      { title: "Groups", path: "/groups", icon: Users, category: "Page" },
      { title: "Community", path: "/community", icon: Users, category: "Page" },
    ];

    quickNav.forEach((item) => {
      if (item.title.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: `page-${item.title}`,
          title: item.title,
          category: "Quick Navigation",
          icon: item.icon,
          path: item.path,
        });
      }
    });

    setSearchResults(results.slice(0, 15)); // Limit to 15 results
  };

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  // Group results by category
  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-3 px-5 py-3 rounded-xl bg-background hover:bg-muted/50 transition-all duration-300 border-2 border-border hover:border-primary/30 hover:shadow-lg group w-full"
      >
        <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="text-base text-muted-foreground flex-1 text-left">
          Search courses, events, jobs, and more...
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium bg-muted border border-border rounded-md">
          <span>⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search courses, events, jobs, and more..." 
          onValueChange={handleSearch}
        />
        <CommandList className="max-h-[450px]">
          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
            No results found. Try searching for courses, events, jobs, or bounties.
          </CommandEmpty>

          {Object.entries(groupedResults).map(([category, items]) => (
            <CommandGroup key={category} heading={category} className="px-2">
              {items.map((result) => {
                const Icon = result.icon;
                return (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result.path)}
                    className="flex items-start gap-3 px-3 py-3 rounded-lg cursor-pointer aria-selected:bg-accent/50 hover:bg-accent/30 transition-colors group"
                  >
                    <div className="mt-0.5 p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium text-sm group-hover:text-primary transition-colors">
                        {result.title}
                      </div>
                      {result.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {result.description}
                        </div>
                      )}
                      {result.metadata && (
                        <div className="text-xs text-muted-foreground/70">
                          {result.metadata}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};

import { Card } from "@/components/ui/card";
import { 
  Calendar, Users, Trophy, Briefcase, GraduationCap, 
  FileText, ShoppingBag, TrendingUp, ArrowUpRight, ArrowDownRight
} from "lucide-react";

interface StatsData {
  events: number;
  bounties: number;
  jobs: number;
  users: number;
  hackathons: number;
  scholarships: number;
  blogs: number;
  courses: number;
}

interface AdminStatsCardsProps {
  stats: StatsData;
  previousStats?: StatsData;
}

export function AdminStatsCards({ stats, previousStats }: AdminStatsCardsProps) {
  const statCards = [
    { 
      label: "Total Events", 
      value: stats.events, 
      icon: Calendar, 
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-500/10",
      textColor: "text-violet-600 dark:text-violet-400"
    },
    { 
      label: "Total Users", 
      value: stats.users, 
      icon: Users, 
      color: "from-cyan-500 to-blue-600",
      bgColor: "bg-cyan-500/10",
      textColor: "text-cyan-600 dark:text-cyan-400"
    },
    { 
      label: "Bounties", 
      value: stats.bounties, 
      icon: Trophy, 
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-600 dark:text-amber-400"
    },
    { 
      label: "Jobs", 
      value: stats.jobs, 
      icon: Briefcase, 
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    { 
      label: "Hackathons", 
      value: stats.hackathons, 
      icon: TrendingUp, 
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-600 dark:text-emerald-400"
    },
    { 
      label: "Scholarships", 
      value: stats.scholarships, 
      icon: GraduationCap, 
      color: "from-pink-500 to-rose-600",
      bgColor: "bg-pink-500/10",
      textColor: "text-pink-600 dark:text-pink-400"
    },
    { 
      label: "Courses", 
      value: stats.courses, 
      icon: ShoppingBag, 
      color: "from-indigo-500 to-violet-600",
      bgColor: "bg-indigo-500/10",
      textColor: "text-indigo-600 dark:text-indigo-400"
    },
    { 
      label: "Blog Posts", 
      value: stats.blogs, 
      icon: FileText, 
      color: "from-rose-500 to-pink-600",
      bgColor: "bg-rose-500/10",
      textColor: "text-rose-600 dark:text-rose-400"
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const prevValue = previousStats?.[Object.keys(stats)[index] as keyof StatsData] ?? stat.value;
        const change = stat.value - prevValue;
        const isPositive = change >= 0;
        
        return (
          <Card 
            key={stat.label} 
            className={`p-3 sm:p-4 relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
          >
            {/* Gradient background on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            <div className="relative z-10">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-2`}>
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.textColor}`} />
              </div>
              
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {stat.value.toLocaleString()}
              </p>
              
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                {stat.label}
              </p>
              
              {previousStats && change !== 0 && (
                <div className={`flex items-center gap-0.5 mt-1 text-[10px] ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  <span>{Math.abs(change)}</span>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

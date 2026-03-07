import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  UserPlus,
  Calendar,
  Briefcase,
  FileText,
  Award,
  ShoppingBag,
  CheckCircle,
  Activity as ActivityIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "user" | "event" | "job" | "blog" | "rsvp" | "order" | "quiz";
  action: string;
  user_name?: string;
  user_avatar?: string;
  title?: string;
  timestamp: string;
}

const activityIcons = {
  user: UserPlus,
  event: Calendar,
  job: Briefcase,
  blog: FileText,
  rsvp: CheckCircle,
  order: ShoppingBag,
  quiz: Award,
};

const activityColors = {
  user: "text-cyan-600 bg-cyan-500/10",
  event: "text-violet-600 bg-violet-500/10",
  job: "text-blue-600 bg-blue-500/10",
  blog: "text-rose-600 bg-rose-500/10",
  rsvp: "text-green-600 bg-green-500/10",
  order: "text-amber-600 bg-amber-500/10",
  quiz: "text-pink-600 bg-pink-500/10",
};

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    
    // Set up real-time subscriptions
    const channel = supabase
      .channel('activity-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'student_profiles' }, handleNewUser)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, handleNewEvent)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs' }, handleNewJob)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActivities = async () => {
    try {
      const [usersRes, eventsRes, jobsRes] = await Promise.all([
        supabase
          .from("student_profiles")
          .select("id, full_name, avatar_url, created_at")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("events")
          .select("id, title, created_at")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("jobs")
          .select("id, title, created_at")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const activities: ActivityItem[] = [];

      // Add user registrations
      usersRes.data?.forEach((user) => {
        activities.push({
          id: `user-${user.id}`,
          type: "user",
          action: "joined the platform",
          user_name: user.full_name,
          user_avatar: user.avatar_url || undefined,
          timestamp: user.created_at,
        });
      });

      // Add events
      eventsRes.data?.forEach((event) => {
        activities.push({
          id: `event-${event.id}`,
          type: "event",
          action: "created",
          title: event.title,
          timestamp: event.created_at,
        });
      });

      // Add jobs
      jobsRes.data?.forEach((job) => {
        activities.push({
          id: `job-${job.id}`,
          type: "job",
          action: "posted",
          title: job.title,
          timestamp: job.created_at,
        });
      });

      // Sort by timestamp and take top 20
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(activities.slice(0, 20));
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewUser = (payload: any) => {
    const newActivity: ActivityItem = {
      id: `user-${payload.new.id}`,
      type: "user",
      action: "joined the platform",
      user_name: payload.new.full_name,
      user_avatar: payload.new.avatar_url,
      timestamp: payload.new.created_at,
    };
    setActivities((prev) => [newActivity, ...prev].slice(0, 20));
  };

  const handleNewEvent = (payload: any) => {
    const newActivity: ActivityItem = {
      id: `event-${payload.new.id}`,
      type: "event",
      action: "created",
      title: payload.new.title,
      timestamp: payload.new.created_at,
    };
    setActivities((prev) => [newActivity, ...prev].slice(0, 20));
  };

  const handleNewJob = (payload: any) => {
    const newActivity: ActivityItem = {
      id: `job-${payload.new.id}`,
      type: "job",
      action: "posted",
      title: payload.new.title,
      timestamp: payload.new.created_at,
    };
    setActivities((prev) => [newActivity, ...prev].slice(0, 20));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Live platform activity feed</CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ActivityIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = activityIcons[activity.type];
                const colorClass = activityColors[activity.type];
                
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm">
                          {activity.user_name && (
                            <span className="font-semibold">{activity.user_name}</span>
                          )}
                          {activity.title && (
                            <span className="font-semibold">"{activity.title}"</span>
                          )}
                          <span className="text-muted-foreground ml-1">{activity.action}</span>
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

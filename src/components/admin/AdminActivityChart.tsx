import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Activity, Users, TrendingUp, Clock, Zap, Eye } from "lucide-react";
import { format, subDays, startOfDay, parseISO } from "date-fns";

interface ActivityData {
  date: string;
  events: number;
  users: number;
  transactions: number;
}

interface ActiveUserData {
  period: string;
  count: number;
}

export function AdminActivityChart() {
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [activeUsers, setActiveUsers] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch activity data for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(date, 'yyyy-MM-dd');
      });

      // Fetch events created per day
      const { data: eventsData } = await supabase
        .from('events')
        .select('created_at')
        .gte('created_at', subDays(new Date(), 7).toISOString());

      // Fetch users registered per day
      const { data: usersData } = await supabase
        .from('student_profiles')
        .select('created_at')
        .gte('created_at', subDays(new Date(), 7).toISOString());

      // Fetch transactions per day
      const { data: transactionsData } = await supabase
        .from('points_transactions')
        .select('created_at')
        .gte('created_at', subDays(new Date(), 7).toISOString());

      // Process data into daily counts
      const dailyData = last7Days.map(date => {
        const dayStart = startOfDay(parseISO(date));
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

        return {
          date: format(parseISO(date), 'MMM dd'),
          events: eventsData?.filter(e => {
            const created = new Date(e.created_at);
            return created >= dayStart && created < dayEnd;
          }).length || 0,
          users: usersData?.filter(u => {
            const created = new Date(u.created_at);
            return created >= dayStart && created < dayEnd;
          }).length || 0,
          transactions: transactionsData?.filter(t => {
            const created = new Date(t.created_at!);
            return created >= dayStart && created < dayEnd;
          }).length || 0,
        };
      });

      setActivityData(dailyData);

      // Fetch active users (based on last_activity in user_points)
      const now = new Date();
      const dayAgo = subDays(now, 1);
      const weekAgo = subDays(now, 7);
      const monthAgo = subDays(now, 30);

      const { data: activeDaily } = await supabase
        .from('user_points')
        .select('user_id')
        .gte('last_activity', dayAgo.toISOString());

      const { data: activeWeekly } = await supabase
        .from('user_points')
        .select('user_id')
        .gte('last_activity', weekAgo.toISOString());

      const { data: activeMonthly } = await supabase
        .from('user_points')
        .select('user_id')
        .gte('last_activity', monthAgo.toISOString());

      setActiveUsers({
        daily: activeDaily?.length || 0,
        weekly: activeWeekly?.length || 0,
        monthly: activeMonthly?.length || 0,
      });

      // Fetch recent activity feed
      const { data: recentTransactions } = await supabase
        .from('points_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentActivity(recentTransactions || []);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeUserCards = [
    { 
      label: "Daily Active", 
      value: activeUsers.daily, 
      icon: Clock,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    { 
      label: "Weekly Active", 
      value: activeUsers.weekly, 
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    { 
      label: "Monthly Active", 
      value: activeUsers.monthly, 
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Active Users Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {activeUserCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity Trend Chart */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Activity Trend</h4>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
          </div>
          
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="hsl(217, 91%, 60%)" 
                  fillOpacity={1} 
                  fill="url(#colorUsers)"
                  name="New Users"
                />
                <Area 
                  type="monotone" 
                  dataKey="events" 
                  stroke="hsl(262, 83%, 58%)" 
                  fillOpacity={1} 
                  fill="url(#colorEvents)"
                  name="New Events"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <h4 className="font-semibold">Recent Activity</h4>
              <p className="text-xs text-muted-foreground">Points transactions</p>
            </div>
          </div>
          
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div 
                  key={activity.id || index} 
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{activity.action_type}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description || 'No description'}
                    </p>
                  </div>
                  <span className={`font-semibold ${activity.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {activity.amount > 0 ? '+' : ''}{activity.amount}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground text-sm py-8">
                No recent activity
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Engagement Stats */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Eye className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <h4 className="font-semibold">Engagement Overview</h4>
            <p className="text-xs text-muted-foreground">User engagement metrics</p>
          </div>
        </div>
        
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="transactions" 
                stroke="hsl(142, 76%, 36%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(142, 76%, 36%)' }}
                name="Transactions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

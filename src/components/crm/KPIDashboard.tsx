import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Minus, Users, Calendar, CheckCircle, Briefcase, Award, Clock, Activity, Target } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface KPIDefinition {
  id: string;
  name: string;
  description: string | null;
  calculation_type: string;
  target_value: number;
  target_period: string;
  entity_type: string;
  metric_source: string | null;
  is_active: boolean;
  icon: string;
  color: string;
  display_order: number;
}

interface KPIData extends KPIDefinition {
  currentValue: number;
  percentage: number;
  trend: "up" | "down" | "stable";
}

export function KPIDashboard() {
  const [kpis, setKpis] = useState<KPIData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      // Fetch KPI definitions
      const { data: definitions } = await supabase
        .from("kpi_definitions")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (!definitions) return;

      // Calculate current values for each KPI
      const kpisWithData = await Promise.all(definitions.map(async (def) => {
        let currentValue = 0;
        
        // Calculate based on metric source
        switch (def.metric_source) {
          case "profiles":
            const { count: userCount } = await supabase
              .from("student_profiles")
              .select("*", { count: "exact", head: true });
            currentValue = userCount || 0;
            break;
          case "events":
            const { count: eventCount } = await supabase
              .from("events")
              .select("*", { count: "exact", head: true })
              .eq("status", "live");
            currentValue = eventCount || 0;
            break;
          case "crm_tasks":
            if (def.calculation_type === "percentage") {
              const { count: totalTasks } = await supabase
                .from("crm_tasks")
                .select("*", { count: "exact", head: true });
              const { count: completedTasks } = await supabase
                .from("crm_tasks")
                .select("*", { count: "exact", head: true })
                .eq("status", "completed");
              currentValue = totalTasks ? Math.round((completedTasks || 0) / totalTasks * 100) : 0;
            } else {
              const { count: taskCount } = await supabase
                .from("crm_tasks")
                .select("*", { count: "exact", head: true })
                .eq("status", "completed");
              currentValue = taskCount || 0;
            }
            break;
          case "jobs":
            const { count: jobCount } = await supabase
              .from("jobs")
              .select("*", { count: "exact", head: true })
              .eq("status", "live");
            currentValue = jobCount || 0;
            break;
          case "bounty_submissions":
            const { count: submissionCount } = await supabase
              .from("bounty_submissions")
              .select("*", { count: "exact", head: true });
            currentValue = submissionCount || 0;
            break;
          default:
            currentValue = 0;
        }

        const percentage = Math.min(Math.round((currentValue / def.target_value) * 100), 100);
        
        // Determine trend (simplified - would normally compare to previous period)
        let trend: "up" | "down" | "stable" = "stable";
        if (percentage >= 80) trend = "up";
        else if (percentage < 50) trend = "down";

        return {
          ...def,
          currentValue,
          percentage,
          trend,
        } as KPIData;
      }));

      setKpis(kpisWithData);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      users: Users,
      activity: Activity,
      calendar: Calendar,
      "check-circle": CheckCircle,
      "trending-up": TrendingUp,
      briefcase: Briefcase,
      award: Award,
      clock: Clock,
      target: Target,
    };
    return iconMap[iconName] || Activity;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-success" />;
      case "down": return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case "primary": return "text-primary";
      case "secondary": return "text-secondary";
      case "accent": return "text-accent";
      default: return "text-primary";
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-success";
    if (percentage >= 50) return "bg-warning";
    return "bg-destructive";
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading KPIs...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Key Performance Indicators
          </CardTitle>
          <CardDescription>Track platform metrics against targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => {
              const Icon = getIcon(kpi.icon);
              return (
                <Card key={kpi.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2 px-4 pt-4">
                    <div className="flex items-center justify-between">
                      <Icon className={`h-5 w-5 ${getColorClass(kpi.color)}`} />
                      <div className="flex items-center gap-1">
                        {getTrendIcon(kpi.trend)}
                        <Badge variant="outline" className="text-[10px]">
                          {kpi.target_period}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-sm font-medium mt-2">{kpi.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold">
                        {kpi.calculation_type === "percentage" ? `${kpi.currentValue}%` : kpi.currentValue}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / {kpi.calculation_type === "percentage" ? `${kpi.target_value}%` : kpi.target_value}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{kpi.percentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${getProgressColor(kpi.percentage)}`}
                          style={{ width: `${kpi.percentage}%` }}
                        />
                      </div>
                    </div>
                    {kpi.description && (
                      <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2">{kpi.description}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {kpis.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No KPIs defined yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-success/10 border-success/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">
                  {kpis.filter(k => k.percentage >= 80).length}
                </p>
                <p className="text-xs text-muted-foreground">On Target</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-warning/10 border-warning/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Activity className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">
                  {kpis.filter(k => k.percentage >= 50 && k.percentage < 80).length}
                </p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/20">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">
                  {kpis.filter(k => k.percentage < 50).length}
                </p>
                <p className="text-xs text-muted-foreground">Need Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {kpis.length > 0 ? Math.round(kpis.reduce((acc, k) => acc + k.percentage, 0) / kpis.length) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Avg. Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

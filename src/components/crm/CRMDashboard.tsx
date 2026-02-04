import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Users, ClipboardList, BarChart3, Bell, Activity, Target, TrendingUp, Clock, CheckCircle2, AlertCircle, Timer, Calendar, LayoutGrid, GitBranch, CalendarDays } from "lucide-react";
import { TaskManager } from "./TaskManager";
import { TaskKanban } from "./TaskKanban";
import { TeamMemberManager } from "./TeamMemberManager";
import { KPIDashboard } from "./KPIDashboard";
import { ActivityLogViewer } from "./ActivityLogViewer";
import { AnnouncementManager } from "./AnnouncementManager";
import { TimeLogManager } from "./TimeLogManager";
import { LeaveManager } from "./LeaveManager";
import { TeamOrgChart } from "./TeamOrgChart";
import { TeamCalendar } from "./TeamCalendar";
import { useTasks } from "@/hooks/useTasks";

export function CRMDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [userCount, setUserCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const { taskStats, isLoading: tasksLoading } = useTasks();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [usersRes, teamRes] = await Promise.all([
      supabase.from("student_profiles").select("id", { count: "exact", head: true }),
      supabase.from("team_members").select("id", { count: "exact", head: true }),
    ]);
    setUserCount(usersRes.count || 0);
    setTeamCount(teamRes.count || 0);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
            <div className="flex items-center justify-between">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <Badge variant="secondary" className="text-[10px]">Users</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold">{userCount}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total registered</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
            <div className="flex items-center justify-between">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
              <Badge variant="secondary" className="text-[10px]">Team</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold">{teamCount}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Core members</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
            <div className="flex items-center justify-between">
              <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              <Badge variant="secondary" className="text-[10px]">Tasks</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold">{taskStats.total}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">All tasks</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
            <div className="flex items-center justify-between">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
              <Badge variant="outline" className="text-[10px] text-warning border-warning">Pending</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold text-warning">{taskStats.pending}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Awaiting start</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-info" />
              <Badge variant="outline" className="text-[10px] text-info border-info">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold text-info">{taskStats.inProgress}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              <Badge variant="outline" className="text-[10px] text-success border-success">Done</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold text-success">{taskStats.completed}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alert */}
      {taskStats.overdue > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-3 px-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">
                {taskStats.overdue} overdue task{taskStats.overdue > 1 ? 's' : ''} require attention
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CRM Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-max gap-1 p-1 bg-muted/50">
            <TabsTrigger value="overview" className="text-xs sm:text-sm gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs sm:text-sm gap-1.5">
              <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="kanban" className="text-xs sm:text-sm gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="time" className="text-xs sm:text-sm gap-1.5">
              <Timer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Time
            </TabsTrigger>
            <TabsTrigger value="leave" className="text-xs sm:text-sm gap-1.5">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Leave
            </TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs sm:text-sm gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="team" className="text-xs sm:text-sm gap-1.5">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="org" className="text-xs sm:text-sm gap-1.5">
              <GitBranch className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Org Chart
            </TabsTrigger>
            <TabsTrigger value="kpis" className="text-xs sm:text-sm gap-1.5">
              <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              KPIs
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm gap-1.5">
              <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="announcements" className="text-xs sm:text-sm gap-1.5">
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Announcements</span>
              <span className="sm:hidden">Announce</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Task Overview
                </CardTitle>
                <CardDescription>Current task distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-warning rounded-full" 
                          style={{ width: `${taskStats.total ? (taskStats.pending / taskStats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{taskStats.pending}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">In Progress</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-info rounded-full" 
                          style={{ width: `${taskStats.total ? (taskStats.inProgress / taskStats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{taskStats.inProgress}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">In Review</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary rounded-full" 
                          style={{ width: `${taskStats.total ? (taskStats.review / taskStats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{taskStats.review}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-success rounded-full" 
                          style={{ width: `${taskStats.total ? (taskStats.completed / taskStats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{taskStats.completed}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                  Quick Stats
                </CardTitle>
                <CardDescription>Platform overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">Total Users</span>
                    <Badge>{userCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">Team Members</span>
                    <Badge variant="secondary">{teamCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">Completion Rate</span>
                    <Badge variant="outline">
                      {taskStats.total ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-destructive/10">
                    <span className="text-sm">Overdue Tasks</span>
                    <Badge variant="destructive">{taskStats.overdue}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <TaskManager />
        </TabsContent>

        <TabsContent value="kanban">
          <TaskKanban />
        </TabsContent>

        <TabsContent value="time">
          <TimeLogManager />
        </TabsContent>

        <TabsContent value="leave">
          <LeaveManager />
        </TabsContent>

        <TabsContent value="calendar">
          <TeamCalendar />
        </TabsContent>

        <TabsContent value="team">
          <TeamMemberManager />
        </TabsContent>

        <TabsContent value="org">
          <TeamOrgChart />
        </TabsContent>

        <TabsContent value="kpis">
          <KPIDashboard />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityLogViewer />
        </TabsContent>

        <TabsContent value="announcements">
          <AnnouncementManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

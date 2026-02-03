import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import { useTasks } from "@/hooks/useTasks";
import { useTimeLog } from "@/hooks/useTimeLog";
import { useLeaves } from "@/hooks/useLeaves";
import { 
  LayoutDashboard, ClipboardList, Calendar, Briefcase, Users, BookOpen, 
  CheckCircle, Clock, Play, Home, Loader2, Timer, TrendingUp,
  CalendarDays, FileText, Target
} from "lucide-react";
import { format } from "date-fns";

export default function TeamPanel() {
  const navigate = useNavigate();
  const { permissions, teamMember, isLoading: permLoading, isCoreTeam } = useTeamPermissions();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { tasks, isLoading: tasksLoading, updateTaskStatus, taskStats } = useTasks();
  
  // Personal data hooks
  const { timeLogs, weeklyHours, totalHours } = useTimeLog(undefined, user?.id);
  const { leaves, pendingCount: pendingLeaves } = useLeaves(teamMember?.id);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
  };

  // Filter tasks assigned to current user
  const myTasks = tasks.filter(t => t.assigned_to === user?.id);
  const myPendingTasks = myTasks.filter(t => t.status === "pending");
  const myInProgressTasks = myTasks.filter(t => t.status === "in_progress");
  const myCompletedTasks = myTasks.filter(t => t.status === "completed");
  const myOverdueTasks = myTasks.filter(t => 
    t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed"
  );

  if (permLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isCoreTeam) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You don't have access to the Team Panel.</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success text-success-foreground";
      case "in_progress": return "bg-info text-info-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      default: return "bg-muted";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "default";
      default: return "outline";
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">
              Team Panel
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {teamMember?.full_name || "Team Member"} • {teamMember?.role_title || "Core Team"}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-2">
          <Home className="h-4 w-4" /> Home
        </Button>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-max gap-1 p-1 bg-muted/50">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm gap-1.5">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs sm:text-sm gap-1.5">
              <ClipboardList className="h-3.5 w-3.5" />
              My Tasks
            </TabsTrigger>
            <TabsTrigger value="time" className="text-xs sm:text-sm gap-1.5">
              <Timer className="h-3.5 w-3.5" />
              Time Log
            </TabsTrigger>
            <TabsTrigger value="leave" className="text-xs sm:text-sm gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Leave
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-warning" />
                  <div>
                    <p className="text-2xl font-bold">{myPendingTasks.length}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Play className="h-5 w-5 text-info" />
                  <div>
                    <p className="text-2xl font-bold">{myInProgressTasks.length}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-2xl font-bold">{myCompletedTasks.length}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Timer className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{weeklyHours.toFixed(1)}h</p>
                    <p className="text-xs text-muted-foreground">This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
                    <p className="text-xs text-muted-foreground">Total Hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-2xl font-bold">{pendingLeaves}</p>
                    <p className="text-xs text-muted-foreground">Leave Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Tasks */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Recent Tasks
              </CardTitle>
              <CardDescription>Your most recent task assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {myTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No tasks assigned to you yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {task.due_date && (
                            <span className={task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed" ? "text-destructive" : ""}>
                              Due: {format(new Date(task.due_date), "MMM dd")}
                            </span>
                          )}
                          <Badge variant={getPriorityColor(task.priority)} className="text-[10px]">{task.priority}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                          {task.status.replace("_", " ")}
                        </Badge>
                        {task.status === "pending" && (
                          <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, "in_progress")}>
                            Start
                          </Button>
                        )}
                        {task.status === "in_progress" && (
                          <Button size="sm" variant="default" onClick={() => updateTaskStatus(task.id, "completed")}>
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Access */}
          {permissions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Access</CardTitle>
                <CardDescription>Modules you have access to</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {permissions.can_manage_events && (
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/admin")}>
                      <Calendar className="h-5 w-5" />
                      <span className="text-xs">Events</span>
                    </Button>
                  )}
                  {permissions.can_manage_jobs && (
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/admin")}>
                      <Briefcase className="h-5 w-5" />
                      <span className="text-xs">Jobs</span>
                    </Button>
                  )}
                  {permissions.can_view_users && (
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/admin")}>
                      <Users className="h-5 w-5" />
                      <span className="text-xs">Users</span>
                    </Button>
                  )}
                  {permissions.can_manage_study_materials && (
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/admin")}>
                      <BookOpen className="h-5 w-5" />
                      <span className="text-xs">Materials</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* My Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                My Tasks ({myTasks.length})
              </CardTitle>
              <CardDescription>All tasks assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              {myTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No tasks yet</p>
                  <p className="text-sm">Tasks assigned to you will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myTasks.map(task => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{task.title}</p>
                              {task.category && (
                                <Badge variant="outline" className="text-[10px] mt-1 capitalize">{task.category}</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPriorityColor(task.priority)} className="capitalize text-xs">
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {task.due_date ? (
                              <span className={`text-sm ${task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed" ? "text-destructive font-medium" : ""}`}>
                                {format(new Date(task.due_date), "MMM dd, yyyy")}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">No deadline</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                              {task.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {task.status === "pending" && (
                                <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, "in_progress")}>
                                  Start
                                </Button>
                              )}
                              {task.status === "in_progress" && (
                                <Button size="sm" onClick={() => updateTaskStatus(task.id, "completed")}>
                                  Complete
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Log Tab */}
        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                My Time Log
              </CardTitle>
              <CardDescription>Your logged work hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">{weeklyHours.toFixed(1)}h</p>
                      <p className="text-sm text-muted-foreground">This Week</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{totalHours.toFixed(1)}h</p>
                      <p className="text-sm text-muted-foreground">Total Logged</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{timeLogs.length}</p>
                      <p className="text-sm text-muted-foreground">Time Entries</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {timeLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Timer className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No time logged</p>
                  <p className="text-sm">Your time entries will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Hours</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeLogs.slice(0, 10).map(log => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {format(new Date(log.logged_at), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="text-sm">
                            {log.description || "Work session"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{log.hours}h</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Tab */}
        <TabsContent value="leave">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                My Leave Requests
              </CardTitle>
              <CardDescription>Your leave history and pending requests</CardDescription>
            </CardHeader>
            <CardContent>
              {leaves.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarDays className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No leave requests</p>
                  <p className="text-sm">Your leave history will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaves.map(leave => (
                        <TableRow key={leave.id}>
                          <TableCell className="capitalize text-sm">
                            {leave.leave_type}
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(leave.start_date), "MMM dd")} - {format(new Date(leave.end_date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {leave.reason || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`text-xs ${
                                leave.status === "approved" ? "bg-success text-success-foreground" :
                                leave.status === "rejected" ? "bg-destructive text-destructive-foreground" :
                                "bg-warning text-warning-foreground"
                              }`}
                            >
                              {leave.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

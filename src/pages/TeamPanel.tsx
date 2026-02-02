import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import { useTasks } from "@/hooks/useTasks";
import { LayoutDashboard, ClipboardList, Calendar, Briefcase, Users, BookOpen, Bell, CheckCircle, Clock, Play, AlertCircle, Home, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function TeamPanel() {
  const navigate = useNavigate();
  const { permissions, teamMember, isLoading: permLoading, isCoreTeam } = useTeamPermissions();
  const [user, setUser] = useState<any>(null);
  const { tasks, isLoading: tasksLoading, updateTaskStatus, taskStats } = useTasks();

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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
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
              <ClipboardList className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{myTasks.length}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Tasks */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            My Tasks
          </CardTitle>
          <CardDescription>Tasks assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          {myTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No tasks assigned to you yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTasks.slice(0, 10).map(task => (
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

      {/* Quick Access based on permissions */}
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
    </div>
  );
}

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CRMTask } from "@/hooks/useTasks";
import { TaskComments } from "./TaskComments";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, User, Tag, Coins, CheckCircle2, AlertCircle, FileText, MessageSquare, Timer, Paperclip } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface TaskDetailModalProps {
  task: CRMTask | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}

export function TaskDetailModal({ task, isOpen, onClose, onStatusChange }: TaskDetailModalProps) {
  const [assignee, setAssignee] = useState<any>(null);
  const [subtasks, setSubtasks] = useState<CRMTask[]>([]);
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (task) {
      fetchAssignee();
      fetchSubtasks();
      fetchTimeLogs();
    }
  }, [task]);

  const fetchAssignee = async () => {
    if (!task?.assigned_to) return;
    const { data } = await supabase
      .from("student_profiles")
      .select("full_name, avatar_url, email")
      .eq("user_id", task.assigned_to)
      .single();
    setAssignee(data);
  };

  const fetchSubtasks = async () => {
    if (!task) return;
    const { data } = await supabase
      .from("crm_tasks")
      .select("*")
      .eq("parent_task_id", task.id)
      .order("created_at");
    setSubtasks(data || []);
  };

  const fetchTimeLogs = async () => {
    if (!task) return;
    const { data } = await supabase
      .from("time_logs")
      .select("*")
      .eq("task_id", task.id)
      .order("logged_at", { ascending: false });
    setTimeLogs(data || []);
  };

  if (!task) return null;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";
  const daysUntilDue = task.due_date ? differenceInDays(new Date(task.due_date), new Date()) : null;
  const totalLoggedHours = timeLogs.reduce((sum, log) => sum + log.hours, 0);
  const progress = task.estimated_hours ? Math.min((totalLoggedHours / task.estimated_hours) * 100, 100) : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success text-success-foreground";
      case "in_progress": return "bg-info text-info-foreground";
      case "review": return "bg-secondary text-secondary-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      default: return "bg-muted";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold mb-2">{task.title}</DialogTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant={getPriorityColor(task.priority)} className="capitalize">
                  {task.priority}
                </Badge>
                <Badge className={getStatusColor(task.status)}>
                  {task.status.replace("_", " ")}
                </Badge>
                {task.category && (
                  <Badge variant="outline" className="capitalize">
                    {task.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="details" className="gap-1.5 text-xs sm:text-sm">
              <FileText className="h-3.5 w-3.5" />
              Details
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-1.5 text-xs sm:text-sm">
              <MessageSquare className="h-3.5 w-3.5" />
              Discussion
            </TabsTrigger>
            <TabsTrigger value="time" className="gap-1.5 text-xs sm:text-sm">
              <Timer className="h-3.5 w-3.5" />
              Time Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Description */}
            {task.description && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Assignee:</span>
                  <span className="font-medium">{assignee?.full_name || "Unassigned"}</span>
                </div>
                
                {task.due_date && (
                  <div className={`flex items-center gap-2 text-sm ${isOverdue ? "text-destructive" : ""}`}>
                    <Calendar className="h-4 w-4" />
                    <span className="text-muted-foreground">Due:</span>
                    <span className="font-medium">{format(new Date(task.due_date), "MMM dd, yyyy")}</span>
                    {isOverdue && <AlertCircle className="h-4 w-4" />}
                    {!isOverdue && daysUntilDue !== null && (
                      <Badge variant="outline" className="text-xs">
                        {daysUntilDue === 0 ? "Today" : daysUntilDue === 1 ? "Tomorrow" : `${daysUntilDue}d left`}
                      </Badge>
                    )}
                  </div>
                )}

                {task.points_reward > 0 && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Coins className="h-4 w-4" />
                    <span>{task.points_reward} coins reward</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {task.estimated_hours && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Estimated:</span>
                    <span className="font-medium">{task.estimated_hours}h</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Logged:</span>
                  <span className="font-medium">{totalLoggedHours.toFixed(1)}h</span>
                </div>

                {task.tags && task.tags.length > 0 && (
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {task.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            {task.estimated_hours && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Subtasks */}
            {subtasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Subtasks ({subtasks.filter(s => s.status === "completed").length}/{subtasks.length})
                </h4>
                <div className="space-y-1">
                  {subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded">
                      <CheckCircle2 
                        className={`h-4 w-4 ${subtask.status === "completed" ? "text-success" : "text-muted-foreground"}`} 
                      />
                      <span className={subtask.status === "completed" ? "line-through text-muted-foreground" : ""}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              {task.status === "pending" && (
                <Button onClick={() => onStatusChange(task.id, "in_progress")}>
                  Start Task
                </Button>
              )}
              {task.status === "in_progress" && (
                <>
                  <Button variant="secondary" onClick={() => onStatusChange(task.id, "review")}>
                    Submit for Review
                  </Button>
                  <Button onClick={() => onStatusChange(task.id, "completed")}>
                    Mark Complete
                  </Button>
                </>
              )}
              {task.status === "review" && (
                <Button onClick={() => onStatusChange(task.id, "completed")}>
                  Approve & Complete
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <TaskComments taskId={task.id} taskTitle={task.title} />
          </TabsContent>

          <TabsContent value="time" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Time Entries</h4>
                <Badge variant="secondary">{totalLoggedHours.toFixed(1)}h total</Badge>
              </div>
              
              {timeLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Timer className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No time logged yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {timeLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{log.description || "Work session"}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.logged_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <Badge variant="secondary">{log.hours}h</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

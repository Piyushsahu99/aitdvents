import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTasks, CRMTask } from "@/hooks/useTasks";
import { Calendar, User, Coins, GripVertical, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const KANBAN_COLUMNS = [
  { id: "pending", title: "Pending", color: "bg-warning" },
  { id: "in_progress", title: "In Progress", color: "bg-info" },
  { id: "review", title: "Review", color: "bg-secondary" },
  { id: "completed", title: "Completed", color: "bg-success" },
];

interface KanbanCardProps {
  task: CRMTask;
  onStatusChange: (status: string) => void;
  getUserName: (id: string | null) => string;
}

function KanbanCard({ task, onStatusChange, getUserName }: KanbanCardProps) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Card 
      className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${isOverdue ? "border-destructive/50" : ""}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("taskId", task.id);
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm line-clamp-2 mb-2">{task.title}</p>
            
            <div className="flex flex-wrap gap-1.5 mb-2">
              <Badge variant={getPriorityColor(task.priority)} className="text-[10px] capitalize">
                {task.priority}
              </Badge>
              {task.category && (
                <Badge variant="outline" className="text-[10px] capitalize">
                  {task.category}
                </Badge>
              )}
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              {task.assigned_to && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="truncate">{getUserName(task.assigned_to)}</span>
                </div>
              )}
              {task.due_date && (
                <div className={`flex items-center gap-1 ${isOverdue ? "text-destructive" : ""}`}>
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(task.due_date), "MMM dd")}</span>
                  {isOverdue && <AlertCircle className="h-3 w-3" />}
                </div>
              )}
              {task.points_reward > 0 && (
                <div className="flex items-center gap-1 text-primary">
                  <Coins className="h-3 w-3" />
                  <span>{task.points_reward} coins</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface KanbanColumnProps {
  column: typeof KANBAN_COLUMNS[0];
  tasks: CRMTask[];
  onDrop: (taskId: string, status: string) => void;
  getUserName: (id: string | null) => string;
}

function KanbanColumn({ column, tasks, onDrop, getUserName }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onDrop(taskId, column.id);
    }
  };

  return (
    <div
      className={`flex flex-col min-w-[280px] max-w-[320px] bg-muted/30 rounded-lg p-3 transition-colors ${
        isDragOver ? "bg-muted/60 ring-2 ring-primary/20" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${column.color}`} />
        <h3 className="font-semibold text-sm">{column.title}</h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          {tasks.length}
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-2">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No tasks
            </div>
          ) : (
            tasks.map(task => (
              <KanbanCard
                key={task.id}
                task={task}
                onStatusChange={(status) => onDrop(task.id, status)}
                getUserName={getUserName}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function TaskKanban() {
  const { tasks, updateTaskStatus } = useTasks();
  const [users, setUsers] = useState<any[]>([]);

  // Fetch users for display
  useState(() => {
    const fetchUsers = async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.from("student_profiles").select("user_id, full_name, email");
      setUsers(data || []);
    };
    fetchUsers();
  });

  const getUserName = (userId: string | null) => {
    if (!userId) return "Unassigned";
    const user = users.find(u => u.user_id === userId);
    return user?.full_name || user?.email || "Unknown";
  };

  const handleDrop = async (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      await updateTaskStatus(taskId, newStatus);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          Task Board
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getTasksByStatus(column.id)}
              onDrop={handleDrop}
              getUserName={getUserName}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

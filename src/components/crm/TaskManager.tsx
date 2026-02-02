import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useTasks, CRMTask } from "@/hooks/useTasks";
import { Plus, Edit, Trash2, Clock, CheckCircle2, AlertCircle, Play, Eye, Calendar, User, Tag, Coins } from "lucide-react";
import { format } from "date-fns";

const PRIORITIES = ["low", "medium", "high", "urgent"];
const STATUSES = ["pending", "in_progress", "review", "completed", "cancelled"];
const CATEGORIES = ["development", "design", "marketing", "content", "operations", "support", "other"];

export function TaskManager() {
  const { tasks, isLoading, createTask, updateTask, deleteTask, updateTaskStatus } = useTasks();
  const [users, setUsers] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CRMTask | null>(null);
  const [filter, setFilter] = useState({ status: "all", priority: "all" });
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "medium",
    category: "",
    due_date: "",
    estimated_hours: "",
    points_reward: "0",
    tags: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from("student_profiles").select("user_id, full_name, email");
    setUsers(data || []);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      assigned_to: "",
      priority: "medium",
      category: "",
      due_date: "",
      estimated_hours: "",
      points_reward: "0",
      tags: "",
    });
  };

  const handleCreate = async () => {
    await createTask({
      title: formData.title,
      description: formData.description || null,
      assigned_to: formData.assigned_to || null,
      priority: formData.priority,
      category: formData.category || null,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
      points_reward: parseInt(formData.points_reward) || 0,
      tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : null,
    });
    resetForm();
    setIsCreateOpen(false);
  };

  const handleEdit = async () => {
    if (!editingTask) return;
    await updateTask(editingTask.id, {
      title: formData.title,
      description: formData.description || null,
      assigned_to: formData.assigned_to || null,
      priority: formData.priority,
      category: formData.category || null,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
      points_reward: parseInt(formData.points_reward) || 0,
      tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : null,
    });
    setEditingTask(null);
    resetForm();
  };

  const openEdit = (task: CRMTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      assigned_to: task.assigned_to || "",
      priority: task.priority,
      category: task.category || "",
      due_date: task.due_date ? format(new Date(task.due_date), "yyyy-MM-dd") : "",
      estimated_hours: task.estimated_hours?.toString() || "",
      points_reward: task.points_reward.toString(),
      tags: task.tags?.join(", ") || "",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success text-success-foreground";
      case "in_progress": return "bg-info text-info-foreground";
      case "review": return "bg-secondary text-secondary-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "cancelled": return "bg-muted text-muted-foreground";
      default: return "";
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter.status !== "all" && task.status !== filter.status) return false;
    if (filter.priority !== "all" && task.priority !== filter.priority) return false;
    return true;
  });

  const getUserName = (userId: string | null) => {
    if (!userId) return "Unassigned";
    const user = users.find(u => u.user_id === userId);
    return user?.full_name || user?.email || "Unknown";
  };

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === "completed" || status === "cancelled") return false;
    return new Date(dueDate) < new Date();
  };

  const TaskForm = () => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Title *</Label>
        <Input 
          value={formData.title} 
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="Task title"
        />
      </div>
      <div className="grid gap-2">
        <Label>Description</Label>
        <Textarea 
          value={formData.description} 
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed description"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Assign To</Label>
          <Select value={formData.assigned_to} onValueChange={v => setFormData({ ...formData, assigned_to: v })}>
            <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.user_id} value={user.user_id}>
                  {user.full_name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Priority</Label>
          <Select value={formData.priority} onValueChange={v => setFormData({ ...formData, priority: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRIORITIES.map(p => (
                <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Due Date</Label>
          <Input 
            type="date"
            value={formData.due_date} 
            onChange={e => setFormData({ ...formData, due_date: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Estimated Hours</Label>
          <Input 
            type="number"
            value={formData.estimated_hours} 
            onChange={e => setFormData({ ...formData, estimated_hours: e.target.value })}
            placeholder="e.g., 4"
          />
        </div>
        <div className="grid gap-2">
          <Label>Points Reward</Label>
          <Input 
            type="number"
            value={formData.points_reward} 
            onChange={e => setFormData({ ...formData, points_reward: e.target.value })}
            placeholder="e.g., 10"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Tags (comma-separated)</Label>
        <Input 
          value={formData.tags} 
          onChange={e => setFormData({ ...formData, tags: e.target.value })}
          placeholder="e.g., urgent, frontend, bug-fix"
        />
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl">Task Manager</CardTitle>
            <CardDescription>Create and manage tasks for your team</CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={resetForm}>
                <Plus className="h-4 w-4" /> New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Add a new task and assign it to a team member</DialogDescription>
              </DialogHeader>
              <TaskForm />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={!formData.title}>Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Select value={filter.status} onValueChange={v => setFilter({ ...filter, status: v })}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map(s => (
                <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filter.priority} onValueChange={v => setFilter({ ...filter, priority: v })}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              {PRIORITIES.map(p => (
                <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tasks Table */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead className="hidden md:table-cell">Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Priority</TableHead>
                <TableHead className="hidden lg:table-cell">Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No tasks found. Create your first task!
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map(task => (
                  <TableRow key={task.id} className={isOverdue(task.due_date, task.status) ? "bg-destructive/5" : ""}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm line-clamp-1">{task.title}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground md:hidden">
                          <User className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">{getUserName(task.assigned_to)}</span>
                        </div>
                        {task.points_reward > 0 && (
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <Coins className="h-3 w-3" />
                            <span>{task.points_reward} coins</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm">{getUserName(task.assigned_to)}</span>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={task.status} 
                        onValueChange={v => updateTaskStatus(task.id, v)}
                      >
                        <SelectTrigger className={`w-[110px] h-7 text-xs ${getStatusColor(task.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => (
                            <SelectItem key={s} value={s} className="capitalize text-xs">
                              {s.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={getPriorityColor(task.priority)} className="capitalize text-xs">
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {task.due_date ? (
                        <div className={`flex items-center gap-1 text-xs ${isOverdue(task.due_date, task.status) ? "text-destructive" : ""}`}>
                          <Calendar className="h-3 w-3" />
                          {format(new Date(task.due_date), "MMM dd, yyyy")}
                          {isOverdue(task.due_date, task.status) && <AlertCircle className="h-3 w-3" />}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No deadline</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(task)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteTask(task.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={open => !open && setEditingTask(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>
          <TaskForm />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditingTask(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={!formData.title}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ClipboardList, Star } from "lucide-react";

interface Task {
  id: string;
  cycle_id: string | null;
  title: string;
  description: string;
  task_type: string;
  points: number;
  difficulty: string;
  max_completions: number | null;
  deadline: string | null;
  instructions: string | null;
  required_proof: string[];
  is_active: boolean;
  priority: number;
}

interface Cycle {
  id: string;
  name: string;
  is_active: boolean;
}

const TASK_TYPES = [
  { value: "team_building", label: "Team Building" },
  { value: "recruitment", label: "Recruitment" },
  { value: "event", label: "Event" },
  { value: "social", label: "Social Media" },
  { value: "content", label: "Content Creation" },
  { value: "engagement", label: "Engagement" },
  { value: "general", label: "General" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy", color: "bg-green-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "hard", label: "Hard", color: "bg-red-500" },
];

const PROOF_TYPES = [
  { value: "report", label: "Written Report" },
  { value: "images", label: "Images/Photos" },
  { value: "screenshot", label: "Screenshots" },
  { value: "link", label: "External Links" },
  { value: "document", label: "Documents" },
];

export function AmbassadorTaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedCycleFilter, setSelectedCycleFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    cycle_id: "",
    title: "",
    description: "",
    task_type: "general",
    points: 10,
    difficulty: "easy",
    max_completions: 1,
    deadline: "",
    instructions: "",
    required_proof: [] as string[],
    is_active: true,
    priority: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, cyclesRes] = await Promise.all([
        supabase.from("ambassador_tasks").select("*").order("priority", { ascending: true }),
        supabase.from("ambassador_program_cycles").select("id, name, is_active").order("start_date", { ascending: false }),
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (cyclesRes.error) throw cyclesRes.error;

      setTasks(tasksRes.data || []);
      setCycles(cyclesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      ...formData,
      cycle_id: formData.cycle_id || null,
      deadline: formData.deadline || null,
      max_completions: formData.max_completions || null,
    };

    try {
      if (editingTask) {
        const { error } = await supabase
          .from("ambassador_tasks")
          .update(taskData)
          .eq("id", editingTask.id);

        if (error) throw error;
        toast.success("Task updated successfully");
      } else {
        const { error } = await supabase
          .from("ambassador_tasks")
          .insert([taskData]);

        if (error) throw error;
        toast.success("Task created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task");
    }
  };

  const resetForm = () => {
    setFormData({
      cycle_id: "",
      title: "",
      description: "",
      task_type: "general",
      points: 10,
      difficulty: "easy",
      max_completions: 1,
      deadline: "",
      instructions: "",
      required_proof: [],
      is_active: true,
      priority: 0,
    });
    setEditingTask(null);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      cycle_id: task.cycle_id || "",
      title: task.title,
      description: task.description,
      task_type: task.task_type,
      points: task.points,
      difficulty: task.difficulty,
      max_completions: task.max_completions || 1,
      deadline: task.deadline ? task.deadline.split("T")[0] : "",
      instructions: task.instructions || "",
      required_proof: task.required_proof || [],
      is_active: task.is_active,
      priority: task.priority,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const { error } = await supabase
        .from("ambassador_tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;
      toast.success("Task deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const toggleProof = (proof: string) => {
    setFormData((prev) => ({
      ...prev,
      required_proof: prev.required_proof.includes(proof)
        ? prev.required_proof.filter((p) => p !== proof)
        : [...prev.required_proof, proof],
    }));
  };

  const filteredTasks = selectedCycleFilter === "all"
    ? tasks
    : tasks.filter((t) => t.cycle_id === selectedCycleFilter);

  const getDifficultyBadge = (difficulty: string) => {
    const diff = DIFFICULTIES.find((d) => d.value === difficulty);
    return <Badge className={diff?.color}>{diff?.label || difficulty}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Ambassador Tasks
        </CardTitle>
        <div className="flex gap-2">
          <Select value={selectedCycleFilter} onValueChange={setSelectedCycleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by cycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cycles</SelectItem>
              {cycles.map((cycle) => (
                <SelectItem key={cycle.id} value={cycle.id}>
                  {cycle.name} {cycle.is_active && "(Active)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? "Edit Task" : "Create Task"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">Task Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Build Your Core Team"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cycle_id">Program Cycle</Label>
                    <Select
                      value={formData.cycle_id}
                      onValueChange={(value) => setFormData({ ...formData, cycle_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cycle (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {cycles.map((cycle) => (
                          <SelectItem key={cycle.id} value={cycle.id}>
                            {cycle.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="task_type">Task Type</Label>
                    <Select
                      value={formData.task_type}
                      onValueChange={(value) => setFormData({ ...formData, task_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TASK_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      min={1}
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 10 })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTIES.map((diff) => (
                          <SelectItem key={diff.value} value={diff.value}>
                            {diff.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="max_completions">Max Completions</Label>
                    <Input
                      id="max_completions"
                      type="number"
                      min={1}
                      value={formData.max_completions}
                      onChange={(e) => setFormData({ ...formData, max_completions: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="deadline">Deadline (Optional)</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed task description..."
                      rows={3}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      placeholder="Step-by-step instructions..."
                      rows={4}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Required Proof</Label>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {PROOF_TYPES.map((proof) => (
                        <div key={proof.value} className="flex items-center gap-2">
                          <Checkbox
                            id={proof.value}
                            checked={formData.required_proof.includes(proof.value)}
                            onCheckedChange={() => toggleProof(proof.value)}
                          />
                          <Label htmlFor={proof.value} className="cursor-pointer">
                            {proof.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority (lower = higher)</Label>
                    <Input
                      id="priority"
                      type="number"
                      min={0}
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTask ? "Update" : "Create"} Task
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tasks found. Create your first task to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {task.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {TASK_TYPES.find((t) => t.value === task.task_type)?.label || task.task_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {task.points}
                    </div>
                  </TableCell>
                  <TableCell>{getDifficultyBadge(task.difficulty)}</TableCell>
                  <TableCell>
                    <Badge variant={task.is_active ? "default" : "secondary"}>
                      {task.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(task)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(task.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

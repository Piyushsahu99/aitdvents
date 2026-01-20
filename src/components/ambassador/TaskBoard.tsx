import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ClipboardList, Star, Clock, CheckCircle, Upload } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  task_type: string;
  points: number;
  difficulty: string;
  deadline: string | null;
  instructions: string | null;
  required_proof: string[];
}

interface TaskBoardProps {
  ambassadorId: string;
}

export function TaskBoard({ ambassadorId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    report_title: "",
    report_content: "",
    proof_links: "",
  });

  useEffect(() => {
    fetchData();
  }, [ambassadorId]);

  const fetchData = async () => {
    try {
      const [tasksRes, submissionsRes] = await Promise.all([
        supabase.from("ambassador_tasks").select("*").eq("is_active", true).order("priority"),
        supabase.from("ambassador_task_submissions").select("task_id").eq("ambassador_id", ambassadorId),
      ]);

      if (tasksRes.error) throw tasksRes.error;
      setTasks(tasksRes.data || []);
      setSubmissions(submissionsRes.data?.map((s) => s.task_id) || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTask) return;
    setSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("ambassador_task_submissions").insert({
        task_id: selectedTask.id,
        ambassador_id: ambassadorId,
        submitted_by_user_id: userData.user?.id,
        report_title: formData.report_title,
        report_content: formData.report_content,
        proof_links: formData.proof_links.split("\n").filter(Boolean),
      });

      if (error) throw error;
      toast.success("Task submitted for review!");
      setIsSubmitOpen(false);
      setFormData({ report_title: "", report_content: "", proof_links: "" });
      fetchData();
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("Failed to submit task");
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) return <div className="text-center py-8">Loading tasks...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Available Tasks
        </h3>
        <Badge variant="outline">{tasks.length} tasks</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {tasks.map((task) => {
          const isSubmitted = submissions.includes(task.id);
          return (
            <Card key={task.id} className={isSubmitted ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{task.title}</CardTitle>
                  <div className="flex gap-1">
                    <Badge className={getDifficultyColor(task.difficulty)}>{task.difficulty}</Badge>
                    <Badge variant="outline"><Star className="h-3 w-3 mr-1" />{task.points}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
                {task.deadline && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                    <Clock className="h-3 w-3" /> Due: {new Date(task.deadline).toLocaleDateString()}
                  </p>
                )}
                {isSubmitted ? (
                  <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Submitted</Badge>
                ) : (
                  <Dialog open={isSubmitOpen && selectedTask?.id === task.id} onOpenChange={(open) => {
                    setIsSubmitOpen(open);
                    if (open) setSelectedTask(task);
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => setSelectedTask(task)}>
                        <Upload className="h-4 w-4 mr-1" />Submit Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Submit: {task.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {task.instructions && (
                          <div className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">{task.instructions}</div>
                        )}
                        <div>
                          <Label>Report Title</Label>
                          <Input
                            value={formData.report_title}
                            onChange={(e) => setFormData({ ...formData, report_title: e.target.value })}
                            placeholder="Brief title for your submission"
                          />
                        </div>
                        <div>
                          <Label>Report Content</Label>
                          <Textarea
                            value={formData.report_content}
                            onChange={(e) => setFormData({ ...formData, report_content: e.target.value })}
                            placeholder="Describe what you did, include data and metrics..."
                            rows={5}
                          />
                        </div>
                        <div>
                          <Label>Proof Links (one per line)</Label>
                          <Textarea
                            value={formData.proof_links}
                            onChange={(e) => setFormData({ ...formData, proof_links: e.target.value })}
                            placeholder="https://..."
                            rows={3}
                          />
                        </div>
                        <Button onClick={handleSubmit} disabled={submitting || !formData.report_title || !formData.report_content}>
                          {submitting ? "Submitting..." : "Submit Task"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

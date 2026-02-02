import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CRMTask {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  assigned_by: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  category: string | null;
  tags: string[] | null;
  points_reward: number;
  attachments: string[] | null;
  parent_task_id: string | null;
  recurring: boolean;
  recurrence_pattern: any;
  created_at: string;
  updated_at: string;
}

export function useTasks(filterAssignedTo?: string) {
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, [filterAssignedTo]);

  const fetchTasks = async () => {
    try {
      let query = supabase
        .from("crm_tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterAssignedTo) {
        query = query.eq("assigned_to", filterAssignedTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (task: { title: string } & Partial<Omit<CRMTask, 'title'>>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("crm_tasks")
        .insert([{ ...task, assigned_by: user.id }])
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Success", description: "Task created successfully" });
      await fetchTasks();
      return data;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<CRMTask>) => {
    try {
      const { error } = await supabase
        .from("crm_tasks")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Success", description: "Task updated" });
      await fetchTasks();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from("crm_tasks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Success", description: "Task deleted" });
      await fetchTasks();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateTaskStatus = async (id: string, status: string) => {
    const updates: Partial<CRMTask> = { status };
    
    if (status === "in_progress" && !tasks.find(t => t.id === id)?.started_at) {
      updates.started_at = new Date().toISOString();
    }
    
    if (status === "completed") {
      updates.completed_at = new Date().toISOString();
    }

    await updateTask(id, updates);
  };

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    review: tasks.filter(t => t.status === "review").length,
    completed: tasks.filter(t => t.status === "completed").length,
    overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed").length,
  };

  return {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    taskStats,
    refetch: fetchTasks,
  };
}

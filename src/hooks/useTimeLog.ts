import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TimeLog {
  id: string;
  task_id: string;
  user_id: string;
  hours: number;
  description: string | null;
  logged_at: string;
  created_at: string;
}

export function useTimeLog(filterTaskId?: string, filterMemberId?: string) {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTimeLogs();
  }, [filterTaskId, filterMemberId]);

  const fetchTimeLogs = async () => {
    try {
      let query = supabase
        .from("time_logs")
        .select("*")
        .order("logged_at", { ascending: false });

      if (filterTaskId) {
        query = query.eq("task_id", filterTaskId);
      }
      if (filterMemberId) {
        query = query.eq("user_id", filterMemberId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTimeLogs((data as TimeLog[]) || []);
    } catch (error: any) {
      console.error("Error fetching time logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTimeLog = async (log: { 
    task_id: string; 
    user_id: string;
    hours: number; 
    description?: string | null;
    logged_at?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from("time_logs")
        .insert([{
          task_id: log.task_id,
          user_id: log.user_id,
          hours: log.hours,
          description: log.description || null,
          logged_at: log.logged_at || new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      toast({ title: "Success", description: "Time logged successfully" });
      await fetchTimeLogs();
      return data;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
  };

  const updateTimeLog = async (id: string, updates: Partial<TimeLog>) => {
    try {
      const { error } = await supabase
        .from("time_logs")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Time log updated" });
      await fetchTimeLogs();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteTimeLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from("time_logs")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Time log deleted" });
      await fetchTimeLogs();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Calculate stats
  const totalHours = timeLogs.reduce((sum, log) => sum + log.hours, 0);
  const thisWeekLogs = timeLogs.filter(log => {
    const logDate = new Date(log.logged_at);
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    return logDate >= weekStart;
  });
  const weeklyHours = thisWeekLogs.reduce((sum, log) => sum + log.hours, 0);

  return {
    timeLogs,
    isLoading,
    createTimeLog,
    updateTimeLog,
    deleteTimeLog,
    totalHours,
    weeklyHours,
    refetch: fetchTimeLogs,
  };
}

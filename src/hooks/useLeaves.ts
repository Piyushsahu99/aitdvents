import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TeamLeave {
  id: string;
  team_member_id: string | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useLeaves(filterMemberId?: string) {
  const [leaves, setLeaves] = useState<TeamLeave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaves();
  }, [filterMemberId]);

  const fetchLeaves = async () => {
    try {
      let query = supabase
        .from("team_leaves")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterMemberId) {
        query = query.eq("team_member_id", filterMemberId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLeaves(data || []);
    } catch (error: any) {
      console.error("Error fetching leaves:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createLeave = async (leave: {
    team_member_id: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason?: string | null;
  }) => {
    try {
      const { data, error } = await supabase
        .from("team_leaves")
        .insert([leave])
        .select()
        .single();

      if (error) throw error;
      toast({ title: "Success", description: "Leave request submitted" });
      await fetchLeaves();
      return data;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
  };

  const updateLeave = async (id: string, updates: Partial<TeamLeave>) => {
    try {
      const { error } = await supabase
        .from("team_leaves")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Leave updated" });
      await fetchLeaves();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const approveLeave = async (id: string, approverId: string) => {
    try {
      const { error } = await supabase
        .from("team_leaves")
        .update({ 
          status: "approved",
          approved_by: approverId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Leave approved" });
      await fetchLeaves();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const rejectLeave = async (id: string, approverId: string) => {
    try {
      const { error } = await supabase
        .from("team_leaves")
        .update({ 
          status: "rejected",
          approved_by: approverId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Leave rejected" });
      await fetchLeaves();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteLeave = async (id: string) => {
    try {
      const { error } = await supabase
        .from("team_leaves")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Leave request deleted" });
      await fetchLeaves();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Stats
  const pendingCount = leaves.filter(l => l.status === "pending").length;
  const approvedCount = leaves.filter(l => l.status === "approved").length;
  const rejectedCount = leaves.filter(l => l.status === "rejected").length;

  return {
    leaves,
    isLoading,
    createLeave,
    updateLeave,
    approveLeave,
    rejectLeave,
    deleteLeave,
    pendingCount,
    approvedCount,
    rejectedCount,
    refetch: fetchLeaves,
  };
}

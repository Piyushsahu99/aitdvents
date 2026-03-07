import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminAuthState {
  isAdmin: boolean;
  isCoreTeam: boolean;
  isModerator: boolean;
  isLoading: boolean;
  userId: string | null;
  userRoles: string[];
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    isCoreTeam: false,
    isModerator: false,
    isLoading: true,
    userId: null,
    userRoles: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;

      const userRoles = roles?.map(r => r.role) || [];
      const isAdmin = userRoles.includes("admin");
      const isCoreTeam = userRoles.includes("core_team") || isAdmin;
      const isModerator = userRoles.includes("moderator") || isCoreTeam;

      if (!isModerator) {
        toast.error("Access Denied", {
          description: "You don't have permission to access the admin panel",
        });
        navigate("/");
        return;
      }

      setState({
        isAdmin,
        isCoreTeam,
        isModerator,
        isLoading: false,
        userId: user.id,
        userRoles,
      });
    } catch (error) {
      console.error("Error checking admin status:", error);
      toast.error("Authentication Error", {
        description: "Failed to verify admin access",
      });
      navigate("/auth");
    }
  };

  return state;
}

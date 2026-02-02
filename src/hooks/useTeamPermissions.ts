import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TeamPermissions {
  can_manage_events: boolean;
  can_manage_jobs: boolean;
  can_manage_hackathons: boolean;
  can_manage_bounties: boolean;
  can_manage_scholarships: boolean;
  can_manage_reels: boolean;
  can_manage_store: boolean;
  can_manage_study_materials: boolean;
  can_view_users: boolean;
  can_assign_tasks: boolean;
  can_view_analytics: boolean;
  can_send_announcements: boolean;
}

export interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role_title: string | null;
  department: string | null;
  avatar_url: string | null;
  join_date: string;
  status: string;
  reporting_to: string | null;
  notes: string | null;
}

export function useTeamPermissions() {
  const [permissions, setPermissions] = useState<TeamPermissions | null>(null);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCoreTeam, setIsCoreTeam] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Check if user is core team
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "core_team")
        .maybeSingle();

      if (roleData) {
        setIsCoreTeam(true);

        // Get team member info
        const { data: memberData } = await supabase
          .from("team_members")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (memberData) {
          setTeamMember(memberData as TeamMember);

          // Get permissions
          const { data: permData } = await supabase
            .from("team_permissions")
            .select("*")
            .eq("team_member_id", memberData.id)
            .maybeSingle();

          if (permData) {
            setPermissions({
              can_manage_events: permData.can_manage_events || false,
              can_manage_jobs: permData.can_manage_jobs || false,
              can_manage_hackathons: permData.can_manage_hackathons || false,
              can_manage_bounties: permData.can_manage_bounties || false,
              can_manage_scholarships: permData.can_manage_scholarships || false,
              can_manage_reels: permData.can_manage_reels || false,
              can_manage_store: permData.can_manage_store || false,
              can_manage_study_materials: permData.can_manage_study_materials || false,
              can_view_users: permData.can_view_users || false,
              can_assign_tasks: permData.can_assign_tasks || false,
              can_view_analytics: permData.can_view_analytics || false,
              can_send_announcements: permData.can_send_announcements || false,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching team permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { permissions, teamMember, isLoading, isCoreTeam, refetch: fetchPermissions };
}

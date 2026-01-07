import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Points awarded for various actions
export const POINT_VALUES = {
  EVENT_REGISTER: 5,
  EVENT_SUBMIT: 5,
  JOB_SUBMIT: 10,
  REEL_UPLOAD: 10,
  REEL_LIKE: 1,
  STUDY_MATERIAL_UPLOAD: 15,
  COURSE_ENROLL: 10,
  COURSE_COMPLETE: 25,
  PROFILE_COMPLETE: 15,
  REFERRAL: 25,
  DAILY_LOGIN: 5,
  PRODUCT_LIST: 5,
  BOUNTY_SUBMIT: 20,
  HACKATHON_REGISTER: 10,
};

export function useEarnCoins() {
  const { toast } = useToast();

  const earnCoins = async (
    amount: number,
    actionType: string,
    description: string,
    referenceId?: string
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Use the secure earn_points RPC function
      // The server validates action types and sets fixed point values
      // The amount parameter is kept for backwards compatibility but ignored by server
      const { data, error } = await supabase.rpc("earn_points", {
        p_action_type: actionType.toLowerCase(),
        p_description: description,
        p_reference_id: referenceId || null,
      });

      if (error) throw error;

      // Show success toast with coin animation effect
      // Use the amount from POINT_VALUES for display (server enforces same values)
      toast({
        title: `+${amount} AITD Coins! 🪙`,
        description: description,
      });

      return true;
    } catch (error) {
      console.error("Error earning coins:", error);
      return false;
    }
  };

  return { earnCoins, POINT_VALUES };
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, UserCircle, ArrowRight, X } from "lucide-react";

export function ProfileCompletionPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setHasChecked(true);
        return;
      }

      // Check if user has dismissed this popup before (stored in localStorage)
      const dismissedKey = `profile_popup_dismissed_${session.user.id}`;
      const dismissed = localStorage.getItem(dismissedKey);
      
      if (dismissed) {
        setHasChecked(true);
        return;
      }

      // Check if profile exists and is complete
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("full_name, college, skills, is_public")
        .eq("user_id", session.user.id)
        .maybeSingle();

      // Show popup if profile doesn't exist or is incomplete
      const isIncomplete = !profile || 
        !profile.full_name || 
        !profile.college || 
        !profile.skills || 
        profile.skills.length === 0;

      if (isIncomplete) {
        // Small delay to not interfere with page load
        setTimeout(() => setIsOpen(true), 1500);
      }

      setHasChecked(true);
    } catch (error) {
      console.error("Error checking profile:", error);
      setHasChecked(true);
    }
  };

  const handleDismiss = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      localStorage.setItem(`profile_popup_dismissed_${session.user.id}`, "true");
    }
    setIsOpen(false);
  };

  const handleCompleteProfile = () => {
    setIsOpen(false);
    navigate("/profile");
  };

  if (!hasChecked) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-primary/20">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            Join Our Student Network! 🎓
          </DialogTitle>
          <DialogDescription className="text-base">
            Complete your profile to connect with fellow students, find team members for hackathons, and get discovered by recruiters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <UserCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Get Discovered</p>
                <p className="text-xs text-muted-foreground">Appear in the student network and let others find you</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Find Teammates</p>
                <p className="text-xs text-muted-foreground">Connect with students having complementary skills</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleCompleteProfile}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              Complete Profile
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Takes less than 2 minutes to complete
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

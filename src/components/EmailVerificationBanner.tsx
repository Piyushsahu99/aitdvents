import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, AlertTriangle, RefreshCw } from "lucide-react";

interface EmailVerificationBannerProps {
  email: string;
  onVerified?: () => void;
}

export function EmailVerificationBanner({ email, onVerified }: EmailVerificationBannerProps) {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const resendVerificationEmail = async () => {
    setSending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verified=true`,
        },
      });

      if (error) throw error;

      toast({
        title: "Verification email sent!",
        description: "Please check your inbox and click the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 p-2 rounded-full bg-amber-500/20">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-amber-700 dark:text-amber-400">
            Verify your email
          </h3>
          <p className="text-sm text-amber-600/80 dark:text-amber-300/80 mt-1">
            We sent a verification link to <strong className="break-all">{email}</strong>. 
            Please check your inbox and verify your email to access all features.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={resendVerificationEmail}
              disabled={sending}
              className="border-amber-500/30 text-amber-700 hover:bg-amber-500/10"
            >
              {sending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Resend email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

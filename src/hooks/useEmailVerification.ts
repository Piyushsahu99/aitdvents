import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface UseEmailVerificationResult {
  user: User | null;
  isEmailVerified: boolean;
  isLoading: boolean;
  checkVerification: () => Promise<void>;
}

export function useEmailVerification(): UseEmailVerificationResult {
  const [user, setUser] = useState<User | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkVerification = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setUser(null);
        setIsEmailVerified(false);
        setIsLoading(false);
        return;
      }

      setUser(session.user);
      
      // Check if email is confirmed
      const emailConfirmed = !!session.user.email_confirmed_at;
      setIsEmailVerified(emailConfirmed);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking verification:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkVerification();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          setIsEmailVerified(!!session.user.email_confirmed_at);
        } else {
          setUser(null);
          setIsEmailVerified(false);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    isEmailVerified,
    isLoading,
    checkVerification,
  };
}

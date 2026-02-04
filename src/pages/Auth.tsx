import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import logo from "@/assets/aitd-logo.png";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { 
  Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Shield, 
  ArrowLeft, RefreshCw, CheckCircle, AlertCircle, User, 
  Rocket, Trophy, Users, Zap, Timer
} from "lucide-react";

// List of common disposable/temporary email domains to block
const disposableEmailDomains = [
  "tempmail.com", "temp-mail.org", "guerrillamail.com", "10minutemail.com",
  "mailinator.com", "throwaway.email", "fakeinbox.com", "trashmail.com",
  "tempail.com", "getnada.com", "mohmal.com", "emailondeck.com",
  "dispostable.com", "yopmail.com", "maildrop.cc", "mailnesia.com",
  "tempr.email", "discard.email", "fakemailgenerator.com", "tempinbox.com",
  "spamgourmet.com", "mytemp.email", "throwawaymail.com", "mintemail.com",
  "tempmailo.com", "burnermail.io", "mailcatch.com", "mailsac.com"
];

// List of valid/common email domains (for educational/professional use)
const trustedEmailDomains = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com",
  "icloud.com", "protonmail.com", "zoho.com", "aol.com", "mail.com",
  "edu", "ac.in", "edu.in", "org", "gov.in"
];

const isDisposableEmail = (email: string): boolean => {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return true;
  return disposableEmailDomains.some(d => domain.includes(d));
};

const isValidEmailDomain = (email: string): boolean => {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  
  // Check for educational domains
  if (domain.endsWith(".edu") || domain.endsWith(".ac.in") || domain.endsWith(".edu.in")) {
    return true;
  }
  
  // Check trusted domains
  return trustedEmailDomains.some(d => domain.endsWith(d));
};

const authSchema = z.object({
  email: z.string()
    .email("Invalid email address")
    .max(255)
    .refine(email => !isDisposableEmail(email), {
      message: "Temporary/disposable emails are not allowed. Please use a valid email."
    })
    .refine(email => isValidEmailDomain(email), {
      message: "Please use a valid email from a trusted provider (Gmail, Outlook, Yahoo, etc.)"
    }),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

const emailOnlySchema = z.object({
  email: z.string()
    .email("Invalid email address")
    .max(255)
    .refine(email => !isDisposableEmail(email), {
      message: "Temporary/disposable emails are not allowed."
    })
    .refine(email => isValidEmailDomain(email), {
      message: "Please use a valid email from a trusted provider."
    }),
});

// Feature items for the left panel
const features = [
  { icon: Rocket, text: "Access 500+ curated opportunities", delay: "0s" },
  { icon: Trophy, text: "Win bounties & hackathons", delay: "0.1s" },
  { icon: Users, text: "Connect with top recruiters", delay: "0.2s" },
  { icon: Zap, text: "Build your professional network", delay: "0.3s" },
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const adminInviteCode = searchParams.get("admin_invite");
  const referralCode = searchParams.get("ref");
  const isResetFlow = searchParams.get("reset") === "true";
  const isVerifiedFlow = searchParams.get("verified") === "true";
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(!adminInviteCode && !referralCode);
  const [showPassword, setShowPassword] = useState(false);
  const [isValidAdminInvite, setIsValidAdminInvite] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "team" | "admin">("student");
  const [showVerificationPending, setShowVerificationPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [showVerificationError, setShowVerificationError] = useState(false);
  const [verificationErrorMessage, setVerificationErrorMessage] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Countdown timer for resend functionality
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  useEffect(() => {
    // Check for recovery token in URL hash fragment (Supabase sends type=recovery in hash)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('type') === 'recovery') {
      setShowResetPassword(true);
      // Clean up URL to prevent issues on refresh
      window.history.replaceState({}, '', '/auth');
    }

    checkSession();
    if (adminInviteCode) {
      validateAdminInvite();
    }
    if (isResetFlow) {
      setShowResetPassword(true);
    }
    if (isVerifiedFlow) {
      toast({
        title: "Email verified!",
        description: "Your email has been verified. You can now access all features.",
      });
    }
    // Handle verification errors from URL
    if (errorCode || errorDescription) {
      const errorMsg = errorDescription?.replace(/\+/g, " ") || "Verification link has expired or is invalid";
      if (errorCode === "otp_expired" || errorDescription?.includes("expired") || errorDescription?.includes("token")) {
        setVerificationErrorMessage("Your verification link has expired. Please request a new one.");
      } else {
        setVerificationErrorMessage(errorMsg);
      }
      setShowVerificationError(true);
    }

    // Listen for PASSWORD_RECOVERY auth event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true);
        // Clean up URL
        window.history.replaceState({}, '', '/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [adminInviteCode, isResetFlow, isVerifiedFlow, errorCode, errorDescription]);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("college")
        .eq("user_id", session.user.id)
        .maybeSingle();

      const { data: isAdmin } = await supabase.rpc("is_admin");
      
      if (isAdmin) {
        navigate("/admin");
      } else if (!profile || !profile.college) {
        navigate("/complete-profile");
      } else {
        navigate("/");
      }
    }
  };

  const validateAdminInvite = async () => {
    if (!adminInviteCode) return;
    
    try {
      const { data } = await supabase.rpc("validate_admin_invite", {
        invite_code_input: adminInviteCode,
      });
      setIsValidAdminInvite(!!data);
      if (!data) {
        toast({
          title: "Invalid Invite",
          description: "This admin invite link is invalid or expired.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsValidAdminInvite(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      emailOnlySchema.parse({ email });

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast({
        title: "Reset email sent!",
        description: "Check your inbox for the password reset link.",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid Email",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to send reset email",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure both passwords are the same.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Password too short",
          description: "Password must be at least 6 characters.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast({
        title: "Password updated!",
        description: "Your password has been reset successfully. Please login.",
      });
      
      setShowResetPassword(false);
      setPassword("");
      setConfirmPassword("");
      setIsLogin(true);
      navigate("/auth", { replace: true });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      authSchema.parse({ email, password });

      if (!isLogin) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          if (error.message?.includes("already registered") || error.status === 422) {
            setIsLogin(true);
            toast({
              title: "Account exists",
              description: "You already have an account. Please sign in instead.",
            });
            setLoading(false);
            return;
          }
          throw error;
        }

        if (data.session && data.user) {
          if (adminInviteCode && isValidAdminInvite) {
            const { data: inviteUsed } = await supabase.rpc("use_admin_invite", {
              invite_code_input: adminInviteCode,
            });

            if (inviteUsed) {
              toast({
                title: "Welcome, Admin!",
                description: "Your admin account has been created successfully.",
              });
              navigate("/admin");
              return;
            }
          }

          if (referralCode) {
            try {
              await supabase
                .from("referrals")
                .update({ 
                  referred_id: data.user.id, 
                  status: "converted",
                  converted_at: new Date().toISOString()
                })
                .eq("referral_code", referralCode)
                .is("referred_id", null);
              
              toast({
                title: "Referral Applied!",
                description: "You've joined through a referral link.",
              });
            } catch (refError) {
              console.error("Error applying referral:", refError);
            }
          }

          toast({
            title: "Welcome to AITD Events!",
            description: "Please complete your profile to continue.",
          });
          navigate("/complete-profile");
          return;
        }
        // Email confirmation required - show pending state
        setPendingEmail(email);
        setShowVerificationPending(true);
        toast({
          title: "Verify your email",
          description: "We've sent a verification link to your email address.",
        });
      } else {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Handle specific error cases
          if (error.message?.includes("Invalid login credentials")) {
            toast({
              title: "Invalid credentials",
              description: "Please check your email and password and try again.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          if (error.message?.includes("Email not confirmed")) {
            setPendingEmail(email);
            setShowVerificationPending(true);
            toast({
              title: "Email not verified",
              description: "Please check your inbox for the verification link.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          throw error;
        }

        // Check user roles for routing
        const { data: isAdmin } = await supabase.rpc("is_admin");
        const { data: isTeamMember } = await supabase.rpc("is_core_team");
        
        // Role-based routing with selected role preference
        if (selectedRole === "admin" && isAdmin) {
          toast({
            title: "Welcome back, Admin!",
            description: "You've successfully logged in.",
          });
          navigate("/admin");
          return;
        }
        
        if (selectedRole === "team" && isTeamMember) {
          toast({
            title: "Welcome back, Team Member!",
            description: "You've successfully logged in.",
          });
          navigate("/team-panel");
          return;
        }

        // If user selected admin/team but doesn't have those roles
        if (selectedRole === "admin" && !isAdmin) {
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges. Logging in as student.",
            variant: "destructive",
          });
        }
        
        if (selectedRole === "team" && !isTeamMember) {
          toast({
            title: "Access Denied",
            description: "You're not a team member. Logging in as student.",
            variant: "destructive",
          });
        }

        // Default: Check for admin/team status anyway for auto-routing
        if (isAdmin) {
          toast({
            title: "Welcome back, Admin!",
            description: "You've successfully logged in.",
          });
          navigate("/admin");
          return;
        }

        if (isTeamMember) {
          toast({
            title: "Welcome back, Team Member!",
            description: "You've successfully logged in.",
          });
          navigate("/team-panel");
          return;
        }

        const { data: profile } = await supabase
          .from("student_profiles")
          .select("college")
          .eq("user_id", signInData.user.id)
          .maybeSingle();

        if (!profile || !profile.college) {
          toast({
            title: "Welcome back!",
            description: "Please complete your profile to continue.",
          });
          navigate("/complete-profile");
          return;
        }

        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        
        navigate("/");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "An error occurred during authentication",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  // Left Panel Component
  const LeftPanel = ({ title, subtitle, description }: { title: string; subtitle: string; description: string }) => (
    <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent animate-gradient" />
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 right-20 animate-float">
        <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-sm rotate-12" />
      </div>
      <div className="absolute bottom-32 right-16 animate-float-delayed">
        <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm" />
      </div>
      <div className="absolute top-1/3 right-1/4 animate-float-slow">
        <Sparkles className="h-12 w-12 text-white/20" />
      </div>
      <div className="absolute bottom-1/4 left-1/4 animate-pulse-soft">
        <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm -rotate-12" />
      </div>
      
      <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 2xl:px-20 w-full">
        {/* Logo */}
        <div className="flex items-center gap-4 mb-10 animate-fade-in">
          <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-sm">
            <img src={logo} alt="AITD Events" className="h-12 w-12 rounded-xl" />
          </div>
          <span className="text-2xl font-bold text-white">AITD Events</span>
        </div>
        
        {/* Headlines */}
        <div className="space-y-4 mb-10">
          <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-white leading-tight animate-fade-in-up">
            {title}
            <br />
            <span className="text-white/90">{subtitle}</span>
          </h1>
          <p className="text-lg xl:text-xl text-white/70 max-w-md animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            {description}
          </p>
        </div>
        
        {/* Features */}
        <div className="space-y-4">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="flex items-center gap-4 text-white/90 animate-fade-in-up"
              style={{ animationDelay: feature.delay }}
            >
              <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <feature.icon className="h-5 w-5" />
              </div>
              <span className="text-base xl:text-lg">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="text-3xl font-bold text-white">10K+</div>
            <div className="text-sm text-white/60">Active Users</div>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="text-3xl font-bold text-white">500+</div>
            <div className="text-sm text-white/60">Opportunities</div>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="text-3xl font-bold text-white">50+</div>
            <div className="text-sm text-white/60">Partners</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Header Component
  const MobileHeader = () => (
    <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
      <div className="p-2 rounded-xl bg-primary/10">
        <img src={logo} alt="AITD Events" className="h-10 w-10 rounded-lg" />
      </div>
      <span className="text-2xl font-bold text-foreground">AITD Events</span>
    </div>
  );

  // Verification Error View
  if (showVerificationError) {
    return (
      <div className="min-h-screen flex">
        <LeftPanel 
          title="Link Expired" 
          subtitle="Let's Fix That" 
          description="Verification links expire for security. Request a new one and you'll be good to go."
        />

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
          <div className="w-full max-w-md animate-fade-in-up">
            <MobileHeader />

            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Verification Failed
                </h2>
                <p className="text-muted-foreground">
                  {verificationErrorMessage}
                </p>
              </div>

              <div className="bg-muted/50 rounded-xl p-5 text-left space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter your email below to receive a new verification link
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Make sure to use the link within 24 hours
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 bg-muted/50 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all rounded-xl text-base"
                  />
                </div>

                <Button
                  className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                  onClick={async () => {
                    if (!email) {
                      toast({
                        title: "Email required",
                        description: "Please enter your email address.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setLoading(true);
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
                        title: "Email sent!",
                        description: "Check your inbox for the new verification link.",
                      });
                      setShowVerificationError(false);
                      setPendingEmail(email);
                      setShowVerificationPending(true);
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: error.message || "Failed to resend email",
                        variant: "destructive",
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-5 w-5 mr-2" />
                  )}
                  Send new verification link
                </Button>

                <button
                  onClick={() => {
                    setShowVerificationError(false);
                    setVerificationErrorMessage("");
                    navigate("/auth", { replace: true });
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  ← Back to login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Email Verification Pending View
  if (showVerificationPending) {
    return (
      <div className="min-h-screen flex">
        <LeftPanel 
          title="Almost There!" 
          subtitle="Verify Your Email" 
          description="We've sent a verification link to your email. Click it to activate your account."
        />

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
          <div className="w-full max-w-md animate-fade-in-up">
            <MobileHeader />

            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse-soft">
                <Mail className="h-10 w-10 text-primary" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Check your inbox
                </h2>
                <p className="text-muted-foreground">
                  We've sent a verification link to
                </p>
                <p className="font-semibold text-primary mt-1 break-all">
                  {pendingEmail}
                </p>
              </div>

              <div className="bg-muted/50 rounded-xl p-5 text-left space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Click the link in the email to verify your account
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Check your spam folder if you don't see it
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full h-14 rounded-xl text-base font-medium border-2 hover:bg-muted/50"
                  onClick={async () => {
                    if (resendCountdown > 0) return;
                    setLoading(true);
                    try {
                      const { error } = await supabase.auth.resend({
                        type: "signup",
                        email: pendingEmail,
                        options: {
                          emailRedirectTo: `${window.location.origin}/auth?verified=true`,
                        },
                      });
                      if (error) throw error;
                      setResendCountdown(60); // 60 second cooldown
                      toast({
                        title: "Email sent!",
                        description: "Check your inbox for the verification link.",
                      });
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: error.message || "Failed to resend email",
                        variant: "destructive",
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading || resendCountdown > 0}
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  ) : resendCountdown > 0 ? (
                    <>
                      <Timer className="h-5 w-5 mr-2" />
                      Resend in {resendCountdown}s
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5 mr-2" />
                      Resend verification email
                    </>
                  )}
                </Button>

                <button
                  onClick={() => {
                    setShowVerificationPending(false);
                    setPendingEmail("");
                    setIsLogin(true);
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  ← Back to login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset Password View
  if (showResetPassword) {
    return (
      <div className="min-h-screen flex">
        <LeftPanel 
          title="Set Your New" 
          subtitle="Password" 
          description="Choose a strong password that you haven't used before."
        />

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
          <div className="w-full max-w-md animate-fade-in-up">
            <MobileHeader />

            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Reset your password
              </h2>
              <p className="text-muted-foreground">
                Enter your new password below
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    maxLength={100}
                    className="pl-12 pr-12 h-14 bg-muted/50 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all rounded-xl text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirm New Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    maxLength={100}
                    className="pl-12 h-14 bg-muted/50 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all rounded-xl text-base"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Reset Password
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Forgot Password View
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex">
        <LeftPanel 
          title="Reset Your" 
          subtitle="Password" 
          description="Don't worry, it happens to the best of us. Enter your email and we'll send you a reset link."
        />

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
          <div className="w-full max-w-md animate-fade-in-up">
            <MobileHeader />

            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetEmailSent(false);
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </button>

            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Forgot password?
              </h2>
              <p className="text-muted-foreground">
                {resetEmailSent 
                  ? "We've sent a password reset link to your email"
                  : "Enter your email and we'll send you a reset link"}
              </p>
            </div>

            {resetEmailSent ? (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-success/10 border border-success/20">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Check your email</p>
                      <p className="text-sm text-muted-foreground">
                        We sent a reset link to <strong className="text-foreground">{email}</strong>
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground text-center">
                  Didn't receive the email?{" "}
                  <button
                    onClick={() => setResetEmailSent(false)}
                    className="text-primary font-semibold hover:underline"
                  >
                    Try again
                  </button>
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={255}
                      className="pl-12 h-14 bg-muted/50 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all rounded-xl text-base"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send reset link
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Login/Signup View
  return (
    <div className="min-h-screen flex">
      <LeftPanel 
        title="Your Gateway to" 
        subtitle="Career Opportunities" 
        description="Join thousands of tech students discovering hackathons, internships, and events that shape their future."
      />

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md animate-fade-in-up">
          <MobileHeader />

          <div className="mb-8">
            {isValidAdminInvite && (
              <Badge className="mb-4 bg-warning/10 text-warning border-warning/20 px-3 py-1">
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                Admin Invite
              </Badge>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {isValidAdminInvite 
                ? "Create Admin Account" 
                : isLogin 
                  ? "Welcome back" 
                  : "Create account"}
            </h2>
            <p className="text-muted-foreground">
              {isValidAdminInvite
                ? "You've been invited to become an administrator"
                : referralCode
                  ? "You've been invited to join AITD Events"
                  : isLogin 
                    ? "Enter your credentials to access your account" 
                    : "Start your journey with AITD Events"}
            </p>
            {referralCode && !isLogin && (
              <Badge className="mt-3 bg-success/10 text-success border-success/20 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Referral Code Applied
              </Badge>
            )}
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                  className="pl-12 h-14 bg-muted/50 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all rounded-xl text-base"
                />
              </div>
              {!isLogin && (
                <p className="text-xs text-muted-foreground pl-1">
                  Use your college email or a trusted provider (Gmail, Outlook, etc.)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  maxLength={100}
                  className="pl-12 pr-12 h-14 bg-muted/50 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all rounded-xl text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {!isLogin && <PasswordStrengthMeter password={password} />}
            </div>

            {/* Remember Me Checkbox for Login */}
            {isLogin && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer">
                  Remember me on this device
                </Label>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isLogin ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? "Sign in" : "Create account"}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t-2 border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 text-base font-medium rounded-xl border-2 hover:bg-muted/50 hover:border-primary/20 transition-all"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continue with Google
            </Button>
          </form>

          {/* Role Selector */}
          {isLogin && (
            <div className="mt-5 space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Login as</Label>
              <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
              {selectedRole === "admin" && (
                <p className="text-xs text-center text-muted-foreground">
                  Admins will be redirected to the admin dashboard
                </p>
              )}
              {selectedRole === "team" && (
                <p className="text-xs text-center text-muted-foreground">
                  Team members will be redirected to the team panel
                </p>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? (
                <>Don't have an account? <span className="font-bold text-primary hover:underline">Sign up</span></>
              ) : (
                <>Already have an account? <span className="font-bold text-primary hover:underline">Sign in</span></>
              )}
            </button>
          </div>

          <p className="mt-8 text-xs text-center text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

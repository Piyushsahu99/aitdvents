import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import logo from "@/assets/aitd-logo.png";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Shield, ArrowLeft, RefreshCw, CheckCircle } from "lucide-react";

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

export default function Auth() {
  const [searchParams] = useSearchParams();
  const adminInviteCode = searchParams.get("admin_invite");
  const referralCode = searchParams.get("ref");
  const isResetFlow = searchParams.get("reset") === "true";
  const isVerifiedFlow = searchParams.get("verified") === "true";
  
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
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [showVerificationPending, setShowVerificationPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
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
  }, [adminInviteCode, isResetFlow, isVerifiedFlow]);

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
              user_id_input: data.user.id,
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

        if (error) throw error;

        const { data: isAdmin } = await supabase.rpc("is_admin");
        
        if (isAdmin) {
          toast({
            title: "Welcome back, Admin!",
            description: "You've successfully logged in.",
          });
          navigate("/admin");
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

  // Email Verification Pending View
  if (showVerificationPending) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
          
          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
            <div className="flex items-center gap-3 mb-8">
              <img src={logo} alt="AITD Events" className="h-14 w-14 rounded-xl shadow-lg" />
              <span className="text-3xl font-bold text-primary-foreground">AITD Events</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
              Almost There!<br />
              <span className="text-primary-foreground/90">Verify Your Email</span>
            </h1>
            
            <p className="text-lg text-primary-foreground/80 mb-10 max-w-md">
              We've sent a verification link to your email. Click it to activate your account and start exploring.
            </p>
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
              <img src={logo} alt="AITD Events" className="h-12 w-12 rounded-xl" />
              <span className="text-2xl font-bold text-primary">AITD Events</span>
            </div>

            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-10 w-10 text-primary" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Check your inbox
                </h2>
                <p className="text-muted-foreground">
                  We've sent a verification link to
                </p>
                <p className="font-semibold text-foreground mt-1 break-all">
                  {pendingEmail}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Click the link in the email to verify your account
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Check your spam folder if you don't see it
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
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
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Resend verification email
                </Button>

                <button
                  onClick={() => {
                    setShowVerificationPending(false);
                    setPendingEmail("");
                    setIsLogin(true);
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Back to login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset Password View (after clicking email link)
  if (showResetPassword) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
          
          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
            <div className="flex items-center gap-3 mb-8">
              <img src={logo} alt="AITD Events" className="h-14 w-14 rounded-xl shadow-lg" />
              <span className="text-3xl font-bold text-primary-foreground">AITD Events</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
              Set Your New<br />
              <span className="text-primary-foreground/90">Password</span>
            </h1>
            
            <p className="text-lg text-primary-foreground/80 mb-10 max-w-md">
              Choose a strong password that you haven't used before.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
              <img src={logo} alt="AITD Events" className="h-12 w-12 rounded-xl" />
              <span className="text-2xl font-bold text-primary">AITD Events</span>
            </div>

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
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    maxLength={100}
                    className="pl-10 pr-10 h-12 bg-muted/50 border-border focus:bg-background transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    maxLength={100}
                    className="pl-10 h-12 bg-muted/50 border-border focus:bg-background transition-colors"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold group"
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
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
          
          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
            <div className="flex items-center gap-3 mb-8">
              <img src={logo} alt="AITD Events" className="h-14 w-14 rounded-xl shadow-lg" />
              <span className="text-3xl font-bold text-primary-foreground">AITD Events</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
              Reset Your<br />
              <span className="text-primary-foreground/90">Password</span>
            </h1>
            
            <p className="text-lg text-primary-foreground/80 mb-10 max-w-md">
              Don't worry, it happens to the best of us. Enter your email and we'll send you a reset link.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
              <img src={logo} alt="AITD Events" className="h-12 w-12 rounded-xl" />
              <span className="text-2xl font-bold text-primary">AITD Events</span>
            </div>

            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetEmailSent(false);
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
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
                  : "Enter your email address and we'll send you a link to reset your password"}
              </p>
            </div>

            {resetEmailSent ? (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-emerald-700">Check your email</p>
                      <p className="text-sm text-emerald-600/80">
                        We've sent a password reset link to <strong>{email}</strong>
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground text-center">
                  Didn't receive the email?{" "}
                  <button
                    onClick={() => setResetEmailSent(false)}
                    className="text-primary font-medium hover:underline"
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
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={255}
                      className="pl-10 h-12 bg-muted/50 border-border focus:bg-background transition-colors"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold group"
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

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="AITD Events" className="h-14 w-14 rounded-xl shadow-lg" />
            <span className="text-3xl font-bold text-primary-foreground">AITD Events</span>
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
            Your Gateway to<br />
            <span className="text-primary-foreground/90">Career Opportunities</span>
          </h1>
          
          <p className="text-lg text-primary-foreground/80 mb-10 max-w-md">
            Join thousands of tech students discovering hackathons, internships, and events that shape their future.
          </p>
          
          <div className="space-y-4">
            {[
              "Access 500+ curated opportunities",
              "Connect with top recruiters",
              "Join exclusive tech events",
              "Build your professional network"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-primary-foreground/90">
                <div className="h-2 w-2 rounded-full bg-primary-foreground/60" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Floating elements */}
          <div className="absolute top-20 right-20 animate-float">
            <Sparkles className="h-8 w-8 text-primary-foreground/30" />
          </div>
          <div className="absolute bottom-32 right-32 animate-float-delayed">
            <div className="h-16 w-16 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm" />
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <img src={logo} alt="AITD Events" className="h-12 w-12 rounded-xl" />
            <span className="text-2xl font-bold text-primary">AITD Events</span>
          </div>

          <div className="mb-8">
            {isValidAdminInvite && (
              <Badge className="mb-4 bg-amber-500/10 text-amber-600 border-amber-500/20">
                <Shield className="h-3 w-3 mr-1" />
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
              <Badge className="mt-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Referral Code Applied
              </Badge>
            )}
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                  className="pl-10 h-12 bg-muted/50 border-border focus:bg-background transition-colors"
                />
              </div>
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
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
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  maxLength={100}
                  className="pl-10 pr-10 h-12 bg-muted/50 border-border focus:bg-background transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold group"
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
          </form>

          {/* Admin Login Toggle */}
          {isLogin && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsAdminLogin(!isAdminLogin)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 text-sm font-medium transition-colors"
              >
                <Shield className="h-4 w-4" />
                {isAdminLogin ? "Switch to Student Login" : "Login as Admin"}
              </button>
              {isAdminLogin && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Admins will be redirected to the admin dashboard
                </p>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? (
                <>Don't have an account? <span className="font-semibold text-primary">Sign up</span></>
              ) : (
                <>Already have an account? <span className="font-semibold text-primary">Sign in</span></>
              )}
            </button>
          </div>

          <p className="mt-8 text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

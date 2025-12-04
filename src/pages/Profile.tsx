import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { UserReelsSection } from "@/components/profile/UserReelsSection";
import { MemberCertificate } from "@/components/profile/MemberCertificate";
import { 
  User, 
  Camera, 
  Trash2, 
  Copy, 
  Check, 
  Users, 
  Phone, 
  Mail,
  Loader2,
  Save,
  School,
  Calendar,
  LinkIcon,
  Shield,
  Play,
  LogOut,
  Settings,
  Award,
  ExternalLink
} from "lucide-react";

interface ProfileData {
  id: string;
  user_id: string;
  full_name: string;
  bio: string | null;
  college: string | null;
  graduation_year: number | null;
  skills: string[] | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  avatar_url: string | null;
  is_looking_for_team: boolean | null;
  interests: string[] | null;
  is_public: boolean | null;
  phone: string | null;
  phone_verified: boolean | null;
  email_verified: boolean | null;
}

interface Referral {
  id: string;
  referral_code: string;
  referred_id: string | null;
  status: string;
  created_at: string;
  converted_at: string | null;
}

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralCode, setReferralCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    college: "",
    graduation_year: "",
    phone: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    skills: "",
    interests: "",
    is_public: false,
    is_looking_for_team: false,
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    await Promise.all([
      fetchProfile(session.user.id),
      fetchReferrals(session.user.id),
    ]);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    if (data) {
      setProfile(data as ProfileData);
      setFormData({
        full_name: data.full_name || "",
        bio: data.bio || "",
        college: data.college || "",
        graduation_year: data.graduation_year?.toString() || "",
        phone: (data as any).phone || "",
        linkedin_url: data.linkedin_url || "",
        github_url: data.github_url || "",
        portfolio_url: data.portfolio_url || "",
        skills: data.skills?.join(", ") || "",
        interests: data.interests?.join(", ") || "",
        is_public: data.is_public || false,
        is_looking_for_team: data.is_looking_for_team || false,
      });
    }
  };

  const fetchReferrals = async (userId: string) => {
    // Get existing referral code or create one
    const { data: existingReferrals, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", userId);

    if (error) {
      console.error("Error fetching referrals:", error);
      return;
    }

    if (existingReferrals && existingReferrals.length > 0) {
      setReferrals(existingReferrals as Referral[]);
      setReferralCode(existingReferrals[0].referral_code);
    } else {
      // Generate new referral code
      const code = `AITD-${userId.slice(0, 8).toUpperCase()}`;
      const { data: newReferral, error: createError } = await supabase
        .from("referrals")
        .insert({ referrer_id: userId, referral_code: code })
        .select()
        .single();

      if (!createError && newReferral) {
        setReferralCode(code);
        setReferrals([newReferral as Referral]);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    const profileData = {
      user_id: user.id,
      full_name: formData.full_name,
      bio: formData.bio || null,
      college: formData.college || null,
      graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
      phone: formData.phone || null,
      linkedin_url: formData.linkedin_url || null,
      github_url: formData.github_url || null,
      portfolio_url: formData.portfolio_url || null,
      skills: formData.skills ? formData.skills.split(",").map(s => s.trim()).filter(Boolean) : null,
      interests: formData.interests ? formData.interests.split(",").map(s => s.trim()).filter(Boolean) : null,
      is_public: formData.is_public,
      is_looking_for_team: formData.is_looking_for_team,
    };

    if (profile) {
      const { error } = await supabase
        .from("student_profiles")
        .update(profileData)
        .eq("user_id", user.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Profile updated successfully" });
        await fetchProfile(user.id);
      }
    } else {
      const { error } = await supabase
        .from("student_profiles")
        .insert(profileData);

      if (error) {
        toast({ title: "Error", description: "Failed to create profile", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Profile created successfully" });
        await fetchProfile(user.id);
      }
    }

    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Client-side file validation
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ 
        title: "Invalid file type", 
        description: "Please upload a JPEG, PNG, GIF, or WebP image", 
        variant: "destructive" 
      });
      return;
    }

    if (file.size > MAX_SIZE) {
      toast({ 
        title: "File too large", 
        description: "Please upload an image smaller than 5MB", 
        variant: "destructive" 
      });
      return;
    }

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("student_profiles")
      .update({ avatar_url: publicUrl })
      .eq("user_id", user.id);

    if (updateError) {
      toast({ title: "Error", description: "Failed to update avatar", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Avatar updated successfully" });
      await fetchProfile(user.id);
    }

    setUploading(false);
  };

  const handleRemoveAvatar = async () => {
    if (!user || !profile?.avatar_url) return;

    setUploading(true);
    const { error } = await supabase
      .from("student_profiles")
      .update({ avatar_url: null })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to remove avatar", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Avatar removed" });
      await fetchProfile(user.id);
    }
    setUploading(false);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(`${window.location.origin}/auth?ref=${referralCode}`);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const successfulReferrals = referrals.filter(r => r.status === "converted").length;

  return (
    <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header with Logout */}
        <div className="flex items-start justify-between mb-4 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your account settings</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={async () => {
              await supabase.auth.signOut();
              toast({ title: "Logged out", description: "See you soon!" });
              navigate("/");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-max sm:w-full sm:grid sm:grid-cols-5 gap-1 p-1">
              <TabsTrigger value="profile" className="text-xs sm:text-sm px-3 sm:px-4">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="certificate" className="text-xs sm:text-sm px-3 sm:px-4">
                <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Certificate
              </TabsTrigger>
              <TabsTrigger value="reels" className="text-xs sm:text-sm px-3 sm:px-4">
                <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Reels
              </TabsTrigger>
              <TabsTrigger value="referrals" className="text-xs sm:text-sm px-3 sm:px-4">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Referrals
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm px-3 sm:px-4">
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Profile Picture
                </CardTitle>
                <CardDescription>Upload or remove your profile picture</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                      {formData.full_name ? getInitials(formData.full_name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      variant="outline"
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
                      Upload Photo
                    </Button>
                    {profile?.avatar_url && (
                      <Button
                        onClick={handleRemoveAvatar}
                        disabled={uploading}
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="college">College/University</Label>
                    <Input
                      id="college"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      placeholder="Your college name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="graduation_year">Graduation Year</Label>
                    <Input
                      id="graduation_year"
                      type="number"
                      value={formData.graduation_year}
                      onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                      placeholder="2025"
                      min="2020"
                      max="2030"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills & Interests */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Interests</CardTitle>
                <CardDescription>Separate multiple items with commas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="React, TypeScript, Python..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interests">Interests</Label>
                  <Input
                    id="interests"
                    value={formData.interests}
                    onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                    placeholder="Web Development, AI, Machine Learning..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Social Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub URL</Label>
                  <Input
                    id="github"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio URL</Label>
                  <Input
                    id="portfolio"
                    value={formData.portfolio_url}
                    onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={saving || !formData.full_name}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Profile
              </Button>
            </div>
          </TabsContent>

          {/* Reels Tab */}
          <TabsContent value="reels">
            {user && <UserReelsSection userId={user.id} />}
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Referral Code
                </CardTitle>
                <CardDescription>Share this code to invite friends and earn rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <code className="flex-1 text-lg font-mono font-bold text-primary">{referralCode}</code>
                  <Button onClick={copyReferralCode} variant="outline">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                
                {/* Share Buttons */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Share via:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-2 bg-green-500/10 hover:bg-green-500/20 border-green-500/30"
                      onClick={() => {
                        const url = `https://wa.me/?text=${encodeURIComponent(`Join me on AITD and start your tech career journey! Use my referral code: ${referralCode}\n\nSign up here: ${window.location.origin}/auth?ref=${referralCode}`)}`;
                        window.open(url, '_blank');
                      }}
                    >
                      <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      WhatsApp
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me on AITD - the all-in-one platform for tech careers! 🚀\n\nUse my referral code: ${referralCode}`)}&url=${encodeURIComponent(`${window.location.origin}/auth?ref=${referralCode}`)}`;
                        window.open(url, '_blank');
                      }}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Twitter
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/auth?ref=${referralCode}`)}`;
                        window.open(url, '_blank');
                      }}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="gap-2"
                      onClick={copyReferralCode}
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      Copy Link
                    </Button>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  Your referral link: <code className="text-primary">{window.location.origin}/auth?ref={referralCode}</code>
                </p>
              </CardContent>
            </Card>

            {/* Referral Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{referrals.length}</p>
                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-accent">{successfulReferrals}</p>
                    <p className="text-sm text-muted-foreground">Successful</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-secondary">{referrals.length - successfulReferrals}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Referral List */}
            <Card>
              <CardHeader>
                <CardTitle>Referral History</CardTitle>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No referrals yet. Share your code to get started!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {referrals.map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{referral.referral_code}</p>
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(referral.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={referral.status === "converted" ? "default" : "secondary"}>
                          {referral.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{user?.email}</p>
                      <p className="text-sm text-muted-foreground">Primary email</p>
                    </div>
                  </div>
                  <Badge variant={user?.email_confirmed_at ? "default" : "secondary"}>
                    {user?.email_confirmed_at ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Phone Number
                </CardTitle>
                <CardDescription>Add your phone number for contact purposes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Note:</strong> SMS verification is currently unavailable. You can save your phone number for contact purposes.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (with country code)</Label>
                  <div className="flex gap-3">
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+919876543210"
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        if (!formData.phone) {
                          toast({ title: "Error", description: "Please enter a phone number", variant: "destructive" });
                          return;
                        }
                        await handleSaveProfile();
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
                
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificate Tab */}
          <TabsContent value="certificate" className="space-y-6">
            {profile && user && (
              <MemberCertificate
                userName={profile.full_name}
                joinDate={profile.created_at || new Date().toISOString()}
                memberId={user.id}
              />
            )}
            
            <Card className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border-amber-500/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Top 3 Monthly Performers Win Merchandise! 🎁</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Earn points by sharing your certificate, referring friends, and being active on the platform. 
                      Top 3 performers each month win official AITD Events merchandise!
                    </p>
                    <Button variant="outline" size="sm" onClick={() => navigate("/leaderboard")}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Leaderboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>Control your profile visibility and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="font-medium">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">Allow others to see your profile on the leaderboard</p>
                  </div>
                  <Switch
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="font-medium">Looking for Team</Label>
                    <p className="text-sm text-muted-foreground">Show that you're open to team invitations for hackathons</p>
                  </div>
                  <Switch
                    checked={formData.is_looking_for_team}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_looking_for_team: checked })}
                  />
                </div>
                
                <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Settings
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{user?.email}</p>
                      <p className="text-sm text-muted-foreground">Primary email</p>
                    </div>
                  </div>
                  <Badge variant={user?.email_confirmed_at ? "default" : "secondary"}>
                    {user?.email_confirmed_at ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign out of your account on this device
                </p>
                <Button 
                  variant="destructive"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    toast({ title: "Logged out", description: "See you soon!" });
                    navigate("/");
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
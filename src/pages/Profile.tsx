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
import { useToast } from "@/hooks/use-toast";
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
  Shield
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
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="referrals">
              <Users className="h-4 w-4 mr-2" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="verification">
              <Shield className="h-4 w-4 mr-2" />
              Verification
            </TabsTrigger>
          </TabsList>

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
              <CardContent>
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <code className="flex-1 text-lg font-mono font-bold text-primary">{referralCode}</code>
                  <Button onClick={copyReferralCode} variant="outline">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Share your referral link: <code className="text-xs bg-muted px-2 py-1 rounded">{window.location.origin}/auth?ref={referralCode}</code>
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
                  Phone Verification
                </CardTitle>
                <CardDescription>Add and verify your phone number</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-3">
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={handleSaveProfile} disabled={saving}>
                      Save
                    </Button>
                  </div>
                </div>
                {formData.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant={(profile as any)?.phone_verified ? "default" : "secondary"}>
                      {(profile as any)?.phone_verified ? "Verified" : "Not Verified"}
                    </Badge>
                    {!(profile as any)?.phone_verified && (
                      <p className="text-muted-foreground">Phone verification coming soon</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { z } from "zod";
import { Mail, Copy, CheckCircle, Clock, XCircle, Plus, Shield, UserMinus, Users, Trash2, RefreshCw, AlertTriangle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface AdminInvite {
  id: string;
  email: string;
  invite_code: string;
  status: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
}

interface CurrentAdmin {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: {
    full_name: string | null;
  } | null;
  email?: string | null;
}

// Super admin email that cannot be removed
const SUPER_ADMIN_EMAIL = "piyushsahu9919@gmail.com";

export function AdminInviteManager() {
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [currentAdmins, setCurrentAdmins] = useState<CurrentAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
    setCurrentUserEmail(user?.email || null);
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchInvites(), fetchCurrentAdmins()]);
    setLoading(false);
  };

  const fetchInvites = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_invites")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch invites",
        variant: "destructive",
      });
    }
  };

  const fetchCurrentAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, user_id, role, created_at")
        .eq("role", "admin")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch profiles and match with invites to get emails
      const adminsWithProfiles = await Promise.all(
        (data || []).map(async (admin) => {
          const { data: profile } = await supabase
            .from("student_profiles")
            .select("full_name")
            .eq("user_id", admin.user_id)
            .maybeSingle();
          
          // Try to get email from used admin invites
          const { data: usedInvite } = await supabase
            .from("admin_invites")
            .select("email")
            .eq("status", "used")
            .limit(100);
          
          // Match by checking if this user's profile name matches any used invite
          // This is a workaround since we can't directly access auth.users
          let matchedEmail: string | null = null;
          if (usedInvite && profile?.full_name) {
            // For the super admin, use the known email
            if (admin.user_id === currentUserId && currentUserEmail) {
              matchedEmail = currentUserEmail;
            }
          }
          
          return {
            ...admin,
            profile: profile || undefined,
            email: matchedEmail,
          };
        })
      );

      setCurrentAdmins(adminsWithProfiles);
    } catch (error: any) {
      console.error("Error fetching admins:", error);
    }
  };

  const createInvite = async () => {
    if (!newEmail) return;

    const emailSchema = z.string().email();
    const result = emailSchema.safeParse(newEmail);
    if (!result.success) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Check if email is already an admin
    const existingAdmin = currentAdmins.find(
      admin => admin.email?.toLowerCase() === newEmail.toLowerCase().trim()
    );
    if (existingAdmin) {
      toast({
        title: "Already an Admin",
        description: "This email is already registered as an admin.",
        variant: "destructive",
      });
      return;
    }

    // Check if there's already a pending invite
    const existingInvite = invites.find(
      invite => invite.email.toLowerCase() === newEmail.toLowerCase().trim() && 
                invite.status === "pending" && 
                new Date(invite.expires_at) > new Date()
    );
    if (existingInvite) {
      toast({
        title: "Invite Already Exists",
        description: "There's already a pending invite for this email. You can copy the existing invite link.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      // First, try direct admin addition via RPC if user exists
      const { data: rpcResult } = await supabase.rpc("add_admin_by_email", {
        admin_email: newEmail.toLowerCase().trim()
      });

      if (rpcResult && typeof rpcResult === 'object' && 'success' in rpcResult) {
        if (rpcResult.success) {
          toast({
            title: "Admin Added!",
            description: `${newEmail} is now an admin.`,
          });
          setNewEmail("");
          fetchCurrentAdmins();
          return;
        } else if (rpcResult.error === "User is already an admin") {
          toast({
            title: "Already an Admin",
            description: "This user is already an admin.",
            variant: "destructive",
          });
          return;
        }
        // If user not found, fall back to invite system
      }

      // Fall back to invite system for users who haven't signed up yet
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("admin_invites")
        .insert({
          email: newEmail.toLowerCase().trim(),
          invited_by: user?.id,
        });

      if (error) {
        if (error.code === "23505") {
          throw new Error("An invite already exists for this email");
        }
        throw error;
      }

      toast({
        title: "Invite Created!",
        description: `Admin invite created for ${newEmail}. Copy the invite link to share. If the user already has an account, they need to complete their profile first.`,
      });
      
      setNewEmail("");
      fetchInvites();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create invite",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const revokeInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from("admin_invites")
        .delete()
        .eq("id", inviteId);

      if (error) throw error;

      toast({
        title: "Invite Revoked",
        description: "The admin invite has been revoked.",
      });
      fetchInvites();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke invite",
        variant: "destructive",
      });
    }
  };

  const removeAdmin = async (adminId: string, userId: string, adminEmail?: string | null) => {
    // Prevent removing yourself
    if (userId === currentUserId) {
      toast({
        title: "Cannot Remove",
        description: "You cannot remove your own admin privileges.",
        variant: "destructive",
      });
      return;
    }

    // Prevent removing super admin
    if (adminEmail?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      toast({
        title: "Cannot Remove",
        description: "The primary super admin cannot be removed.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", adminId);

      if (error) throw error;

      toast({
        title: "Admin Removed",
        description: "Admin privileges have been revoked.",
      });
      fetchCurrentAdmins();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove admin",
        variant: "destructive",
      });
    }
  };

  const copyInviteLink = (inviteCode: string) => {
    const link = `${window.location.origin}/auth?admin_invite=${inviteCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied!",
      description: "Invite link copied to clipboard. Share it with the new admin.",
    });
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    if (status === "used") {
      return <Badge className="bg-green-500/20 text-green-600 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" /> Used</Badge>;
    }
    if (new Date(expiresAt) < new Date()) {
      return <Badge variant="destructive" className="bg-red-500/20 text-red-600 border-red-500/30"><XCircle className="h-3 w-3 mr-1" /> Expired</Badge>;
    }
    return <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-500/10"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
  };

  const getTimeRemaining = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    if (expiry < new Date()) return "Expired";
    return formatDistanceToNow(expiry, { addSuffix: true });
  };

  const isSuperAdmin = (adminEmail?: string | null) => {
    return adminEmail?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  };

  const pendingInvitesCount = invites.filter(i => i.status === "pending" && new Date(i.expires_at) > new Date()).length;

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Admin Management</CardTitle>
            <CardDescription>
              Manage admin invites and current administrators
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="invites" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
            <TabsTrigger value="invites" className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              Invites
              {pendingInvitesCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {pendingInvitesCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              Admins ({currentAdmins.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invites" className="space-y-6">
            {/* Create New Invite */}
            <div className="p-4 rounded-xl border-2 border-dashed bg-muted/30">
              <Label htmlFor="invite-email" className="text-sm font-medium mb-2 block">
                Add New Admin
              </Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="Enter email to invite as admin"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="pl-10 h-11"
                    onKeyDown={(e) => e.key === "Enter" && createInvite()}
                  />
                </div>
                <Button 
                  onClick={createInvite} 
                  disabled={creating || !newEmail}
                  className="h-11 px-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {creating ? "Creating..." : "Create Invite"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                The invite link will be valid for 7 days. Share it with the new admin.
              </p>
            </div>

            {/* Invites Table */}
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                <p>Loading invites...</p>
              </div>
            ) : invites.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No admin invites yet</p>
                <p className="text-sm">Create an invite above to add new admins</p>
              </div>
            ) : (
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invites.map((invite) => (
                      <TableRow key={invite.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{invite.email}</TableCell>
                        <TableCell>{getStatusBadge(invite.status, invite.expires_at)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {getTimeRemaining(invite.expires_at)}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {invite.status === "pending" && new Date(invite.expires_at) > new Date() && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyInviteLink(invite.invite_code)}
                                className="h-8"
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                Copy Link
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Revoke Invite?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the invite for {invite.email}. They won't be able to use this link anymore.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => revokeInvite(invite.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Revoke
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="admins" className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                <p>Loading admins...</p>
              </div>
            ) : currentAdmins.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No admins found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentAdmins.map((admin) => {
                  const adminEmail = admin.email;
                  const isSuper = isSuperAdmin(adminEmail);
                  const isCurrentUser = admin.user_id === currentUserId;
                  
                  return (
                    <div 
                      key={admin.id} 
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        isSuper ? "bg-amber-500/5 border-amber-500/30" : "bg-card hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                          isSuper 
                            ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white" 
                            : "bg-primary/10 text-primary"
                        }`}>
                          {admin.profile?.full_name?.[0]?.toUpperCase() || adminEmail?.[0]?.toUpperCase() || "A"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold">
                              {admin.profile?.full_name || "Unknown Admin"}
                            </p>
                            {isSuper && (
                              <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                                Super Admin
                              </Badge>
                            )}
                            {isCurrentUser && (
                              <Badge variant="secondary">You</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{adminEmail || "No email set"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Admin since {format(new Date(admin.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      
                      {!isCurrentUser && !isSuper && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Remove Admin?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove admin privileges from <strong>{admin.profile?.full_name || adminEmail}</strong>. They will no longer be able to access the admin dashboard.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => removeAdmin(admin.id, admin.user_id, adminEmail)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove Admin
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      
                      {isSuper && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Protected
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

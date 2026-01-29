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
import { Mail, Copy, CheckCircle, Clock, XCircle, Plus, Shield, UserMinus, Users, Trash2, RefreshCw } from "lucide-react";
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
  email?: string;
}

export function AdminInviteManager() {
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [currentAdmins, setCurrentAdmins] = useState<CurrentAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
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

      // Fetch profiles for each admin
      const adminsWithProfiles = await Promise.all(
        (data || []).map(async (admin) => {
          const { data: profile } = await supabase
            .from("student_profiles")
            .select("full_name")
            .eq("user_id", admin.user_id)
            .maybeSingle();
          
          // Get email from admin_invites if available
          const { data: invite } = await supabase
            .from("admin_invites")
            .select("email")
            .eq("status", "used")
            .maybeSingle();
          
          return {
            ...admin,
            profile: profile || undefined,
            email: invite?.email,
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

    setCreating(true);
    try {
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
        description: `Admin invite sent to ${newEmail}`,
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

  const removeAdmin = async (adminId: string, userId: string) => {
    if (userId === currentUserId) {
      toast({
        title: "Cannot Remove",
        description: "You cannot remove your own admin privileges.",
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
      description: "Invite link copied to clipboard",
    });
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    if (status === "used") {
      return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Used</Badge>;
    }
    if (new Date(expiresAt) < new Date()) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Expired</Badge>;
    }
    return <Badge variant="outline" className="border-amber-500 text-amber-600"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
  };

  const getTimeRemaining = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    if (expiry < new Date()) return "Expired";
    return formatDistanceToNow(expiry, { addSuffix: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Management
        </CardTitle>
        <CardDescription>
          Manage admin invites and current administrators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="invites" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="invites" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Invites ({invites.filter(i => i.status === "pending" && new Date(i.expires_at) > new Date()).length})
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Current Admins ({currentAdmins.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invites" className="space-y-6">
            {/* Create New Invite */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="invite-email" className="sr-only">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="Enter email to invite as admin"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => e.key === "Enter" && createInvite()}
                  />
                </div>
              </div>
              <Button onClick={createInvite} disabled={creating || !newEmail}>
                <Plus className="h-4 w-4 mr-2" />
                {creating ? "Creating..." : "Create Invite"}
              </Button>
            </div>

            {/* Invites Table */}
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading invites...
              </div>
            ) : invites.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                No admin invites yet. Create one above.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invites.map((invite) => (
                      <TableRow key={invite.id}>
                        <TableCell className="font-medium">{invite.email}</TableCell>
                        <TableCell>{getStatusBadge(invite.status, invite.expires_at)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {getTimeRemaining(invite.expires_at)}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {invite.status === "pending" && new Date(invite.expires_at) > new Date() && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyInviteLink(invite.invite_code)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
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
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading admins...
              </div>
            ) : currentAdmins.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                No admins found.
              </div>
            ) : (
              <div className="space-y-3">
                {currentAdmins.map((admin, index) => (
                  <div 
                    key={admin.id} 
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {admin.profile?.full_name?.[0]?.toUpperCase() || admin.email?.[0]?.toUpperCase() || "A"}
                      </div>
                      <div>
                        <p className="font-medium">
                          {admin.profile?.full_name || "Unknown Admin"}
                          {index === 0 && (
                            <Badge className="ml-2 bg-amber-500/10 text-amber-600 border-amber-200" variant="outline">
                              Super Admin
                            </Badge>
                          )}
                          {admin.user_id === currentUserId && (
                            <Badge className="ml-2" variant="secondary">You</Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{admin.email || "No email"}</p>
                        <p className="text-xs text-muted-foreground">
                          Admin since {format(new Date(admin.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    
                    {admin.user_id !== currentUserId && index !== 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <UserMinus className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Admin?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove admin privileges from {admin.profile?.full_name || admin.email}. They will no longer be able to access the admin dashboard.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => removeAdmin(admin.id, admin.user_id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove Admin
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

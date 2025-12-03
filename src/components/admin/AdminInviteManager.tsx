import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { z } from "zod";
import { Mail, Copy, CheckCircle, Clock, XCircle, Plus, Shield } from "lucide-react";
import { format } from "date-fns";

interface AdminInvite {
  id: string;
  email: string;
  invite_code: string;
  status: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
}

export function AdminInviteManager() {
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchInvites();
  }, []);

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
    } finally {
      setLoading(false);
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
    return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Invites
        </CardTitle>
        <CardDescription>
          Invite new administrators to the platform. Invites expire after 7 days.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
          <div className="text-center py-8 text-muted-foreground">Loading invites...</div>
        ) : invites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No admin invites yet. Create one above.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">{invite.email}</TableCell>
                    <TableCell>{getStatusBadge(invite.status, invite.expires_at)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(invite.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(invite.expires_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {invite.status === "pending" && new Date(invite.expires_at) > new Date() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyInviteLink(invite.invite_code)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Link
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Gift, CheckCircle, XCircle, Clock, Search } from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  college: string | null;
}

interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  monthly_points: number;
}

interface Redemption {
  id: string;
  user_id: string;
  points_spent: number;
  reward_name: string;
  reward_description: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
}

export function PointsManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [pointsToAward, setPointsToAward] = useState("");
  const [awardReason, setAwardReason] = useState("");
  const [awarding, setAwarding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchUserPoints(), fetchRedemptions()]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("student_profiles")
      .select("id, user_id, full_name, college")
      .order("full_name");
    setUsers(data || []);
  };

  const fetchUserPoints = async () => {
    const { data } = await supabase
      .from("user_points")
      .select("*")
      .order("total_points", { ascending: false });
    setUserPoints(data || []);
  };

  const fetchRedemptions = async () => {
    const { data } = await supabase
      .from("reward_redemptions")
      .select("*")
      .order("created_at", { ascending: false });
    setRedemptions(data || []);
  };

  const handleAwardPoints = async () => {
    if (!selectedUser || !pointsToAward) {
      toast({ title: "Error", description: "Please select a user and enter points", variant: "destructive" });
      return;
    }

    setAwarding(true);
    try {
      const points = parseInt(pointsToAward);
      if (isNaN(points) || points <= 0) {
        throw new Error("Invalid points value");
      }

      // Check if user already has points record
      const existingPoints = userPoints.find(p => p.user_id === selectedUser);

      if (existingPoints) {
        // Update existing record
        const { error } = await supabase
          .from("user_points")
          .update({
            total_points: existingPoints.total_points + points,
            monthly_points: (existingPoints.monthly_points || 0) + points,
            last_activity: new Date().toISOString(),
          })
          .eq("user_id", selectedUser);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from("user_points")
          .insert({
            user_id: selectedUser,
            total_points: points,
            monthly_points: points,
          });

        if (error) throw error;
      }

      toast({ title: "Success", description: `Awarded ${points} points successfully` });
      setSelectedUser("");
      setPointsToAward("");
      setAwardReason("");
      setDialogOpen(false);
      fetchUserPoints();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setAwarding(false);
    }
  };

  const handleUpdateRedemption = async (id: string, status: string, notes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: any = {
        status,
        processed_by: user?.id,
        processed_at: new Date().toISOString(),
      };
      
      if (notes) {
        updateData.admin_notes = notes;
      }

      const { error } = await supabase
        .from("reward_redemptions")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Success", description: `Redemption ${status}` });
      fetchRedemptions();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.user_id === userId);
    return user?.full_name || "Unknown User";
  };

  const getUserPointsTotal = (userId: string) => {
    const points = userPoints.find(p => p.user_id === userId);
    return points?.total_points || 0;
  };

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.college?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Points & Rewards Management</h2>
          <p className="text-sm text-muted-foreground">Award points and manage redemptions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Award Points</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Award Points to User</DialogTitle>
              <DialogDescription>Manually award points to a user for achievements or activities.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Select User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Search and select user..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {users.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.full_name} {user.college ? `(${user.college})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Points to Award</Label>
                <Input
                  type="number"
                  min="1"
                  value={pointsToAward}
                  onChange={(e) => setPointsToAward(e.target.value)}
                  placeholder="Enter points amount"
                />
              </div>
              <div className="space-y-2">
                <Label>Reason (Optional)</Label>
                <Textarea
                  value={awardReason}
                  onChange={(e) => setAwardReason(e.target.value)}
                  placeholder="Why are you awarding these points?"
                />
              </div>
              <Button onClick={handleAwardPoints} disabled={awarding} className="w-full">
                {awarding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Gift className="h-4 w-4 mr-2" />}
                Award Points
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="points" className="space-y-4">
        <TabsList>
          <TabsTrigger value="points">User Points</TabsTrigger>
          <TabsTrigger value="redemptions">Redemptions ({redemptions.filter(r => r.status === "pending").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="points" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead className="text-right">Total Points</TableHead>
                    <TableHead className="text-right">Monthly Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.slice(0, 50).map((user) => {
                    const points = userPoints.find(p => p.user_id === user.user_id);
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.college || "-"}</TableCell>
                        <TableCell className="text-right font-bold">{points?.total_points || 0}</TableCell>
                        <TableCell className="text-right">{points?.monthly_points || 0}</TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="redemptions" className="space-y-4">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptions.map((redemption) => (
                    <TableRow key={redemption.id}>
                      <TableCell className="font-medium">{getUserName(redemption.user_id)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{redemption.reward_name}</p>
                          {redemption.reward_description && (
                            <p className="text-xs text-muted-foreground">{redemption.reward_description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">{redemption.points_spent}</TableCell>
                      <TableCell>{getStatusBadge(redemption.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(redemption.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {redemption.status === "pending" && (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleUpdateRedemption(redemption.id, "approved")}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleUpdateRedemption(redemption.id, "rejected")}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {redemptions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No redemption requests yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

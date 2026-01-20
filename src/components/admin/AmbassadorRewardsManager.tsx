import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Gift, Star, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface Reward {
  id: string;
  name: string;
  description: string | null;
  reward_type: string;
  points_required: number;
  rank_required: number | null;
  quantity: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface RewardClaim {
  id: string;
  reward_id: string;
  ambassador_id: string;
  status: string;
  fulfillment_notes: string | null;
  created_at: string;
  reward?: Reward;
  ambassador?: {
    full_name: string;
    email: string;
    college: string;
  };
}

const REWARD_TYPES = [
  { value: "merchandise", label: "Merchandise" },
  { value: "stipend", label: "Stipend/Cash" },
  { value: "certificate", label: "Certificate" },
  { value: "food_coupon", label: "Food Coupon" },
  { value: "event_invite", label: "Event Invite" },
  { value: "opportunity", label: "Opportunity" },
];

export function AmbassadorRewardsManager() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    reward_type: "merchandise",
    points_required: 100,
    rank_required: "",
    quantity: "",
    image_url: "",
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rewardsRes, claimsRes] = await Promise.all([
        supabase.from("ambassador_rewards").select("*").order("points_required"),
        supabase
          .from("ambassador_reward_claims")
          .select(`*, reward:ambassador_rewards(*), ambassador:campus_ambassadors(full_name, email, college)`)
          .order("created_at", { ascending: false }),
      ]);

      if (rewardsRes.error) throw rewardsRes.error;
      if (claimsRes.error) throw claimsRes.error;

      setRewards(rewardsRes.data || []);
      setClaims(claimsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch rewards");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rewardData = {
      name: formData.name,
      description: formData.description || null,
      reward_type: formData.reward_type,
      points_required: formData.points_required,
      rank_required: formData.rank_required ? parseInt(formData.rank_required) : null,
      quantity: formData.quantity ? parseInt(formData.quantity) : null,
      image_url: formData.image_url || null,
      is_active: formData.is_active,
    };

    try {
      if (editingReward) {
        const { error } = await supabase
          .from("ambassador_rewards")
          .update(rewardData)
          .eq("id", editingReward.id);

        if (error) throw error;
        toast.success("Reward updated successfully");
      } else {
        const { error } = await supabase
          .from("ambassador_rewards")
          .insert([rewardData]);

        if (error) throw error;
        toast.success("Reward created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving reward:", error);
      toast.error("Failed to save reward");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      reward_type: "merchandise",
      points_required: 100,
      rank_required: "",
      quantity: "",
      image_url: "",
      is_active: true,
    });
    setEditingReward(null);
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description || "",
      reward_type: reward.reward_type,
      points_required: reward.points_required,
      rank_required: reward.rank_required?.toString() || "",
      quantity: reward.quantity?.toString() || "",
      image_url: reward.image_url || "",
      is_active: reward.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (rewardId: string) => {
    if (!confirm("Are you sure you want to delete this reward?")) return;

    try {
      const { error } = await supabase
        .from("ambassador_rewards")
        .delete()
        .eq("id", rewardId);

      if (error) throw error;
      toast.success("Reward deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting reward:", error);
      toast.error("Failed to delete reward");
    }
  };

  const updateClaimStatus = async (claimId: string, newStatus: string, notes?: string) => {
    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === "fulfilled") {
        updateData.fulfilled_at = new Date().toISOString();
      }
      if (notes) {
        updateData.fulfillment_notes = notes;
      }

      const { error } = await supabase
        .from("ambassador_reward_claims")
        .update(updateData)
        .eq("id", claimId);

      if (error) throw error;
      toast.success("Claim status updated");
      fetchData();
    } catch (error) {
      console.error("Error updating claim:", error);
      toast.error("Failed to update claim");
    }
  };

  const getRewardTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      merchandise: "bg-purple-500",
      stipend: "bg-green-500",
      certificate: "bg-blue-500",
      food_coupon: "bg-orange-500",
      event_invite: "bg-pink-500",
      opportunity: "bg-yellow-500",
    };
    const label = REWARD_TYPES.find((t) => t.value === type)?.label || type;
    return <Badge className={colors[type] || "bg-gray-500"}>{label}</Badge>;
  };

  const getClaimStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge className="bg-blue-500">Approved</Badge>;
      case "fulfilled":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Fulfilled</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingClaims = claims.filter((c) => c.status === "pending" || c.status === "approved");

  if (loading) {
    return <div className="text-center py-8">Loading rewards...</div>;
  }

  return (
    <Tabs defaultValue="rewards" className="space-y-4">
      <TabsList>
        <TabsTrigger value="rewards">Rewards Catalog</TabsTrigger>
        <TabsTrigger value="claims">
          Claims {pendingClaims.length > 0 && <Badge variant="destructive" className="ml-2">{pendingClaims.length}</Badge>}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="rewards">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Rewards Catalog
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reward
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingReward ? "Edit Reward" : "Add Reward"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Reward Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="AITD T-Shirt"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Reward description..."
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reward_type">Reward Type</Label>
                      <Select
                        value={formData.reward_type}
                        onValueChange={(value) => setFormData({ ...formData, reward_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REWARD_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="points_required">Points Required</Label>
                      <Input
                        id="points_required"
                        type="number"
                        min={1}
                        value={formData.points_required}
                        onChange={(e) => setFormData({ ...formData, points_required: parseInt(e.target.value) || 100 })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="rank_required">Rank Required (Optional)</Label>
                      <Input
                        id="rank_required"
                        type="number"
                        min={1}
                        value={formData.rank_required}
                        onChange={(e) => setFormData({ ...formData, rank_required: e.target.value })}
                        placeholder="Top N only"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity (Optional)</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min={1}
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="Unlimited"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingReward ? "Update" : "Add"} Reward
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {rewards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No rewards created yet. Add your first reward to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reward</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards.map((reward) => (
                    <TableRow key={reward.id}>
                      <TableCell>
                        <div className="font-medium">{reward.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {reward.description}
                        </div>
                      </TableCell>
                      <TableCell>{getRewardTypeBadge(reward.reward_type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {reward.points_required}
                        </div>
                      </TableCell>
                      <TableCell>
                        {reward.rank_required ? `Top ${reward.rank_required}` : "-"}
                      </TableCell>
                      <TableCell>
                        {reward.quantity || "∞"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={reward.is_active ? "default" : "secondary"}>
                          {reward.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(reward)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(reward.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="claims">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Reward Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            {claims.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No reward claims yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ambassador</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Claimed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell>
                        <div className="font-medium">{claim.ambassador?.full_name}</div>
                        <div className="text-xs text-muted-foreground">{claim.ambassador?.college}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{claim.reward?.name}</div>
                        {claim.reward && getRewardTypeBadge(claim.reward.reward_type)}
                      </TableCell>
                      <TableCell>{getClaimStatusBadge(claim.status)}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(claim.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {claim.status !== "fulfilled" && claim.status !== "rejected" && (
                          <div className="flex gap-2">
                            {claim.status === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => updateClaimStatus(claim.id, "approved")}
                              >
                                Approve
                              </Button>
                            )}
                            {claim.status === "approved" && (
                              <Button
                                size="sm"
                                className="bg-green-500"
                                onClick={() => updateClaimStatus(claim.id, "fulfilled")}
                              >
                                Mark Fulfilled
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateClaimStatus(claim.id, "rejected")}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

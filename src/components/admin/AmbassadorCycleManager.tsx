import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Calendar, Users, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface ProgramCycle {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  rewards_description: string | null;
  created_at: string;
}

export function AmbassadorCycleManager() {
  const [cycles, setCycles] = useState<ProgramCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<ProgramCycle | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    is_active: false,
    rewards_description: "",
  });

  useEffect(() => {
    fetchCycles();
  }, []);

  const fetchCycles = async () => {
    try {
      const { data, error } = await supabase
        .from("ambassador_program_cycles")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      setCycles(data || []);
    } catch (error) {
      console.error("Error fetching cycles:", error);
      toast.error("Failed to fetch program cycles");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCycle) {
        const { error } = await supabase
          .from("ambassador_program_cycles")
          .update(formData)
          .eq("id", editingCycle.id);

        if (error) throw error;
        toast.success("Program cycle updated successfully");
      } else {
        const { error } = await supabase
          .from("ambassador_program_cycles")
          .insert([formData]);

        if (error) throw error;
        toast.success("Program cycle created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCycles();
    } catch (error) {
      console.error("Error saving cycle:", error);
      toast.error("Failed to save program cycle");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      is_active: false,
      rewards_description: "",
    });
    setEditingCycle(null);
  };

  const handleEdit = (cycle: ProgramCycle) => {
    setEditingCycle(cycle);
    setFormData({
      name: cycle.name,
      description: cycle.description || "",
      start_date: cycle.start_date,
      end_date: cycle.end_date,
      is_active: cycle.is_active,
      rewards_description: cycle.rewards_description || "",
    });
    setIsDialogOpen(true);
  };

  const toggleActive = async (cycle: ProgramCycle) => {
    try {
      // If activating, deactivate all other cycles first
      if (!cycle.is_active) {
        await supabase
          .from("ambassador_program_cycles")
          .update({ is_active: false })
          .neq("id", cycle.id);
      }

      const { error } = await supabase
        .from("ambassador_program_cycles")
        .update({ is_active: !cycle.is_active })
        .eq("id", cycle.id);

      if (error) throw error;
      toast.success(`Cycle ${!cycle.is_active ? "activated" : "deactivated"}`);
      fetchCycles();
    } catch (error) {
      console.error("Error toggling cycle:", error);
      toast.error("Failed to update cycle status");
    }
  };

  const getDurationMonths = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return months;
  };

  if (loading) {
    return <div className="text-center py-8">Loading program cycles...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Program Cycles
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Cycle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCycle ? "Edit Program Cycle" : "Create Program Cycle"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Cycle Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Spring 2026 Batch"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Program description..."
                    rows={3}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="rewards_description">Rewards Description</Label>
                  <Textarea
                    id="rewards_description"
                    value={formData.rewards_description}
                    onChange={(e) => setFormData({ ...formData, rewards_description: e.target.value })}
                    placeholder="List rewards ambassadors can earn..."
                    rows={2}
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Set as Active Cycle</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCycle ? "Update" : "Create"} Cycle
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {cycles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No program cycles created yet. Create your first cycle to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cycles.map((cycle) => (
                <TableRow key={cycle.id}>
                  <TableCell className="font-medium">{cycle.name}</TableCell>
                  <TableCell>{getDurationMonths(cycle.start_date, cycle.end_date)} months</TableCell>
                  <TableCell>
                    {format(new Date(cycle.start_date), "MMM d, yyyy")} -{" "}
                    {format(new Date(cycle.end_date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {cycle.is_active ? (
                      <Badge className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(cycle)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={cycle.is_active ? "secondary" : "default"}
                        size="sm"
                        onClick={() => toggleActive(cycle)}
                      >
                        {cycle.is_active ? "Deactivate" : "Activate"}
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
  );
}

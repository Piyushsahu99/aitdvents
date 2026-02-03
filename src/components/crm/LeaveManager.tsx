import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useLeaves } from "@/hooks/useLeaves";
import { Plus, Calendar, Clock, Check, X, Briefcase, Heart, User, CalendarDays } from "lucide-react";
import { format, differenceInDays } from "date-fns";

const LEAVE_TYPES = [
  { id: "vacation", label: "Vacation", icon: Briefcase },
  { id: "sick", label: "Sick Leave", icon: Heart },
  { id: "personal", label: "Personal", icon: User },
  { id: "other", label: "Other", icon: CalendarDays },
];

export function LeaveManager() {
  const { leaves, isLoading, createLeave, approveLeave, rejectLeave, deleteLeave, pendingCount, approvedCount, rejectedCount } = useLeaves();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const [formData, setFormData] = useState({
    team_member_id: "",
    leave_type: "vacation",
    start_date: "",
    end_date: "",
    reason: "",
  });

  useEffect(() => {
    fetchTeamMembers();
    fetchCurrentMember();
  }, []);

  const fetchTeamMembers = async () => {
    const { data } = await supabase.from("team_members").select("id, full_name, user_id");
    setTeamMembers(data || []);
  };

  const fetchCurrentMember = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("team_members").select("*").eq("user_id", user.id).single();
      setCurrentMember(data);
    }
  };

  const resetForm = () => {
    setFormData({
      team_member_id: currentMember?.id || "",
      leave_type: "vacation",
      start_date: "",
      end_date: "",
      reason: "",
    });
  };

  const handleCreate = async () => {
    if (!formData.team_member_id || !formData.start_date || !formData.end_date) return;
    
    await createLeave({
      team_member_id: formData.team_member_id,
      leave_type: formData.leave_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      reason: formData.reason || null,
    });
    resetForm();
    setIsCreateOpen(false);
  };

  const getMemberName = (memberId: string | null) => {
    if (!memberId) return "Unknown";
    const member = teamMembers.find(m => m.id === memberId);
    return member?.full_name || "Unknown";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-success text-success-foreground";
      case "rejected": return "bg-destructive text-destructive-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      default: return "bg-muted";
    }
  };

  const getLeaveTypeIcon = (type: string) => {
    const leaveType = LEAVE_TYPES.find(t => t.id === type);
    return leaveType?.icon || CalendarDays;
  };

  const filteredLeaves = leaves.filter(leave => {
    if (activeTab === "all") return true;
    return leave.status === activeTab;
  });

  const LeaveForm = () => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Team Member</Label>
        <Select 
          value={formData.team_member_id} 
          onValueChange={v => setFormData({ ...formData, team_member_id: v })}
        >
          <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
          <SelectContent>
            {teamMembers.map(member => (
              <SelectItem key={member.id} value={member.id}>{member.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Leave Type</Label>
        <Select value={formData.leave_type} onValueChange={v => setFormData({ ...formData, leave_type: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {LEAVE_TYPES.map(type => (
              <SelectItem key={type.id} value={type.id}>
                <div className="flex items-center gap-2">
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Start Date</Label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={e => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>End Date</Label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={e => setFormData({ ...formData, end_date: e.target.value })}
            min={formData.start_date}
          />
        </div>
      </div>
      {formData.start_date && formData.end_date && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
          <Clock className="h-4 w-4" />
          <span>
            Duration: {differenceInDays(new Date(formData.end_date), new Date(formData.start_date)) + 1} day(s)
          </span>
        </div>
      )}
      <div className="grid gap-2">
        <Label>Reason (Optional)</Label>
        <Textarea
          value={formData.reason}
          onChange={e => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Briefly explain your leave request..."
          rows={3}
        />
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading leave data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{leaves.length}</p>
                <p className="text-xs text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{approvedCount}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <X className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{rejectedCount}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Leave Management
              </CardTitle>
              <CardDescription>Manage team leave requests</CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={resetForm}>
                  <Plus className="h-4 w-4" /> Request Leave
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Leave</DialogTitle>
                  <DialogDescription>Submit a new leave request</DialogDescription>
                </DialogHeader>
                <LeaveForm />
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleCreate} 
                    disabled={!formData.team_member_id || !formData.start_date || !formData.end_date}
                  >
                    Submit Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filter Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Leave Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="hidden md:table-cell">Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No leave requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeaves.map(leave => {
                    const LeaveIcon = getLeaveTypeIcon(leave.leave_type);
                    const days = differenceInDays(new Date(leave.end_date), new Date(leave.start_date)) + 1;
                    
                    return (
                      <TableRow key={leave.id}>
                        <TableCell>
                          <span className="font-medium text-sm">{getMemberName(leave.team_member_id)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <LeaveIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm capitalize">{leave.leave_type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(new Date(leave.start_date), "MMM dd")} - {format(new Date(leave.end_date), "MMM dd")}</div>
                            <div className="text-xs text-muted-foreground">{days} day(s)</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                            {leave.reason || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getStatusColor(leave.status)}`}>
                            {leave.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {leave.status === "pending" && currentMember && (
                            <div className="flex gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 text-success"
                                onClick={() => approveLeave(leave.id, currentMember.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 text-destructive"
                                onClick={() => rejectLeave(leave.id, currentMember.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {leave.status !== "pending" && (
                            <span className="text-xs text-muted-foreground">
                              {leave.approved_at && format(new Date(leave.approved_at), "MMM dd")}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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
import { supabase } from "@/integrations/supabase/client";
import { useTimeLog } from "@/hooks/useTimeLog";
import { useTasks } from "@/hooks/useTasks";
import { Plus, Clock, Calendar, Edit, Trash2, Timer, TrendingUp, FileText } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";

export function TimeLogManager() {
  const { timeLogs, isLoading, createTimeLog, updateTimeLog, deleteTimeLog, totalHours, weeklyHours } = useTimeLog();
  const { tasks } = useTasks();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"list" | "timesheet">("list");

  const [formData, setFormData] = useState({
    task_id: "",
    user_id: "",
    hours: "",
    description: "",
    logged_at: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    const { data } = await supabase.from("team_members").select("id, full_name, user_id");
    setTeamMembers(data || []);
  };

  const resetForm = () => {
    setFormData({
      task_id: "",
      user_id: "",
      hours: "",
      description: "",
      logged_at: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const handleCreate = async () => {
    if (!formData.task_id || !formData.user_id) return;
    await createTimeLog({
      task_id: formData.task_id,
      user_id: formData.user_id,
      hours: parseFloat(formData.hours) || 0,
      description: formData.description || null,
      logged_at: new Date(formData.logged_at).toISOString(),
    });
    resetForm();
    setIsCreateOpen(false);
  };

  const handleEdit = async () => {
    if (!editingLog) return;
    await updateTimeLog(editingLog.id, {
      task_id: formData.task_id,
      user_id: formData.user_id,
      hours: parseFloat(formData.hours) || 0,
      description: formData.description || null,
      logged_at: new Date(formData.logged_at).toISOString(),
    });
    setEditingLog(null);
    resetForm();
  };

  const openEdit = (log: any) => {
    setEditingLog(log);
    setFormData({
      task_id: log.task_id || "",
      user_id: log.user_id || "",
      hours: log.hours.toString(),
      description: log.description || "",
      logged_at: format(new Date(log.logged_at), "yyyy-MM-dd"),
    });
  };

  const getTaskTitle = (taskId: string | null) => {
    if (!taskId) return "General";
    const task = tasks.find(t => t.id === taskId);
    return task?.title || "Unknown Task";
  };

  const getMemberName = (userId: string | null) => {
    if (!userId) return "Unassigned";
    const member = teamMembers.find(m => m.user_id === userId);
    return member?.full_name || "Unknown";
  };

  // Timesheet view data
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getHoursForDay = (userId: string, day: Date) => {
    return timeLogs
      .filter(log => log.user_id === userId && isSameDay(new Date(log.logged_at), day))
      .reduce((sum, log) => sum + log.hours, 0);
  };

  const TimeLogForm = () => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Task (Optional)</Label>
        <Select value={formData.task_id} onValueChange={v => setFormData({ ...formData, task_id: v })}>
          <SelectTrigger><SelectValue placeholder="Select task" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">General / No Task</SelectItem>
            {tasks.map(task => (
              <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Team Member</Label>
        <Select value={formData.user_id} onValueChange={v => setFormData({ ...formData, user_id: v })}>
          <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
          <SelectContent>
            {teamMembers.map(member => (
              <SelectItem key={member.id} value={member.user_id}>{member.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Hours *</Label>
          <Input
            type="number"
            step="0.5"
            min="0"
            value={formData.hours}
            onChange={e => setFormData({ ...formData, hours: e.target.value })}
            placeholder="e.g., 2.5"
          />
        </div>
        <div className="grid gap-2">
          <Label>Date</Label>
          <Input
            type="date"
            value={formData.logged_at}
            onChange={e => setFormData({ ...formData, logged_at: e.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          placeholder="What did you work on?"
          rows={3}
        />
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading time logs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Timer className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{weeklyHours.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-info" />
              <div>
                <p className="text-2xl font-bold">{timeLogs.length}</p>
                <p className="text-xs text-muted-foreground">Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-2xl font-bold">
                  {timeLogs.length > 0 ? (totalHours / timeLogs.length).toFixed(1) : 0}
                </p>
                <p className="text-xs text-muted-foreground">Avg per Entry</p>
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
                <Clock className="h-5 w-5 text-primary" />
                Time Tracking
              </CardTitle>
              <CardDescription>Log and track work hours</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="flex gap-1 bg-muted p-1 rounded-lg">
                <Button 
                  size="sm" 
                  variant={viewMode === "list" ? "default" : "ghost"}
                  onClick={() => setViewMode("list")}
                >
                  List
                </Button>
                <Button 
                  size="sm" 
                  variant={viewMode === "timesheet" ? "default" : "ghost"}
                  onClick={() => setViewMode("timesheet")}
                >
                  Timesheet
                </Button>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={resetForm}>
                    <Plus className="h-4 w-4" /> Log Time
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Time</DialogTitle>
                    <DialogDescription>Record work hours for a task</DialogDescription>
                  </DialogHeader>
                  <TimeLogForm />
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={!formData.hours}>Log Time</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {viewMode === "list" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead className="hidden md:table-cell">Member</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead className="hidden sm:table-cell">Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No time entries yet. Start logging your work!
                      </TableCell>
                    </TableRow>
                  ) : (
                    timeLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {format(new Date(log.logged_at), "MMM dd")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium line-clamp-1">
                            {getTaskTitle(log.task_id)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm">{getMemberName(log.user_id)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{log.hours}h</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                            {log.description || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(log)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7 text-destructive" 
                              onClick={() => deleteTimeLog(log.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Member</TableHead>
                    {weekDays.map(day => (
                      <TableHead key={day.toISOString()} className="text-center min-w-[60px]">
                        <div className="text-xs">{format(day, "EEE")}</div>
                        <div className="text-xs text-muted-foreground">{format(day, "dd")}</div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No team members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    teamMembers.map(member => {
                      const weekTotal = weekDays.reduce((sum, day) => sum + getHoursForDay(member.user_id, day), 0);
                      return (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.full_name}</TableCell>
                          {weekDays.map(day => {
                            const hours = getHoursForDay(member.user_id, day);
                            return (
                              <TableCell key={day.toISOString()} className="text-center">
                                {hours > 0 ? (
                                  <Badge variant="secondary" className="text-xs">{hours}h</Badge>
                                ) : (
                                  <span className="text-muted-foreground text-xs">-</span>
                                )}
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center">
                            <Badge variant={weekTotal >= 40 ? "default" : "outline"}>
                              {weekTotal}h
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingLog} onOpenChange={open => !open && setEditingLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
            <DialogDescription>Update logged hours</DialogDescription>
          </DialogHeader>
          <TimeLogForm />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditingLog(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={!formData.hours}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

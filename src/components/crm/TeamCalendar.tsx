import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Calendar, Users, Palmtree, Briefcase, HeartPulse } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

interface TeamMember {
  id: string;
  full_name: string;
  department: string | null;
}

interface LeaveEntry {
  id: string;
  team_member_id: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  status: string;
  reason: string | null;
  member?: TeamMember;
}

export function TeamCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [leaves, setLeaves] = useState<LeaveEntry[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const fetchData = async () => {
    try {
      const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");

      const [membersRes, leavesRes] = await Promise.all([
        supabase
          .from("team_members")
          .select("id, full_name, department")
          .eq("status", "active"),
        supabase
          .from("team_leaves")
          .select("*")
          .eq("status", "approved")
          .or(`start_date.lte.${monthEnd},end_date.gte.${monthStart}`),
      ]);

      if (membersRes.data) setMembers(membersRes.data);
      
      if (leavesRes.data) {
        const leavesWithMembers = leavesRes.data.map(leave => ({
          ...leave,
          member: membersRes.data?.find(m => m.id === leave.team_member_id),
        }));
        setLeaves(leavesWithMembers);
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLeavesForDate = (date: Date) => {
    return leaves.filter(leave => {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      return date >= start && date <= end;
    });
  };

  const getLeaveTypeIcon = (type: string) => {
    switch (type) {
      case "vacation": return <Palmtree className="h-3 w-3" />;
      case "sick": return <HeartPulse className="h-3 w-3" />;
      case "personal": return <Briefcase className="h-3 w-3" />;
      default: return <Calendar className="h-3 w-3" />;
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case "vacation": return "bg-success/20 text-success border-success/30";
      case "sick": return "bg-destructive/20 text-destructive border-destructive/30";
      case "personal": return "bg-warning/20 text-warning border-warning/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0 = Sunday)
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array(startDayOfWeek).fill(null);

  const selectedDateLeaves = selectedDate ? getLeavesForDate(selectedDate) : [];

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading calendar...</div>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Team Availability
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <Button size="icon" variant="ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Padding days */}
            {paddingDays.map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}

            {/* Actual days */}
            {days.map(day => {
              const dayLeaves = getLeavesForDate(day);
              const hasLeaves = dayLeaves.length > 0;
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    aspect-square p-1 rounded-lg text-sm transition-all relative
                    hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50
                    ${isSelected ? "bg-primary text-primary-foreground" : ""}
                    ${isToday && !isSelected ? "ring-2 ring-primary/50" : ""}
                    ${!isSameMonth(day, currentMonth) ? "text-muted-foreground" : ""}
                  `}
                >
                  <span className="block">{format(day, "d")}</span>
                  {hasLeaves && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {dayLeaves.slice(0, 3).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-destructive" />
                      ))}
                      {dayLeaves.length > 3 && (
                        <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Vacation</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span>Sick Leave</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span>Personal</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-secondary" />
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a Date"}
          </CardTitle>
          <CardDescription>
            {selectedDate 
              ? `${selectedDateLeaves.length} team member${selectedDateLeaves.length !== 1 ? "s" : ""} on leave`
              : "Click a date to see who's away"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedDate ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a date to view details</p>
            </div>
          ) : selectedDateLeaves.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">Full Team Available</p>
              <p className="text-xs">No one is on leave this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateLeaves.map(leave => (
                <div key={leave.id} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{leave.member?.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(leave.start_date), "MMM d")} - {format(new Date(leave.end_date), "MMM d")}
                      </p>
                      {leave.reason && (
                        <p className="text-xs mt-1 text-muted-foreground line-clamp-2">{leave.reason}</p>
                      )}
                    </div>
                    <Badge variant="outline" className={`text-[10px] gap-1 ${getLeaveTypeColor(leave.leave_type)}`}>
                      {getLeaveTypeIcon(leave.leave_type)}
                      {leave.leave_type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

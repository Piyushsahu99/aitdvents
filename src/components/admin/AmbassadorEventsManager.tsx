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
import { Plus, Edit, Trash2, PartyPopper, MapPin, Video, Users } from "lucide-react";
import { format } from "date-fns";

interface AmbassadorEvent {
  id: string;
  cycle_id: string | null;
  title: string;
  description: string | null;
  event_type: string;
  event_date: string;
  location: string | null;
  meeting_link: string | null;
  eligible_min_rank: number | null;
  eligible_min_points: number | null;
  food_coupon_value: number;
  max_attendees: number | null;
  is_active: boolean;
  created_at: string;
}

interface EventRegistration {
  id: string;
  event_id: string;
  ambassador_id: string;
  status: string;
  food_coupon_code: string | null;
  created_at: string;
  ambassador?: {
    full_name: string;
    email: string;
    college: string;
  };
}

const EVENT_TYPES = [
  { value: "online_party", label: "Online Party", icon: Video },
  { value: "offline_meetup", label: "Offline Meetup", icon: MapPin },
  { value: "workshop", label: "Workshop", icon: Users },
];

export function AmbassadorEventsManager() {
  const [events, setEvents] = useState<AmbassadorEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [cycles, setCycles] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AmbassadorEvent | null>(null);
  const [selectedEventForRegs, setSelectedEventForRegs] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cycle_id: "",
    title: "",
    description: "",
    event_type: "online_party",
    event_date: "",
    location: "",
    meeting_link: "",
    eligible_min_rank: "",
    eligible_min_points: "",
    food_coupon_value: 0,
    max_attendees: "",
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, cyclesRes] = await Promise.all([
        supabase.from("ambassador_events").select("*").order("event_date", { ascending: false }),
        supabase.from("ambassador_program_cycles").select("id, name").order("start_date", { ascending: false }),
      ]);

      if (eventsRes.error) throw eventsRes.error;
      if (cyclesRes.error) throw cyclesRes.error;

      setEvents(eventsRes.data || []);
      setCycles(cyclesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from("ambassador_event_registrations")
        .select(`*, ambassador:campus_ambassadors(full_name, email, college)`)
        .eq("event_id", eventId)
        .order("created_at");

      if (error) throw error;
      setRegistrations(data || []);
      setSelectedEventForRegs(eventId);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Failed to fetch registrations");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const eventData = {
      cycle_id: formData.cycle_id || null,
      title: formData.title,
      description: formData.description || null,
      event_type: formData.event_type,
      event_date: formData.event_date,
      location: formData.location || null,
      meeting_link: formData.meeting_link || null,
      eligible_min_rank: formData.eligible_min_rank ? parseInt(formData.eligible_min_rank) : null,
      eligible_min_points: formData.eligible_min_points ? parseInt(formData.eligible_min_points) : null,
      food_coupon_value: formData.food_coupon_value,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
      is_active: formData.is_active,
    };

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from("ambassador_events")
          .update(eventData)
          .eq("id", editingEvent.id);

        if (error) throw error;
        toast.success("Event updated successfully");
      } else {
        const { error } = await supabase
          .from("ambassador_events")
          .insert([eventData]);

        if (error) throw error;
        toast.success("Event created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Failed to save event");
    }
  };

  const resetForm = () => {
    setFormData({
      cycle_id: "",
      title: "",
      description: "",
      event_type: "online_party",
      event_date: "",
      location: "",
      meeting_link: "",
      eligible_min_rank: "",
      eligible_min_points: "",
      food_coupon_value: 0,
      max_attendees: "",
      is_active: true,
    });
    setEditingEvent(null);
  };

  const handleEdit = (event: AmbassadorEvent) => {
    setEditingEvent(event);
    setFormData({
      cycle_id: event.cycle_id || "",
      title: event.title,
      description: event.description || "",
      event_type: event.event_type,
      event_date: event.event_date.slice(0, 16),
      location: event.location || "",
      meeting_link: event.meeting_link || "",
      eligible_min_rank: event.eligible_min_rank?.toString() || "",
      eligible_min_points: event.eligible_min_points?.toString() || "",
      food_coupon_value: event.food_coupon_value,
      max_attendees: event.max_attendees?.toString() || "",
      is_active: event.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const { error } = await supabase
        .from("ambassador_events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
      toast.success("Event deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const updateAttendance = async (regId: string, status: string) => {
    try {
      const updateData: Record<string, unknown> = { status };
      if (status === "attended") {
        updateData.attended_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("ambassador_event_registrations")
        .update(updateData)
        .eq("id", regId);

      if (error) throw error;
      toast.success("Attendance updated");
      if (selectedEventForRegs) {
        fetchRegistrations(selectedEventForRegs);
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast.error("Failed to update attendance");
    }
  };

  const getEventTypeBadge = (type: string) => {
    const eventType = EVENT_TYPES.find((t) => t.value === type);
    const Icon = eventType?.icon || PartyPopper;
    const colors: Record<string, string> = {
      online_party: "bg-purple-500",
      offline_meetup: "bg-blue-500",
      workshop: "bg-green-500",
    };
    return (
      <Badge className={colors[type] || "bg-gray-500"}>
        <Icon className="h-3 w-3 mr-1" />
        {eventType?.label || type}
      </Badge>
    );
  };

  const getRegistrationCount = (eventId: string) => {
    return registrations.filter((r) => r.event_id === eventId).length;
  };

  if (loading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  return (
    <Tabs defaultValue="events" className="space-y-4">
      <TabsList>
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="registrations">Registrations</TabsTrigger>
      </TabsList>

      <TabsContent value="events">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5" />
              Ambassador Events
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingEvent ? "Edit Event" : "Create Event"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ambassador Online Party"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cycle_id">Program Cycle</Label>
                      <Select
                        value={formData.cycle_id}
                        onValueChange={(value) => setFormData({ ...formData, cycle_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select cycle" />
                        </SelectTrigger>
                        <SelectContent>
                          {cycles.map((cycle) => (
                            <SelectItem key={cycle.id} value={cycle.id}>
                              {cycle.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="event_type">Event Type</Label>
                      <Select
                        value={formData.event_type}
                        onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="event_date">Event Date & Time</Label>
                      <Input
                        id="event_date"
                        type="datetime-local"
                        value={formData.event_date}
                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_attendees">Max Attendees</Label>
                      <Input
                        id="max_attendees"
                        type="number"
                        min={1}
                        value={formData.max_attendees}
                        onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                        placeholder="Unlimited"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Event description..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location (for offline)</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Venue address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="meeting_link">Meeting Link (for online)</Label>
                      <Input
                        id="meeting_link"
                        value={formData.meeting_link}
                        onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                        placeholder="https://meet.google.com/..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="eligible_min_rank">Eligible Min Rank</Label>
                      <Input
                        id="eligible_min_rank"
                        type="number"
                        min={1}
                        value={formData.eligible_min_rank}
                        onChange={(e) => setFormData({ ...formData, eligible_min_rank: e.target.value })}
                        placeholder="Top N only"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eligible_min_points">Eligible Min Points</Label>
                      <Input
                        id="eligible_min_points"
                        type="number"
                        min={0}
                        value={formData.eligible_min_points}
                        onChange={(e) => setFormData({ ...formData, eligible_min_points: e.target.value })}
                        placeholder="Min points required"
                      />
                    </div>
                    <div>
                      <Label htmlFor="food_coupon_value">Food Coupon Value (₹)</Label>
                      <Input
                        id="food_coupon_value"
                        type="number"
                        min={0}
                        value={formData.food_coupon_value}
                        onChange={(e) => setFormData({ ...formData, food_coupon_value: parseInt(e.target.value) || 0 })}
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
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingEvent ? "Update" : "Create"} Event
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No events created yet. Create your first event to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Eligibility</TableHead>
                    <TableHead>Coupon</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {event.location || event.meeting_link || "No location set"}
                        </div>
                      </TableCell>
                      <TableCell>{getEventTypeBadge(event.event_type)}</TableCell>
                      <TableCell>
                        {format(new Date(event.event_date), "MMM d, yyyy h:mm a")}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {event.eligible_min_rank && <div>Top {event.eligible_min_rank}</div>}
                          {event.eligible_min_points && <div>{event.eligible_min_points}+ pts</div>}
                          {!event.eligible_min_rank && !event.eligible_min_points && "All"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.food_coupon_value > 0 ? `₹${event.food_coupon_value}` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={event.is_active ? "default" : "secondary"}>
                          {event.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchRegistrations(event.id)}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(event.id)}>
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

      <TabsContent value="registrations">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Event Registrations
              {selectedEventForRegs && (
                <Badge variant="outline">
                  {events.find((e) => e.id === selectedEventForRegs)?.title}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Select value={selectedEventForRegs || ""} onValueChange={fetchRegistrations}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select an event to view registrations" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!selectedEventForRegs ? (
              <div className="text-center py-8 text-muted-foreground">
                Select an event to view its registrations.
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No registrations for this event yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ambassador</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Coupon Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>
                        <div className="font-medium">{reg.ambassador?.full_name}</div>
                        <div className="text-xs text-muted-foreground">{reg.ambassador?.email}</div>
                      </TableCell>
                      <TableCell>{reg.ambassador?.college}</TableCell>
                      <TableCell>
                        {reg.food_coupon_code ? (
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {reg.food_coupon_code}
                          </code>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={reg.status === "attended" ? "default" : "secondary"}>
                          {reg.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(reg.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={reg.status}
                          onValueChange={(value) => updateAttendance(reg.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="registered">Registered</SelectItem>
                            <SelectItem value="attended">Attended</SelectItem>
                            <SelectItem value="no_show">No Show</SelectItem>
                          </SelectContent>
                        </Select>
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

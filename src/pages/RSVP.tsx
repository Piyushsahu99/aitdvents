import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  CheckCircle,
  Clock,
  Monitor,
  Building2,
  Sparkles,
  PartyPopper,
  Phone,
  Mail,
  User
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  is_online: boolean;
  is_free: boolean;
  poster_url: string | null;
  participants: number | null;
}

interface RSVP {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  attending_mode: string;
  status: string;
  created_at: string;
  events?: Event;
}

const RSVP = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [myRsvps, setMyRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    attendingMode: "online",
    dietaryRequirements: "",
    additionalNotes: ""
  });

  useEffect(() => {
    fetchEvents();
    fetchMyRsvps();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("status", "live")
      .gte("date", new Date().toISOString())
      .order("date", { ascending: true });
    
    if (data) setEvents(data);
    setLoading(false);
  };

  const fetchMyRsvps = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("event_rsvps")
        .select(`
          *,
          events (*)
        `)
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .order("created_at", { ascending: false });
      
      if (data) setMyRsvps(data as RSVP[]);
    }
  };

  const handleOpenRsvp = async (event: Event) => {
    setSelectedEvent(event);
    
    // Pre-fill user data if logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("full_name, phone")
        .eq("user_id", user.id)
        .single();
      
      setFormData(prev => ({
        ...prev,
        email: user.email || "",
        fullName: profile?.full_name || "",
        phone: profile?.phone || "",
        attendingMode: event.is_online ? "online" : "offline"
      }));
    }
    
    setRsvpModalOpen(true);
  };

  const handleSubmitRsvp = async () => {
    if (!selectedEvent) return;
    
    if (!formData.fullName.trim() || !formData.email.trim()) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("event_rsvps")
      .insert({
        event_id: selectedEvent.id,
        user_id: user?.id || null,
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        attending_mode: formData.attendingMode,
        dietary_requirements: formData.dietaryRequirements.trim() || null,
        additional_notes: formData.additionalNotes.trim() || null
      });

    if (error) {
      if (error.code === "23505") {
        toast({ title: "You've already RSVP'd for this event", variant: "destructive" });
      } else {
        toast({ title: "Failed to submit RSVP", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ 
        title: "RSVP Confirmed! 🎉", 
        description: `You're registered for ${selectedEvent.title}` 
      });
      setRsvpModalOpen(false);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        attendingMode: "online",
        dietaryRequirements: "",
        additionalNotes: ""
      });
      fetchMyRsvps();
    }
    
    setSubmitting(false);
  };

  const handleCancelRsvp = async (rsvpId: string) => {
    const { error } = await supabase
      .from("event_rsvps")
      .update({ status: "cancelled" })
      .eq("id", rsvpId);

    if (error) {
      toast({ title: "Failed to cancel RSVP", variant: "destructive" });
    } else {
      toast({ title: "RSVP cancelled" });
      fetchMyRsvps();
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === "all") return true;
    if (filter === "online") return event.is_online;
    if (filter === "offline") return !event.is_online;
    return true;
  });

  const hasRsvp = (eventId: string) => {
    return myRsvps.some(r => r.event_id === eventId && r.status === "confirmed");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-500/10" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <PartyPopper className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Reserve Your Spot</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Event RSVP
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            RSVP for upcoming events - both online and offline. Get reminders and secure your spot!
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="upcoming" className="gap-2">
              <Calendar className="w-4 h-4" /> Upcoming Events
            </TabsTrigger>
            <TabsTrigger value="my-rsvps" className="gap-2">
              <Ticket className="w-4 h-4" /> My RSVPs
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Events Tab */}
          <TabsContent value="upcoming">
            {/* Filter */}
            <div className="flex justify-center gap-2 mb-8">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All Events
              </Button>
              <Button
                variant={filter === "online" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("online")}
                className="gap-2"
              >
                <Monitor className="w-4 h-4" /> Online
              </Button>
              <Button
                variant={filter === "offline" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("offline")}
                className="gap-2"
              >
                <Building2 className="w-4 h-4" /> Offline
              </Button>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg" />
                    <CardContent className="p-4 space-y-3">
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-10 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <Card className="border-2 border-dashed max-w-md mx-auto">
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Upcoming Events</h3>
                  <p className="text-muted-foreground">Check back soon for new events!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden border-2 hover:border-primary/30 transition-all group">
                    <div className="relative h-48 bg-gradient-to-br from-primary/20 to-purple-600/20">
                      {event.poster_url ? (
                        <img
                          src={event.poster_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="w-16 h-16 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className={event.is_online ? "bg-blue-500" : "bg-green-500"}>
                          {event.is_online ? "Online" : "Offline"}
                        </Badge>
                        {event.is_free && <Badge variant="secondary">Free</Badge>}
                      </div>
                      {hasRsvp(event.id) && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-green-500 gap-1">
                            <CheckCircle className="w-3 h-3" /> RSVP'd
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{format(new Date(event.date), "PPP 'at' p")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        {event.participants && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{event.participants} attending</span>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => handleOpenRsvp(event)}
                        disabled={hasRsvp(event.id)}
                        className="w-full gap-2"
                      >
                        {hasRsvp(event.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4" /> Already RSVP'd
                          </>
                        ) : (
                          <>
                            <Ticket className="w-4 h-4" /> RSVP Now
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My RSVPs Tab */}
          <TabsContent value="my-rsvps">
            <div className="max-w-4xl mx-auto">
              {myRsvps.length === 0 ? (
                <Card className="border-2 border-dashed">
                  <CardContent className="py-12 text-center">
                    <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No RSVPs Yet</h3>
                    <p className="text-muted-foreground mb-4">Browse upcoming events and RSVP to secure your spot!</p>
                    <Button onClick={() => setActiveTab("upcoming")}>Browse Events</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {myRsvps.map((rsvp) => (
                    <Card key={rsvp.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              rsvp.status === "confirmed" 
                                ? "bg-green-100 dark:bg-green-950" 
                                : "bg-red-100 dark:bg-red-950"
                            }`}>
                              {rsvp.status === "confirmed" ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              ) : (
                                <Calendar className="w-6 h-6 text-red-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold">{rsvp.events?.title || "Event"}</h3>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {rsvp.events?.date ? format(new Date(rsvp.events.date), "PPP") : "TBD"}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {rsvp.attending_mode === "online" ? "Online" : "Offline"}
                                </Badge>
                                <Badge 
                                  variant={rsvp.status === "confirmed" ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {rsvp.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {rsvp.status === "confirmed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelRsvp(rsvp.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Cancel RSVP
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* RSVP Modal */}
      <Dialog open={rsvpModalOpen} onOpenChange={setRsvpModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              RSVP for Event
            </DialogTitle>
            <DialogDescription>
              {selectedEvent?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rsvp-name" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name *
              </Label>
              <Input
                id="rsvp-name"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rsvp-email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email *
              </Label>
              <Input
                id="rsvp-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rsvp-phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> Phone (Optional)
              </Label>
              <Input
                id="rsvp-phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label>Attendance Mode</Label>
              <RadioGroup
                value={formData.attendingMode}
                onValueChange={(value) => setFormData(prev => ({ ...prev, attendingMode: value }))}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online" className="flex items-center gap-1 cursor-pointer">
                    <Monitor className="w-4 h-4" /> Online
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="offline" id="offline" />
                  <Label htmlFor="offline" className="flex items-center gap-1 cursor-pointer">
                    <Building2 className="w-4 h-4" /> Offline
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.attendingMode === "offline" && (
              <div className="space-y-2">
                <Label htmlFor="dietary">Dietary Requirements</Label>
                <Input
                  id="dietary"
                  value={formData.dietaryRequirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, dietaryRequirements: e.target.value }))}
                  placeholder="Any dietary restrictions?"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.additionalNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                placeholder="Any additional information..."
                rows={2}
              />
            </div>

            <Button
              onClick={handleSubmitRsvp}
              disabled={submitting}
              className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600"
            >
              {submitting ? "Submitting..." : (
                <>
                  <Sparkles className="w-4 h-4" /> Confirm RSVP
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RSVP;
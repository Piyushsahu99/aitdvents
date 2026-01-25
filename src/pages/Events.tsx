import { useState, useEffect, useMemo } from "react";
import { EventCard } from "@/components/EventCard";
import { EventDetailModal } from "@/components/EventDetailModal";
import { EventSubmissionModal } from "@/components/EventSubmissionModal";
import { AuthModal } from "@/components/AuthModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, CheckCircle, XCircle, Eye, Plus, Search, Building2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { POINT_VALUES } from "@/hooks/useEarnCoins";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface UserEvent {
  id: string;
  title: string;
  date: string;
  category: string;
  status: string;
  location: string;
  created_at: string;
}

interface StudentProfile {
  college: string | null;
}

type CampusMode = "on-campus" | "beyond-campus";

const CATEGORIES = [
  "All",
  "Academics & research",
  "Engineering, robotics & tech",
  "Cultural & arts",
  "Sports & fitness",
  "Business & entrepreneurship",
  "Workshop",
  "Hackathon",
  "Webinar",
  "Competition",
  "Meetup",
  "Conference",
  "Other"
];

export default function Events() {
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userCollege, setUserCollege] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [campusMode, setCampusMode] = useState<CampusMode>("beyond-campus");
  const [showMySubmissions, setShowMySubmissions] = useState(false);

  useEffect(() => {
    fetchEvents();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
    setUser(user);
    if (user) {
      fetchMyEvents(user.id);
      fetchUserProfile(user.id);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("student_profiles")
        .select("college")
        .eq("user_id", userId)
        .single();

      if (!error && data) {
        setUserCollege(data.college);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "live")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEvents = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, date, category, status, location, created_at")
        .eq("created_by", userId)
        .eq("submitted_by_user", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMyEvents(data || []);
    } catch (error) {
      console.error("Error fetching user events:", error);
    }
  };

  const handleHostEvent = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setShowSubmitModal(true);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event: any) => {
      // Search filter
      const matchesSearch = search
        ? event.title?.toLowerCase().includes(search.toLowerCase()) ||
          event.description?.toLowerCase().includes(search.toLowerCase()) ||
          event.location?.toLowerCase().includes(search.toLowerCase())
        : true;

      // Category filter
      const matchesCategory = selectedCategory === "All"
        ? true
        : event.category === selectedCategory;

      // Campus mode filter
      let matchesCampusMode = true;
      if (campusMode === "on-campus") {
        // Show only events from user's college
        if (userCollege) {
          matchesCampusMode = event.college?.toLowerCase() === userCollege.toLowerCase();
        } else {
          // If user has no college set, show events that have a college defined
          matchesCampusMode = !!event.college;
        }
      } else {
        // Beyond campus - show events without college restriction (global events)
        matchesCampusMode = !event.college || event.college === "";
      }

      return matchesSearch && matchesCategory && matchesCampusMode;
    });
  }, [events, search, selectedCategory, campusMode, userCollege]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-success text-white"><CheckCircle className="w-3 h-3 mr-1" /> Live</Badge>;
      case 'ended':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Ended</Badge>;
      case 'draft':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> Pending Review</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (showMySubmissions && isLoggedIn) {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowMySubmissions(false)}
              className="p-2 h-auto"
            >
              ← Back
            </Button>
            <h1 className="text-lg font-bold">My Submissions</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {myEvents.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-lg font-medium">No events submitted yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Submit your first event and earn {POINT_VALUES.EVENT_SUBMIT} coins!
              </p>
              <Button onClick={handleHostEvent} className="gap-2">
                <Plus className="h-4 w-4" />
                Host an Event
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base line-clamp-1">{event.title}</CardTitle>
                      {getStatusBadge(event.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{event.category}</Badge>
                    </div>
                    <p className="text-xs">
                      Submitted: {new Date(event.created_at).toLocaleDateString()}
                    </p>
                    {event.status === 'live' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => {
                          const fullEvent = events.find(e => e.id === event.id);
                          if (fullEvent) setSelectedEvent(fullEvent);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Event
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <EventDetailModal
          event={selectedEvent}
          open={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Header Section */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md">
        <div className="px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
          {/* Title and Actions */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Events & Competitions</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Participate and Showcase Your Talents</p>
            </div>
            {isLoggedIn && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowMySubmissions(true)}
                className="text-xs h-8"
              >
                My Events
              </Button>
            )}
          </div>

          {/* Campus Toggle */}
          <div className="flex rounded-xl bg-muted/50 p-0.5 sm:p-1 mb-3 sm:mb-4">
            <button
              onClick={() => setCampusMode("on-campus")}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                campusMode === "on-campus"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              On Campus
            </button>
            <button
              onClick={() => setCampusMode("beyond-campus")}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                campusMode === "beyond-campus"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Beyond Campus
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3 sm:mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or location"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 sm:pl-10 h-10 sm:h-12 rounded-xl bg-muted/50 border-0 text-sm sm:text-base"
            />
          </div>

          {/* Category Horizontal Scroll */}
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2 sm:pb-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap active:scale-95 ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/60 text-muted-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>

        {/* Info banner for On Campus mode */}
        {campusMode === "on-campus" && (
          <div className="px-4 pb-3">
            <div className="bg-info/10 border border-info/20 rounded-xl p-3 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-info flex-shrink-0" />
              <div className="text-sm">
                {userCollege ? (
                  <span>Showing events from <span className="font-semibold text-info">{userCollege}</span></span>
                ) : (
                  <span>Add your college in <span className="font-semibold text-info">Profile</span> to see campus events</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Events List */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse shadow-md">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-10 bg-muted rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-2xl">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg font-medium">No events found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search || selectedCategory !== "All" 
                ? "Try adjusting your search or filter" 
                : campusMode === "on-campus"
                  ? "No campus events available. Be the first to host one!"
                  : "Check back soon for new events!"}
            </p>
            <Button onClick={handleHostEvent} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Host an Event
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filteredEvents.map((event: any, index: number) => (
              <EventCard
                key={event.id}
                {...event}
                gradientIndex={index % 6}
                onClick={() => setSelectedEvent(event)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handleHostEvent}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-xl flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />

      {/* Event Submission Modal */}
      {showSubmitModal && (
        <EventSubmissionModalControlled 
          open={showSubmitModal}
          onOpenChange={setShowSubmitModal}
          onSuccess={() => { 
            fetchEvents(); 
            if (user) fetchMyEvents(user.id); 
          }}
          userCollege={userCollege}
        />
      )}
    </div>
  );
}

// Controlled version of EventSubmissionModal
function EventSubmissionModalControlled({ 
  open, 
  onOpenChange, 
  onSuccess,
  userCollege
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onSuccess?: () => void;
  userCollege?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: '',
    external_link: '',
    organizer_name: '',
    expected_participants: '',
    is_online: true,
    is_free: true,
    is_campus_event: false,
  });

  const categories = [
    'Academics & research',
    'Engineering, robotics & tech',
    'Cultural & arts',
    'Sports & fitness',
    'Business & entrepreneurship',
    'Workshop',
    'Hackathon', 
    'Webinar',
    'Competition',
    'Meetup',
    'Conference',
    'Other'
  ];

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      setPosterFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPosterPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.date || !formData.location || !formData.category) {
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      let posterUrl = null;
      
      if (posterFile) {
        const fileExt = posterFile.name.split('.').pop();
        const fileName = `event-posters/${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('event-posters')
          .upload(fileName, posterFile);
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('event-posters')
            .getPublicUrl(fileName);
          posterUrl = urlData.publicUrl;
        }
      }

      const { error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          date: formData.date,
          location: formData.location,
          category: formData.category,
          external_link: formData.external_link || null,
          is_online: formData.is_online,
          is_free: formData.is_free,
          poster_url: posterUrl,
          created_by: user.id,
          submitted_by_user: true,
          status: 'draft',
          college: formData.is_campus_event ? userCollege : null, // Set college for campus events
        });

      if (error) throw error;

      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        category: '',
        external_link: '',
        organizer_name: '',
        expected_participants: '',
        is_online: true,
        is_free: true,
        is_campus_event: false,
      });
      setPosterFile(null);
      setPosterPreview(null);
      
    } catch (error) {
      console.error('Error submitting event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Host an Event
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campus Event Toggle */}
          {userCollege && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-info" />
                <div>
                  <p className="text-sm font-medium">Campus Event</p>
                  <p className="text-xs text-muted-foreground">Only visible to {userCollege} students</p>
                </div>
              </div>
              <Switch 
                checked={formData.is_campus_event}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_campus_event: checked }))}
              />
            </div>
          )}

          <div>
            <Label htmlFor="title">Event Title *</Label>
            <Input 
              id="title" 
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter event title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea 
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your event"
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date & Time *</Label>
              <Input 
                id="date" 
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input 
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Event location or Online"
              required
            />
          </div>

          <div>
            <Label htmlFor="external_link">Registration/Event Link</Label>
            <Input 
              id="external_link"
              type="url"
              value={formData.external_link}
              onChange={(e) => setFormData(prev => ({ ...prev, external_link: e.target.value }))}
              placeholder="https://"
            />
          </div>

          <div>
            <Label>Event Poster</Label>
            <div className="mt-1">
              {posterPreview ? (
                <div className="relative">
                  <img src={posterPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => { setPosterFile(null); setPosterPreview(null); }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground mt-2">Upload poster (max 5MB)</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handlePosterChange}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Switch 
                id="is_online"
                checked={formData.is_online}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_online: checked }))}
              />
              <Label htmlFor="is_online">Online Event</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="is_free"
                checked={formData.is_free}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_free: checked }))}
              />
              <Label htmlFor="is_free">Free Entry</Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit for Review"}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            Earn {POINT_VALUES.EVENT_SUBMIT} coins when your event is approved!
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

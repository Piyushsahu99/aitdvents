import { useState, useEffect } from "react";
import { EventCard } from "@/components/EventCard";
import { EventDetailModal } from "@/components/EventDetailModal";
import { SearchBar } from "@/components/SearchBar";
import { EventSubmissionModal } from "@/components/EventSubmissionModal";
import { AuthModal } from "@/components/AuthModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Sparkles, Filter, Clock, CheckCircle, XCircle, Eye, Plus, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { POINT_VALUES } from "@/hooks/useEarnCoins";

interface UserEvent {
  id: string;
  title: string;
  date: string;
  category: string;
  status: string;
  location: string;
  created_at: string;
}

export default function Events() {
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

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

  const categories = [...new Set(events.map((e: any) => e.category))];

  const handleHostEvent = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setShowSubmitModal(true);
  };

  const filteredEvents = events.filter((event: any) => {
    const matchesSearch = search
      ? event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesCategory = selectedCategory
      ? event.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Live</Badge>;
      case 'ended':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Ended</Badge>;
      case 'draft':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> Pending Review</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-mesh">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-events rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Discover Opportunities
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Events & <span className="text-gradient-primary">Competitions</span>
            </h1>
            
            <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
              Explore hackathons, workshops, and competitions happening around you. Or host your own event on our platform!
            </p>

            {/* Host Event CTA */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              <Badge className="bg-yellow-500/90 text-white border-0">
                <Coins className="w-4 h-4 mr-2" />
                Earn {POINT_VALUES.EVENT_SUBMIT} coins per approved event!
              </Badge>
              <Button onClick={handleHostEvent} className="gap-2">
                <Plus className="h-4 w-4" />
                Host an Event
              </Button>
            </div>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <SearchBar
                placeholder="Search events..."
                value={search}
                onChange={(val) => setSearch(val)}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-12">
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="browse" className="flex-1 sm:flex-none">Browse Events</TabsTrigger>
            {isLoggedIn && <TabsTrigger value="my-events" className="flex-1 sm:flex-none">My Submissions</TabsTrigger>}
          </TabsList>

          <TabsContent value="browse">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Filter by category</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All Events
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
                    <div className="h-36 bg-muted" />
                    <div className="p-4 pt-10 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-9 bg-muted rounded mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-lg font-medium">No events found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {search || selectedCategory ? "Try adjusting your search or filter" : "Check back soon for new events!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEvents.map((event: any, index: number) => (
                  <div 
                    key={event.id} 
                    onClick={() => setSelectedEvent(event)}
                    className="cursor-pointer"
                  >
                    <EventCard {...event} gradientIndex={index % 6} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {isLoggedIn && (
            <TabsContent value="my-events">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </TabsContent>
          )}
        </Tabs>
      </div>

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
          onSuccess={() => { fetchEvents(); if (user) fetchMyEvents(user.id); }}
        />
      )}
    </div>
  );
}

// Controlled version of EventSubmissionModal
function EventSubmissionModalControlled({ 
  open, 
  onOpenChange, 
  onSuccess 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onSuccess?: () => void;
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
  });

  const categories = [
    'Workshop',
    'Hackathon', 
    'Webinar',
    'Competition',
    'Meetup',
    'Conference',
    'Bootcamp',
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
          const { data: { publicUrl } } = supabase.storage
            .from('event-posters')
            .getPublicUrl(fileName);
          posterUrl = publicUrl;
        }
      }

      const { error } = await supabase
        .from('events')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() + (formData.organizer_name ? `\n\nOrganized by: ${formData.organizer_name}` : ''),
          date: formData.date,
          location: formData.location.trim(),
          category: formData.category,
          external_link: formData.external_link.trim() || null,
          is_online: formData.is_online,
          is_free: formData.is_free,
          poster_url: posterUrl,
          participants: formData.expected_participants ? parseInt(formData.expected_participants) : null,
          status: 'draft',
          created_by: user.id,
          submitted_by_user: true,
        });

      if (error) throw error;

      onOpenChange(false);
      onSuccess?.();
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
            Host an Event
            <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
              <Coins className="w-3 h-3 mr-1" />
              +{POINT_VALUES.EVENT_SUBMIT} coins
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Event Poster (Optional)
            </Label>
            <div className="flex items-center gap-4">
              {posterPreview ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                  <img src={posterPreview} alt="Poster preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setPosterFile(null); setPosterPreview(null); }}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground mt-1">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterChange}
                    className="hidden"
                  />
                </label>
              )}
              <p className="text-xs text-muted-foreground">
                Add a poster to make your event stand out! (Max 5MB)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your event..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Venue or Online Platform"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizer_name">Organizer Name</Label>
              <Input
                id="organizer_name"
                value={formData.organizer_name}
                onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
                placeholder="Your name/org"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_participants">Expected Attendees</Label>
              <Input
                id="expected_participants"
                type="number"
                value={formData.expected_participants}
                onChange={(e) => setFormData({ ...formData, expected_participants: e.target.value })}
                placeholder="e.g., 100"
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="external_link">Registration/Event Link</Label>
            <Input
              id="external_link"
              type="url"
              value={formData.external_link}
              onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="is_online"
                checked={formData.is_online}
                onCheckedChange={(checked) => setFormData({ ...formData, is_online: checked })}
              />
              <Label htmlFor="is_online" className="text-sm">Online Event</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_free"
                checked={formData.is_free}
                onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
              />
              <Label htmlFor="is_free" className="text-sm">Free Event</Label>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            <p className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-yellow-500" />
              You'll earn <span className="font-semibold text-yellow-600">+{POINT_VALUES.EVENT_SUBMIT} coins</span> when your event is approved!
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 gap-2">
              {loading ? 'Submitting...' : 'Submit Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

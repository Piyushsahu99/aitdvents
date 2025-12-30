import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users, Star, Clock, Coins, Calendar, MessageCircle, Search, Filter,
  ChevronRight, Award, CheckCircle, ArrowRight, Briefcase, GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Mentor {
  id: string;
  user_id: string;
  title: string;
  bio: string | null;
  expertise: string[];
  rate_per_session: number;
  is_verified: boolean;
  sessions_completed: number;
  rating: number;
  profile?: {
    full_name: string;
    avatar_url: string | null;
    college: string | null;
  };
}

interface UserPoints {
  total_points: number;
}

const EXPERTISE_OPTIONS = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "UI/UX Design",
  "DevOps",
  "Cloud Computing",
  "Career Guidance",
  "Interview Prep",
  "Resume Review",
];

export default function Mentorship() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [bookingTopic, setBookingTopic] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        
        // Fetch user points
        const { data: pointsData } = await supabase
          .from("user_points")
          .select("total_points")
          .eq("user_id", session.user.id)
          .maybeSingle();
        
        if (pointsData) setUserPoints(pointsData);
      }

      // Fetch mentors with profiles
      const { data: mentorsData, error } = await supabase
        .from("mentors")
        .select("*")
        .eq("is_active", true)
        .eq("is_verified", true)
        .order("rating", { ascending: false });

      if (error) throw error;

      // Fetch profiles for mentors
      if (mentorsData && mentorsData.length > 0) {
        const userIds = mentorsData.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from("student_profiles")
          .select("user_id, full_name, avatar_url, college")
          .in("user_id", userIds);

        const mentorsWithProfiles = mentorsData.map(mentor => ({
          ...mentor,
          profile: profiles?.find(p => p.user_id === mentor.user_id)
        }));

        setMentors(mentorsWithProfiles);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async () => {
    if (!userId || !selectedMentor) {
      toast({
        title: "Please login",
        description: "You need to be logged in to book a session.",
        variant: "destructive",
      });
      return;
    }

    if (!bookingTopic || !bookingDate) {
      toast({
        title: "Missing information",
        description: "Please provide a topic and select a date.",
        variant: "destructive",
      });
      return;
    }

    if (!userPoints || userPoints.total_points < selectedMentor.rate_per_session) {
      toast({
        title: "Insufficient coins",
        description: `You need ${selectedMentor.rate_per_session - (userPoints?.total_points || 0)} more coins.`,
        variant: "destructive",
      });
      return;
    }

    setBooking(true);
    try {
      // Spend points
      const { data: success, error: spendError } = await supabase
        .rpc('spend_points', {
          p_user_id: userId,
          p_amount: selectedMentor.rate_per_session,
          p_action_type: 'mentor_booking',
          p_description: `Booked session with ${selectedMentor.profile?.full_name || 'mentor'}`,
          p_reference_id: selectedMentor.id,
        });

      if (spendError) throw spendError;
      if (!success) {
        toast({
          title: "Booking failed",
          description: "Insufficient coins or an error occurred.",
          variant: "destructive",
        });
        return;
      }

      // Create session
      const { error: sessionError } = await supabase
        .from("mentor_sessions")
        .insert({
          mentor_id: selectedMentor.id,
          student_id: userId,
          scheduled_at: new Date(bookingDate).toISOString(),
          topic: bookingTopic,
          points_cost: selectedMentor.rate_per_session,
          status: "pending",
        });

      if (sessionError) throw sessionError;

      toast({
        title: "🎉 Session Booked!",
        description: "The mentor will confirm your session soon.",
      });

      setSelectedMentor(null);
      setBookingTopic("");
      setBookingDate("");
      fetchData();
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Error",
        description: "Failed to book session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBooking(false);
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = searchQuery === "" || 
      mentor.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesExpertise = selectedExpertise === "" || 
      mentor.expertise.includes(selectedExpertise);
    
    return matchesSearch && matchesExpertise;
  });

  const canAfford = (cost: number) => (userPoints?.total_points || 0) >= cost;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="relative py-12 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl">
              <Badge variant="secondary" className="mb-4">
                <Users className="h-3 w-3 mr-1" />
                Expert Mentors
              </Badge>
              
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                Learn from Industry Experts
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8">
                Book 1-on-1 mentorship sessions with verified professionals. Get career guidance, interview prep, and skill development advice.
              </p>

              {userId && userPoints && (
                <Card className="inline-flex items-center gap-4 p-4 bg-card/50 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <span className="font-bold">{userPoints.total_points}</span>
                    <span className="text-muted-foreground">coins available</span>
                  </div>
                  <Link to="/rewards">
                    <Button variant="outline" size="sm">
                      Earn More
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="container mx-auto px-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentors by name, title, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Expertise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Expertise</SelectItem>
                {EXPERTISE_OPTIONS.map(exp => (
                  <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Mentors Grid */}
        <section className="container mx-auto px-4 pb-20">
          {mentors.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Mentors Coming Soon</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We're onboarding industry experts to guide your career journey. Check back soon!
              </p>
              <Link to="/rewards">
                <Button>
                  Earn Coins While You Wait
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </Card>
          ) : filteredMentors.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No mentors match your search criteria.</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <Card 
                  key={mentor.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src={mentor.profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {mentor.profile?.full_name?.[0] || 'M'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {mentor.profile?.full_name || 'Mentor'}
                          </h3>
                          {mentor.is_verified && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{mentor.title}</p>
                        {mentor.profile?.college && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <GraduationCap className="h-3 w-3" />
                            {mentor.profile.college}
                          </p>
                        )}
                      </div>
                    </div>

                    {mentor.bio && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {mentor.bio}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1 mb-4">
                      {mentor.expertise.slice(0, 3).map((exp) => (
                        <Badge key={exp} variant="secondary" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                      {mentor.expertise.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{mentor.expertise.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {mentor.rating || 'New'}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MessageCircle className="h-4 w-4" />
                          {mentor.sessions_completed} sessions
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
                        <Coins className="h-3 w-3 mr-1" />
                        {mentor.rate_per_session} coins/session
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => setSelectedMentor(mentor)}
                        disabled={!userId}
                      >
                        {userId ? 'Book Session' : 'Login to Book'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Booking Dialog */}
      <Dialog open={!!selectedMentor} onOpenChange={(open) => !open && setSelectedMentor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book a Session</DialogTitle>
            <DialogDescription>
              with {selectedMentor?.profile?.full_name || 'Mentor'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedMentor?.profile?.avatar_url || undefined} />
                <AvatarFallback>{selectedMentor?.profile?.full_name?.[0] || 'M'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedMentor?.title}</p>
                <p className="text-sm text-muted-foreground">30-minute session</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Topic</label>
              <Textarea
                placeholder="What would you like to discuss?"
                value={bookingTopic}
                onChange={(e) => setBookingTopic(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Preferred Date & Time</label>
              <Input
                type="datetime-local"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <span>Session Cost</span>
              <Badge variant="secondary" className="text-lg">
                <Coins className="h-4 w-4 mr-2" />
                {selectedMentor?.rate_per_session}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <span>Your Balance</span>
              <span className="font-bold">{userPoints?.total_points || 0} coins</span>
            </div>

            {selectedMentor && !canAfford(selectedMentor.rate_per_session) && (
              <p className="text-red-500 text-sm">
                You need {selectedMentor.rate_per_session - (userPoints?.total_points || 0)} more coins.
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMentor(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBookSession} 
              disabled={!selectedMentor || !canAfford(selectedMentor.rate_per_session) || booking}
            >
              {booking ? "Booking..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}

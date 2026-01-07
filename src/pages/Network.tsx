import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchBar } from "@/components/SearchBar";
import { SocialLinksDisplay } from "@/components/profile/SocialLinksDisplay";
import { POINT_VALUES } from "@/hooks/useEarnCoins";
import { 
  Users, 
  Loader2,
  UserPlus,
  Search,
  Coins,
  Gift,
  Sparkles,
  MapPin,
  GraduationCap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  college: string;
  graduation_year: number;
  skills: string[];
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  avatar_url: string;
  is_looking_for_team: boolean;
  interests: string[];
}

export default function Network() {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = profiles.filter(
        (profile) =>
          profile.full_name.toLowerCase().includes(search.toLowerCase()) ||
          profile.college?.toLowerCase().includes(search.toLowerCase()) ||
          profile.skills?.some((skill) =>
            skill.toLowerCase().includes(search.toLowerCase())
          )
      );
      setFilteredProfiles(filtered);
    } else {
      setFilteredProfiles(profiles);
    }
  }, [search, profiles]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("student_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
      setFilteredProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast({
        title: "Error",
        description: "Failed to load student profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 px-4 overflow-hidden bg-gradient-to-br from-background via-accent/5 to-primary/5">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-accent/20 rounded-full blur-3xl animate-float-delayed" />
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-base sm:text-lg px-4 sm:px-6 py-2">
            <Users className="h-4 w-4 mr-2" />
            Student Network
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            CONNECT WITH{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              FELLOW STUDENTS
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Build your network, find teammates, and collaborate on projects
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <Link to="/profile">
              <Button variant="outline" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Edit My Profile
              </Button>
            </Link>
          </div>

          {/* Coin Earning Info */}
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
            <div className="p-2 rounded-full bg-yellow-500/20">
              <Coins className="h-4 w-4 text-yellow-500" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Earn +{POINT_VALUES.REFERRAL} coins per referral!</p>
              <p className="text-xs text-muted-foreground">Invite friends and grow together</p>
            </div>
            <Link to="/profile">
              <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10">
                <Gift className="h-3.5 w-3.5 mr-1.5" />
                Refer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 px-4 bg-card border-b">
        <div className="container mx-auto max-w-4xl">
          <SearchBar
            placeholder="Search by name, college, or skills..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </section>

      {/* Profiles Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {filteredProfiles.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground mb-2">No students found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile, index) => (
                <Card
                  key={profile.id}
                  className="group relative p-6 hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1 animate-fade-in overflow-hidden"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/20 group-hover:border-primary/40 transition-colors ring-2 ring-offset-2 ring-primary/10">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold text-lg">
                          {getInitials(profile.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold truncate">{profile.full_name}</h3>
                        {profile.college && (
                          <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {profile.college}
                          </p>
                        )}
                        {profile.graduation_year && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Class of {profile.graduation_year}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {profile.bio && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}

                    {profile.is_looking_for_team && (
                      <Badge className="mb-4 bg-success/10 text-success border-success/20 animate-pulse-soft">
                        <UserPlus className="h-3 w-3 mr-1" />
                        Looking for Team
                      </Badge>
                    )}

                    {profile.skills && profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {profile.skills.slice(0, 3).map((skill, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary" 
                            className="text-xs bg-primary/5 hover:bg-primary/10 transition-colors"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {profile.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Colorful Social Links */}
                    <SocialLinksDisplay
                      linkedinUrl={profile.linkedin_url}
                      githubUrl={profile.github_url}
                      portfolioUrl={profile.portfolio_url}
                      size="md"
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
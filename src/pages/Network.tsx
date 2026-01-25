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
      {/* Hero Section - Compact on mobile */}
      <section className="relative py-8 sm:py-12 md:py-16 px-3 sm:px-4 overflow-hidden bg-gradient-to-br from-background via-accent/5 to-primary/5">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 sm:w-48 md:w-72 h-32 sm:h-48 md:h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-40 sm:w-64 md:w-96 h-40 sm:h-64 md:h-96 bg-accent/20 rounded-full blur-3xl animate-float-delayed" />
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-sm sm:text-base md:text-lg px-3 sm:px-4 md:px-6 py-1.5 sm:py-2">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Student Network
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            CONNECT WITH{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              STUDENTS
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-5 sm:mb-8">
            Build your network, find teammates, and collaborate
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Link to="/profile">
              <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-9 sm:h-10">
                <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Edit Profile
              </Button>
            </Link>
          </div>

          {/* Coin Earning Info - Compact on mobile */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-warning/10 to-amber-500/10 border border-warning/20">
            <div className="p-1.5 sm:p-2 rounded-full bg-warning/20">
              <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-warning" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-xs sm:text-sm">+{POINT_VALUES.REFERRAL} coins per referral!</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Invite friends and grow together</p>
            </div>
            <Link to="/profile">
              <Button size="sm" variant="outline" className="border-warning/30 text-warning hover:bg-warning/10 h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3">
                <Gift className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                Refer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-4 sm:py-6 md:py-8 px-3 sm:px-4 bg-card border-b">
        <div className="container mx-auto max-w-4xl">
          <SearchBar
            placeholder="Search by name, college, or skills..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </section>

      {/* Profiles Grid - Responsive */}
      <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4">
        <div className="container mx-auto">
          {filteredProfiles.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <Search className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
              <p className="text-lg sm:text-xl text-muted-foreground mb-1 sm:mb-2">No students found</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Try adjusting your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {filteredProfiles.map((profile, index) => (
                <Card
                  key={profile.id}
                  className="group relative p-4 sm:p-5 md:p-6 hover:shadow-[var(--shadow-hover)] transition-all duration-300 active:scale-[0.98] sm:hover:-translate-y-1 animate-fade-in overflow-hidden"
                  style={{
                    animationDelay: `${Math.min(index * 30, 300)}ms`,
                  }}
                >
                  <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <Avatar className="h-12 w-12 sm:h-14 md:h-16 sm:w-14 md:w-16 border-2 border-primary/20 group-hover:border-primary/40 transition-colors ring-2 ring-offset-2 ring-primary/10">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold text-sm sm:text-lg">
                          {getInitials(profile.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold truncate">{profile.full_name}</h3>
                        {profile.college && (
                          <p className="text-xs sm:text-sm text-muted-foreground truncate flex items-center gap-1">
                            <GraduationCap className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{profile.college}</span>
                          </p>
                        )}
                        {profile.graduation_year && (
                          <Badge variant="outline" className="mt-1 text-[10px] sm:text-xs">
                            Class of {profile.graduation_year}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {profile.bio && (
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}

                    {profile.is_looking_for_team && (
                      <Badge className="mb-3 sm:mb-4 bg-success/10 text-success border-success/20 animate-pulse-soft text-[10px] sm:text-xs">
                        <UserPlus className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                        Looking for Team
                      </Badge>
                    )}

                    {profile.skills && profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
                        {profile.skills.slice(0, 3).map((skill, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary" 
                            className="text-[10px] sm:text-xs bg-primary/5 hover:bg-primary/10 transition-colors"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {profile.skills.length > 3 && (
                          <Badge variant="outline" className="text-[10px] sm:text-xs">
                            +{profile.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Social Links */}
                    <SocialLinksDisplay
                      linkedinUrl={profile.linkedin_url}
                      githubUrl={profile.github_url}
                      portfolioUrl={profile.portfolio_url}
                      size="sm"
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

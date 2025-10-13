import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SearchBar } from "@/components/SearchBar";
import { 
  Users, 
  Linkedin, 
  Github, 
  Globe, 
  Loader2,
  UserPlus,
  Search
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
      <section className="relative py-16 px-4 overflow-hidden bg-gradient-to-br from-background via-accent/5 to-primary/5">
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-lg px-6 py-2">
            <Users className="h-4 w-4 mr-2" />
            Student Network
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            CONNECT WITH{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              FELLOW STUDENTS
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Build your network, find teammates, and collaborate on projects
          </p>
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
                      <Avatar className="h-16 w-16 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                          {getInitials(profile.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold truncate">{profile.full_name}</h3>
                        {profile.college && (
                          <p className="text-sm text-muted-foreground truncate">{profile.college}</p>
                        )}
                        {profile.graduation_year && (
                          <Badge variant="outline" className="mt-1">
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
                      <Badge className="mb-4 bg-success/10 text-success border-success/20">
                        <UserPlus className="h-3 w-3 mr-1" />
                        Looking for Team
                      </Badge>
                    )}

                    {profile.skills && profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {profile.skills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
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

                    <div className="flex gap-2">
                      {profile.linkedin_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 hover:bg-primary/10 hover:border-primary/40"
                          asChild
                        >
                          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {profile.github_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 hover:bg-primary/10 hover:border-primary/40"
                          asChild
                        >
                          <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {profile.portfolio_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 hover:bg-primary/10 hover:border-primary/40"
                          asChild
                        >
                          <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
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
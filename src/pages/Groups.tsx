import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SearchBar } from "@/components/SearchBar";
import { 
  Users, 
  Loader2,
  UserPlus,
  Search,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudentGroup {
  id: string;
  name: string;
  description: string;
  created_by: string;
  category: string;
  max_members: number;
  is_public: boolean;
  avatar_url: string;
  created_at: string;
}

export default function Groups() {
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<StudentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = groups.filter(
        (group) =>
          group.name.toLowerCase().includes(search.toLowerCase()) ||
          group.category.toLowerCase().includes(search.toLowerCase()) ||
          group.description?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredGroups(filtered);
    } else {
      setFilteredGroups(groups);
    }
  }, [search, groups]);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from("student_groups")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGroups(data || []);
      setFilteredGroups(data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast({
        title: "Error",
        description: "Failed to load groups",
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
            Student Groups
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            FIND YOUR{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              DREAM TEAM
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join study groups, hackathon teams, and project collaborations
          </p>
          <Button size="lg" className="shadow-[var(--shadow-card)]">
            <Plus className="h-5 w-5 mr-2" />
            Create New Group
          </Button>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 px-4 bg-card border-b">
        <div className="container mx-auto max-w-4xl">
          <SearchBar
            placeholder="Search groups by name or category..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </section>

      {/* Groups Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground mb-2">No groups found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or create a new group</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group, index) => (
                <Card
                  key={group.id}
                  className="group relative p-6 hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1 animate-fade-in overflow-hidden"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-14 w-14 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold text-lg">
                          {getInitials(group.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold truncate group-hover:text-primary transition-colors">
                          {group.name}
                        </h3>
                        <Badge variant="outline" className="mt-1">
                          {group.category}
                        </Badge>
                      </div>
                    </div>

                    {group.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {group.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Max {group.max_members} members</span>
                      </div>
                    </div>

                    <Button className="w-full group-hover:shadow-[var(--shadow-card)] transition-all">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Group
                    </Button>
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
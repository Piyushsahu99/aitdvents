import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Linkedin, Instagram, Github, Twitter, Search, Users, GraduationCap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ShowcaseMember {
  id: string;
  full_name: string;
  designation: string;
  role_type: string;
  college: string | null;
  photo_url: string | null;
  bio: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
  display_order: number;
}

function MemberCard({ member, index }: { member: ShowcaseMember; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="group bg-card rounded-2xl border border-border/50 hover:border-primary/40 hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2"
    >
      <div className="p-6 flex flex-col items-center text-center">
        {/* Avatar with ring */}
        <div className="relative mb-4">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-primary/30 group-hover:border-primary/60 transition-colors duration-500 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
            {member.photo_url ? (
              <img
                src={member.photo_url}
                alt={member.full_name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Users className="h-12 w-12 text-muted-foreground/40" />
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">
          {member.full_name}
        </h3>

        {/* College */}
        {member.college && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="line-clamp-2">{member.college}</span>
          </div>
        )}

        {/* Designation */}
        <Badge className="mt-3 bg-primary/10 text-primary border-primary/20 text-xs font-medium">
          {member.designation}
        </Badge>

        {/* Bio */}
        {member.bio && (
          <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{member.bio}</p>
        )}

        {/* Socials */}
        <div className="flex items-center gap-2 mt-4">
          {member.linkedin_url && (
            <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all duration-300 hover:scale-110">
              <Linkedin className="h-4 w-4" />
            </a>
          )}
          {member.instagram_url && (
            <a href={member.instagram_url} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-full bg-pink-500/10 text-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-300 hover:scale-110">
              <Instagram className="h-4 w-4" />
            </a>
          )}
          {member.github_url && (
            <a href={member.github_url} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-full bg-foreground/10 text-foreground hover:bg-foreground hover:text-background transition-all duration-300 hover:scale-110">
              <Github className="h-4 w-4" />
            </a>
          )}
          {member.twitter_url && (
            <a href={member.twitter_url} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-full bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white transition-all duration-300 hover:scale-110">
              <Twitter className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function OurTeam() {
  const [members, setMembers] = useState<ShowcaseMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "team" | "ambassador">("all");

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("showcase_members")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      setMembers((data as ShowcaseMember[]) || []);
      setLoading(false);
    };
    fetchMembers();
  }, []);

  const filtered = members.filter(m => {
    const matchSearch = m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (m.college?.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === "all" || m.role_type === filter;
    return matchSearch && matchFilter;
  });

  const teamMembers = filtered.filter(m => m.role_type === "team");
  const ambassadors = filtered.filter(m => m.role_type === "ambassador");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-16 sm:py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Users className="w-3 h-3 mr-1" /> Our People
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Meet Our <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Amazing Team</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-8">
            The passionate people behind AITD Events — our core team and campus ambassadors driving innovation across colleges.
          </p>

          {/* Search & Filter */}
          <div className="max-w-md mx-auto space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or college..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex justify-center gap-2">
              {(["all", "team", "ambassador"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filter === f
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {f === "all" ? "All" : f === "team" ? "Core Team" : "Ambassadors"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No members found</p>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-12 space-y-16">
          {/* Core Team */}
          {(filter === "all" || filter === "team") && teamMembers.length > 0 && (
            <section>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold">Our Core Team</h2>
                <p className="text-sm text-muted-foreground mt-1">The leaders driving our mission forward</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {teamMembers.map((m, i) => <MemberCard key={m.id} member={m} index={i} />)}
              </div>
            </section>
          )}

          {/* Ambassadors */}
          {(filter === "all" || filter === "ambassador") && ambassadors.length > 0 && (
            <section>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold">Our Campus Ambassadors</h2>
                <p className="text-sm text-muted-foreground mt-1">Representing us across colleges nationwide</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {ambassadors.map((m, i) => <MemberCard key={m.id} member={m} index={i} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

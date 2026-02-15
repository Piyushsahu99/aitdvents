import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, Linkedin, Instagram, Github, Twitter } from "lucide-react";

interface ShowcaseMember {
  id: string;
  full_name: string;
  designation: string | null;
  photo_url: string | null;
  college: string | null;
  role_type: string;
  linkedin_url: string | null;
  instagram_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
  display_order: number | null;
}

export function TeamShowcaseSection() {
  const [members, setMembers] = useState<ShowcaseMember[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("showcase_members")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(8);
      if (data) setMembers(data);
    };
    fetchMembers();
  }, []);

  if (members.length === 0) return null;

  const socialIcons = [
    { key: "linkedin_url", icon: Linkedin, color: "hover:text-blue-500" },
    { key: "instagram_url", icon: Instagram, color: "hover:text-pink-500" },
    { key: "github_url", icon: Github, color: "hover:text-foreground" },
    { key: "twitter_url", icon: Twitter, color: "hover:text-sky-500" },
  ] as const;

  return (
    <section className="py-8 sm:py-12 lg:py-16 px-4 bg-muted/20">
      <div className="container mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <Badge className="mb-2 text-xs sm:text-sm bg-primary/10 text-primary border-primary/20">
            <Users className="w-3 h-3 mr-1" />
            Our Team & Ambassadors
          </Badge>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1.5">
            Meet the <span className="bg-gradient-to-r from-primary to-warning bg-clip-text text-transparent">People Behind AITD</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            Our passionate team and campus ambassadors driving student empowerment across India
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {members.map((member, index) => (
            <div
              key={member.id}
              className="group relative bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg active:scale-[0.97] transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Photo */}
              <div className="aspect-square overflow-hidden bg-gradient-to-br from-primary/20 to-warning/20">
                {member.photo_url ? (
                  <img
                    src={member.photo_url}
                    alt={member.full_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl font-bold text-primary/40">
                      {member.full_name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5 sm:p-3">
                <h3 className="font-bold text-xs sm:text-sm text-foreground line-clamp-1">{member.full_name}</h3>
                {member.designation && (
                  <p className="text-[10px] sm:text-xs text-primary font-medium line-clamp-1">{member.designation}</p>
                )}
                {member.college && (
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{member.college}</p>
                )}
                <Badge variant="outline" className="mt-1.5 text-[8px] sm:text-[10px] px-1.5 py-0">
                  {member.role_type === "core_team" ? "Core Team" : "Ambassador"}
                </Badge>

                {/* Social Links */}
                <div className="flex items-center gap-1.5 mt-2">
                  {socialIcons.map(({ key, icon: Icon, color }) => {
                    const url = member[key as keyof ShowcaseMember] as string | null;
                    if (!url) return null;
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-1 rounded-full bg-muted/50 text-muted-foreground ${color} transition-colors active:scale-90`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-5 sm:mt-7">
          <Link to="/our-team">
            <Button variant="outline" className="rounded-xl text-sm sm:text-base px-4 sm:px-6 active:scale-95 transition-transform">
              View All Members <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

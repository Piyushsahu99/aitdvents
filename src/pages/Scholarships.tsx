import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Calendar, DollarSign, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthModal } from "@/components/AuthModal";
import { useToast } from "@/hooks/use-toast";

export default function Scholarships() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchScholarships();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchScholarships = async () => {
    try {
      const { data, error } = await supabase
        .from("scholarships")
        .select("*")
        .eq("status", "live")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setScholarships(data || []);
    } catch (error) {
      console.error("Error fetching scholarships:", error);
      toast({
        title: "Error",
        description: "Failed to load scholarships",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(scholarships.map((s: any) => s.category))];

  const filteredScholarships = scholarships.filter(
    (scholarship: any) =>
      (category === "All" || scholarship.category === category) &&
      (scholarship.title.toLowerCase().includes(search.toLowerCase()) ||
        scholarship.description.toLowerCase().includes(search.toLowerCase()) ||
        scholarship.provider.toLowerCase().includes(search.toLowerCase()))
  );

  const handleApply = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      toast({
        title: "Application Submitted",
        description: "Your scholarship application has been submitted!",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Scholarships</h1>
        <p className="text-muted-foreground">
          Find financial aid and scholarship opportunities for your education
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <SearchBar
          placeholder="Search scholarships..."
          value={search}
          onChange={setSearch}
        />
        <CategoryFilter
          categories={categories}
          selected={category}
          onSelect={setCategory}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {filteredScholarships.map((scholarship) => (
              <div
                key={scholarship.id}
                className="p-6 bg-card rounded-lg border border-border hover:shadow-[var(--shadow-hover)] transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{scholarship.title}</h3>
                      <Badge variant="secondary">{scholarship.category}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      <span className="font-medium">{scholarship.provider}</span>
                    </div>

                    <p className="text-muted-foreground mb-4">{scholarship.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="font-medium">{scholarship.amount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>Deadline: {scholarship.deadline}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{scholarship.eligibility}</span>
                      </div>
                    </div>

                    {scholarship.requirements && (
                      <div className="text-sm">
                        <span className="font-medium">Requirements: </span>
                        <span className="text-muted-foreground">{scholarship.requirements}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button onClick={handleApply}>Apply Now</Button>
                </div>
              </div>
            ))}
          </div>

          {filteredScholarships.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No scholarships found matching your criteria
              </p>
            </div>
          )}
        </>
      )}

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Clock, Banknote, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthModal } from "@/components/AuthModal";
import { useToast } from "@/hooks/use-toast";

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "live")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(jobs.map((j: any) => j.category))];

  const filteredJobs = jobs.filter(
    (job: any) =>
      (category === "All" || job.category === category) &&
      (job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()))
  );

  const handleApply = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully!",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Jobs & Internships</h1>
        <p className="text-muted-foreground">Explore career opportunities at top companies</p>
      </div>

      <div className="space-y-6 mb-8">
        <SearchBar
          placeholder="Search jobs..."
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
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="p-6 bg-card rounded-lg border border-border hover:shadow-[var(--shadow-hover)] transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <Badge variant="secondary">{job.type}</Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="h-4 w-4 text-primary" />
                        <span className="font-medium">{job.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{job.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Banknote className="h-4 w-4 text-primary" />
                        <span className="font-medium text-primary">{job.stipend}</span>
                      </div>
                      {job.apply_by && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4 text-warning" />
                          <span className="text-sm">Apply by: {job.apply_by}</span>
                        </div>
                      )}
                    </div>
                    
                    {job.description && (
                      <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
                    )}
                    
                    <Badge variant="outline">{job.category}</Badge>
                  </div>
                  
                  <Button onClick={handleApply}>Apply Now</Button>
                </div>
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No jobs found matching your criteria</p>
            </div>
          )}
        </>
      )}

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}

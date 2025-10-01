import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { jobs } from "@/data/mockData";
import { Building, MapPin, Clock, Banknote } from "lucide-react";

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [...new Set(jobs.map((j) => j.category))];

  const filteredJobs = jobs.filter(
    (job) =>
      (category === "All" || job.category === category) &&
      (job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()))
  );

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
                  {job.applyBy && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 text-warning" />
                      <span className="text-sm">Apply by: {job.applyBy}</span>
                    </div>
                  )}
                </div>
                
                <Badge variant="outline">{job.category}</Badge>
              </div>
              
              <Button>Apply Now</Button>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No jobs found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

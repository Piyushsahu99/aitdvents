import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { scholarships } from "@/data/mockData";
import { GraduationCap, Calendar, DollarSign, Users } from "lucide-react";

export default function Scholarships() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [...new Set(scholarships.map((s) => s.category))];

  const filteredScholarships = scholarships.filter(
    (scholarship) =>
      (category === "All" || scholarship.category === category) &&
      (scholarship.title.toLowerCase().includes(search.toLowerCase()) ||
        scholarship.description.toLowerCase().includes(search.toLowerCase()) ||
        scholarship.provider.toLowerCase().includes(search.toLowerCase()))
  );

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
              
              <Button>Apply Now</Button>
            </div>
          </div>
        ))}
      </div>

      {filteredScholarships.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No scholarships found matching your criteria
          </p>
        </div>
      )}
    </div>
  );
}

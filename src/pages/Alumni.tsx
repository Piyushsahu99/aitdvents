import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { alumni } from "@/data/mockData";
import { Building, GraduationCap, CheckCircle, MessageCircle } from "lucide-react";

export default function Alumni() {
  const [search, setSearch] = useState("");

  const filteredAlumni = alumni.filter(
    (alum) =>
      alum.name.toLowerCase().includes(search.toLowerCase()) ||
      alum.college.toLowerCase().includes(search.toLowerCase()) ||
      alum.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Alumni Network</h1>
        <p className="text-muted-foreground">
          Connect with successful alumni from your college
        </p>
      </div>

      <div className="mb-8">
        <SearchBar
          placeholder="Search by name, college, or company..."
          value={search}
          onChange={setSearch}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlumni.map((alum) => (
          <div
            key={alum.id}
            className="p-6 bg-card rounded-lg border border-border hover:shadow-[var(--shadow-hover)] transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold">{alum.name}</h3>
                  {alum.verified && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
                <p className="text-sm text-primary font-medium">{alum.role}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building className="h-4 w-4 text-primary" />
                <span>{alum.company}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span>{alum.college}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="outline">Class of {alum.graduation}</Badge>
              <Button size="sm" variant="outline">
                <MessageCircle className="h-4 w-4 mr-1" />
                Connect
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredAlumni.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No alumni found matching your search</p>
        </div>
      )}
    </div>
  );
}

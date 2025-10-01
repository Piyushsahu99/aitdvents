import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { tasks } from "@/data/mockData";
import { Clock, DollarSign, Zap, Trophy } from "lucide-react";

export default function Tasks() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [...new Set(tasks.map((t) => t.category))];

  const filteredTasks = tasks.filter(
    (task) =>
      (category === "All" || task.category === category) &&
      (task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Freelance Tasks</h1>
        <p className="text-muted-foreground">Find short-term paid projects and bounties</p>
      </div>

      <div className="space-y-6 mb-8">
        <SearchBar
          placeholder="Search tasks..."
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
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="p-6 bg-card rounded-lg border border-border hover:shadow-[var(--shadow-hover)] transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-2 mb-2">
                  <h3 className="text-xl font-semibold">{task.title}</h3>
                  <Badge variant="secondary">{task.category}</Badge>
                </div>
                <p className="text-muted-foreground mb-4">{task.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-medium">{task.budget}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{task.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-medium">{task.xp} XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <Badge variant={task.difficulty === "Easy" ? "outline" : task.difficulty === "Medium" ? "secondary" : "default"}>
                      {task.difficulty}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {task.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Button>Apply Now</Button>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tasks found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

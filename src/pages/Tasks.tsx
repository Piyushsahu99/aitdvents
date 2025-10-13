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
  const [activeTab, setActiveTab] = useState<"all" | "companies" | "students">("all");

  const categories = [...new Set(tasks.map((t) => t.category))];

  const filteredTasks = tasks.filter(
    (task) =>
      (category === "All" || task.category === category) &&
      (task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-background via-success/5 to-primary/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-lg px-6 py-2">
            <Trophy className="h-4 w-4 mr-2" />
            Earn & Learn
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            COMPLETE TASKS{" "}
            <span className="bg-gradient-to-r from-success via-primary to-success bg-clip-text text-transparent">
              EARN REWARDS
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Take on freelance tasks from companies or collaborate with fellow students. Build your portfolio and earn money.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 justify-center flex-wrap">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            onClick={() => setActiveTab("all")}
            className="hover:scale-105 transition-transform"
          >
            All Tasks
          </Button>
          <Button
            variant={activeTab === "companies" ? "default" : "outline"}
            onClick={() => setActiveTab("companies")}
            className="hover:scale-105 transition-transform"
          >
            Company Tasks
          </Button>
          <Button
            variant={activeTab === "students" ? "default" : "outline"}
            onClick={() => setActiveTab("students")}
            className="hover:scale-105 transition-transform"
          >
            Student Tasks
          </Button>
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
          {filteredTasks.map((task, index) => (
            <div
              key={task.id}
              className="group p-6 bg-card rounded-xl border border-border hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1 animate-fade-in relative overflow-hidden"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/5 to-success/5 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-2 mb-2 flex-wrap">
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{task.title}</h3>
                    <Badge variant="secondary" className="shadow-sm">{task.category}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{task.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-lg">
                      <DollarSign className="h-4 w-4 text-success" />
                      <span className="font-semibold text-success">{task.budget}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{task.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-lg">
                      <Zap className="h-4 w-4 text-accent" />
                      <span className="font-medium">{task.xp} XP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-warning" />
                      <Badge 
                        variant={task.difficulty === "Easy" ? "outline" : task.difficulty === "Medium" ? "secondary" : "default"}
                        className="shadow-sm"
                      >
                        {task.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {task.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="hover:bg-primary/10 hover:border-primary/40 transition-colors">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button className="group-hover:shadow-[var(--shadow-card)] transition-all md:mt-0 mt-4">
                  Apply Now
                  <Zap className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tasks found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

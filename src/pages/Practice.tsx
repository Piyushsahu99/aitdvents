import { useState } from "react";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Trophy, Clock, CheckCircle } from "lucide-react";

const mockChallenges = [
  {
    id: 1,
    title: "Two Sum Problem",
    difficulty: "Easy",
    category: "Arrays",
    solved: 12453,
    time: "15 min",
    points: 50,
  },
  {
    id: 2,
    title: "Binary Tree Traversal",
    difficulty: "Medium",
    category: "Trees",
    solved: 8234,
    time: "30 min",
    points: 100,
  },
  {
    id: 3,
    title: "Dynamic Programming - Knapsack",
    difficulty: "Hard",
    category: "DP",
    solved: 3421,
    time: "45 min",
    points: 200,
  },
  {
    id: 4,
    title: "React Component Design",
    difficulty: "Medium",
    category: "Frontend",
    solved: 6789,
    time: "25 min",
    points: 80,
  },
];

export default function Practice() {
  const [category, setCategory] = useState("All");

  const categories = [...new Set(mockChallenges.map((c) => c.category))];

  const filteredChallenges =
    category === "All"
      ? mockChallenges
      : mockChallenges.filter((c) => c.category === category);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-success/10 text-success border-success/20";
      case "Medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "Hard":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Practice & Improve</h1>
        <p className="text-muted-foreground">
          Sharpen your coding skills with daily challenges
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-6 bg-gradient-to-br from-success/10 to-success/5 rounded-xl border border-success/20">
          <Trophy className="h-8 w-8 text-success mb-2" />
          <div className="text-2xl font-bold mb-1">250</div>
          <div className="text-sm text-muted-foreground">Problems Solved</div>
        </div>
        <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
          <Code className="h-8 w-8 text-primary mb-2" />
          <div className="text-2xl font-bold mb-1">15</div>
          <div className="text-sm text-muted-foreground">Day Streak</div>
        </div>
        <div className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/20">
          <CheckCircle className="h-8 w-8 text-accent mb-2" />
          <div className="text-2xl font-bold mb-1">3,450</div>
          <div className="text-sm text-muted-foreground">Total Points</div>
        </div>
      </div>

      <div className="mb-6">
        <CategoryFilter
          categories={categories}
          selected={category}
          onSelect={setCategory}
        />
      </div>

      <div className="space-y-4">
        {filteredChallenges.map((challenge) => (
          <div
            key={challenge.id}
            className="p-6 bg-card rounded-xl border border-border hover:shadow-[var(--shadow-hover)] transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <h3 className="text-lg font-semibold flex-1">{challenge.title}</h3>
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                  <Badge variant="outline">{challenge.category}</Badge>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>{challenge.solved.toLocaleString()} solved</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-info" />
                    <span>{challenge.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-warning" />
                    <span>{challenge.points} points</span>
                  </div>
                </div>
              </div>
              
              <Button>Solve Challenge</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

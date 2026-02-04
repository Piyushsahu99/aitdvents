import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { 
  Filter, 
  SortAsc, 
  CalendarIcon, 
  X,
  Sparkles,
  Clock,
  Users,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuizFiltersState {
  status: string;
  difficulty: string;
  sortBy: string;
  dateRange: { from: Date | null; to: Date | null };
}

interface QuizFiltersProps {
  filters: QuizFiltersState;
  onFiltersChange: (filters: QuizFiltersState) => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Status", icon: Sparkles },
  { value: "live", label: "Live Now", icon: Flame },
  { value: "upcoming", label: "Upcoming", icon: Clock },
];

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "All Levels" },
  { value: "easy", label: "Easy", color: "text-green-500" },
  { value: "medium", label: "Medium", color: "text-yellow-500" },
  { value: "hard", label: "Hard", color: "text-red-500" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Recently Added", icon: Clock },
  { value: "popular", label: "Most Popular", icon: Users },
  { value: "starting-soon", label: "Starting Soon", icon: Flame },
];

export function QuizFilters({ filters, onFiltersChange }: QuizFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = <K extends keyof QuizFiltersState>(
    key: K,
    value: QuizFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: "all",
      difficulty: "all",
      sortBy: "recent",
      dateRange: { from: null, to: null },
    });
  };

  const activeFiltersCount = [
    filters.status !== "all",
    filters.difficulty !== "all",
    filters.sortBy !== "recent",
    filters.dateRange.from !== null,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Quick filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 bg-muted rounded-full p-1">
          {STATUS_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={filters.status === opt.value ? "default" : "ghost"}
              size="sm"
              className={cn(
                "rounded-full h-8 px-3 text-xs gap-1.5",
                filters.status === opt.value && "shadow-sm"
              )}
              onClick={() => updateFilter("status", opt.value)}
            >
              <opt.icon className="h-3.5 w-3.5" />
              {opt.label}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="rounded-full h-8 gap-1.5"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-3.5 w-3.5" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full h-8 text-muted-foreground hover:text-foreground"
            onClick={clearFilters}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap items-center gap-3 p-4 rounded-xl border bg-muted/30"
        >
          {/* Difficulty */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Difficulty</label>
            <Select
              value={filters.difficulty}
              onValueChange={(v) => updateFilter("difficulty", v)}
            >
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className={opt.color}>{opt.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Sort By</label>
            <Select
              value={filters.sortBy}
              onValueChange={(v) => updateFilter("sortBy", v)}
            >
              <SelectTrigger className="w-[150px] h-9">
                <SortAsc className="h-3.5 w-3.5 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <opt.icon className="h-3.5 w-3.5" />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "MMM d")} -{" "}
                        {format(filters.dateRange.to, "MMM d")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    "Pick dates"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: filters.dateRange.from || undefined,
                    to: filters.dateRange.to || undefined,
                  }}
                  onSelect={(range) =>
                    updateFilter("dateRange", {
                      from: range?.from || null,
                      to: range?.to || null,
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </motion.div>
      )}
    </div>
  );
}

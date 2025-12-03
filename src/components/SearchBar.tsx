import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ placeholder = "Search...", value, onChange }: SearchBarProps) => {
  return (
    <div className="relative group w-full">
      {/* Glow effect on focus */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-center">
        <div className="absolute left-4 text-muted-foreground">
          <Search className="h-5 w-5" />
        </div>
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-12 pr-12 h-14 text-base rounded-xl border-border bg-card shadow-sm focus:shadow-md transition-shadow w-full"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 h-8 w-8 rounded-lg hover:bg-muted"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

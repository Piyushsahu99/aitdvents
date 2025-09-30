import { Badge } from "@/components/ui/badge";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export const CategoryFilter = ({ categories, selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={selected === "All" ? "default" : "outline"}
        className="cursor-pointer"
        onClick={() => onSelect("All")}
      >
        All
      </Badge>
      {categories.map((category) => (
        <Badge
          key={category}
          variant={selected === category ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onSelect(category)}
        >
          {category}
        </Badge>
      ))}
    </div>
  );
};

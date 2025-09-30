import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { blogs } from "@/data/mockData";
import { User, Calendar, Clock } from "lucide-react";

export default function Blogs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [...new Set(blogs.map((b) => b.category))];

  const filteredBlogs = blogs.filter(
    (blog) =>
      (category === "All" || blog.category === category) &&
      (blog.title.toLowerCase().includes(search.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Student Blogs</h1>
          <p className="text-muted-foreground">
            Read and share experiences from the student community
          </p>
        </div>
        <Button>Write a Blog</Button>
      </div>

      <div className="space-y-6 mb-8">
        <SearchBar
          placeholder="Search blogs..."
          value={search}
          onChange={setSearch}
        />
        <CategoryFilter
          categories={categories}
          selected={category}
          onSelect={setCategory}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBlogs.map((blog) => (
          <div
            key={blog.id}
            className="p-6 bg-card rounded-lg border border-border hover:shadow-[var(--shadow-hover)] transition-all group cursor-pointer"
          >
            <Badge variant="secondary" className="mb-4">
              {blog.category}
            </Badge>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              {blog.title}
            </h3>
            <p className="text-muted-foreground mb-4">{blog.excerpt}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{blog.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{blog.readTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBlogs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No blogs found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

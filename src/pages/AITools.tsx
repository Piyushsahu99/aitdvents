import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { aiTools, externalCourses, youtubePlaylistsForBeginners } from "@/data/mockData";
import { ExternalLink, Lightbulb, BookOpen, Play, Youtube, GraduationCap, Wrench, Sparkles } from "lucide-react";

export default function AITools() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [courseCategory, setCourseCategory] = useState("All");
  const [playlistCategory, setPlaylistCategory] = useState("All");

  const toolCategories = ["All", ...new Set(aiTools.map((t) => t.category))];
  const courseCategories = ["All", ...new Set(externalCourses.map((c) => c.category))];
  const playlistCategories = ["All", ...new Set(youtubePlaylistsForBeginners.map((p) => p.category))];

  const filteredTools = aiTools.filter(
    (tool) =>
      (category === "All" || tool.category === category) &&
      (tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredCourses = externalCourses.filter(
    (course) =>
      (courseCategory === "All" || course.category === courseCategory) &&
      (course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.platform.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredPlaylists = youtubePlaylistsForBeginners.filter(
    (playlist) =>
      (playlistCategory === "All" || playlist.category === playlistCategory) &&
      (playlist.title.toLowerCase().includes(search.toLowerCase()) ||
        playlist.channel.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Hero Section */}
      <div className="relative py-16 px-4 bg-gradient-to-r from-violet-600 to-purple-600">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            <Sparkles className="w-4 h-4 mr-2" />
            Student Resources Hub
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            AI Tools & Learning Resources
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Curated collection of essential tools, free courses, and YouTube playlists for students
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              AI Tools
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Free Courses
            </TabsTrigger>
            <TabsTrigger value="playlists" className="flex items-center gap-2">
              <Youtube className="w-4 h-4" />
              YouTube Playlists
            </TabsTrigger>
          </TabsList>

          {/* AI Tools Tab */}
          <TabsContent value="tools">
            <div className="space-y-6 mb-8">
              <SearchBar
                placeholder="Search AI tools..."
                value={search}
                onChange={setSearch}
              />
              <CategoryFilter
                categories={toolCategories}
                selected={category}
                onSelect={setCategory}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <Card
                  key={tool.id}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {tool.name}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {tool.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                    
                    <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-md">
                      <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">{tool.useCase}</p>
                    </div>
                    
                    <Button variant="outline" className="w-full" asChild>
                      <a href={tool.link} target="_blank" rel="noopener noreferrer">
                        Visit Tool
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTools.length === 0 && (
              <div className="text-center py-12">
                <Wrench className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tools found matching your criteria</p>
              </div>
            )}
          </TabsContent>

          {/* Free Courses Tab */}
          <TabsContent value="courses">
            <div className="space-y-6 mb-8">
              <SearchBar
                placeholder="Search courses..."
                value={search}
                onChange={setSearch}
              />
              <CategoryFilter
                categories={courseCategories}
                selected={courseCategory}
                onSelect={setCourseCategory}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="relative h-40 overflow-hidden bg-muted">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      {course.isFree ? (
                        <Badge className="bg-green-500 text-white">Free</Badge>
                      ) : (
                        <Badge className="bg-orange-500 text-white">Paid</Badge>
                      )}
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-black/70 text-white">
                        {course.platform}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {course.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {course.level}
                      </Badge>
                    </div>
                    <Button className="w-full" asChild>
                      <a href={course.link} target="_blank" rel="noopener noreferrer">
                        <BookOpen className="mr-2 h-4 w-4" />
                        View Course
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No courses found matching your criteria</p>
              </div>
            )}
          </TabsContent>

          {/* YouTube Playlists Tab */}
          <TabsContent value="playlists">
            <div className="space-y-6 mb-8">
              <SearchBar
                placeholder="Search playlists..."
                value={search}
                onChange={setSearch}
              />
              <CategoryFilter
                categories={playlistCategories}
                selected={playlistCategory}
                onSelect={setPlaylistCategory}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaylists.map((playlist) => (
                <Card
                  key={playlist.id}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="relative h-40 overflow-hidden bg-muted">
                    <img
                      src={playlist.thumbnail}
                      alt={playlist.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-red-600 text-white">
                        <Youtube className="w-3 h-3 mr-1" />
                        {playlist.videos}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-black/70 text-white text-xs">
                        {playlist.language}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                      {playlist.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{playlist.channel}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge variant="outline" className="text-xs">
                      {playlist.category}
                    </Badge>
                    <Button className="w-full bg-red-600 hover:bg-red-700" asChild>
                      <a href={playlist.link} target="_blank" rel="noopener noreferrer">
                        <Play className="mr-2 h-4 w-4" />
                        Watch Playlist
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPlaylists.length === 0 && (
              <div className="text-center py-12">
                <Youtube className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No playlists found matching your criteria</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
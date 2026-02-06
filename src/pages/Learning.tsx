import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ResourceShareButtons } from "@/components/ResourceShareButtons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { externalCourses, youtubePlaylistsForBeginners } from "@/data/mockData";
import { 
  ExternalLink, BookOpen, Play, Youtube, GraduationCap, 
  Sparkles, Plus, Clock, CheckCircle, XCircle, Loader2,
  Send, Users, Video, Globe, Star, Share2, TrendingUp, Award
} from "lucide-react";
import { toast } from "sonner";

interface LearningResource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  resource_type: string;
  platform: string;
  instructor_or_channel: string;
  thumbnail_url: string | null;
  link: string;
  language: string | null;
  level: string | null;
  video_count: string | null;
  is_free: boolean | null;
  status: string;
  submitted_by: string | null;
  created_at: string;
}

export default function Learning() {
  const [search, setSearch] = useState("");
  const [courseCategory, setCourseCategory] = useState("All");
  const [playlistCategory, setPlaylistCategory] = useState("All");
  const [user, setUser] = useState<any>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    resource_type: "course",
    platform: "",
    instructor_or_channel: "",
    thumbnail_url: "",
    link: "",
    language: "English",
    level: "Beginner",
    video_count: "",
    is_free: true,
  });
  
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // Fetch approved community resources
  const { data: communityResources = [], isLoading } = useQuery({
    queryKey: ['learning-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as LearningResource[];
    }
  });

  // Fetch user's submissions
  const { data: mySubmissions = [] } = useQuery({
    queryKey: ['my-learning-submissions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as LearningResource[];
    },
    enabled: !!user
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error("Please sign in to submit");
      
      const { error } = await supabase
        .from('learning_resources')
        .insert({
          ...data,
          submitted_by: user.id,
          status: 'pending'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Resource submitted for review!");
      setIsSubmitOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        resource_type: "course",
        platform: "",
        instructor_or_channel: "",
        thumbnail_url: "",
        link: "",
        language: "English",
        level: "Beginner",
        video_count: "",
        is_free: true,
      });
      queryClient.invalidateQueries({ queryKey: ['my-learning-submissions'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const courseCategories = ["All", ...new Set(externalCourses.map((c) => c.category))];
  const playlistCategories = ["All", ...new Set(youtubePlaylistsForBeginners.map((p) => p.category))];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.platform || !formData.link) {
      toast.error("Please fill all required fields");
      return;
    }
    submitMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Hero Section */}
      <div className="relative py-12 md:py-20 px-4 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400/20 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-4 bg-white/20 text-white border border-white/30 backdrop-blur-sm rounded-full px-4 py-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">100% Free Learning Resources</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Learning Hub
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Master new skills with curated courses, YouTube playlists, and community-contributed resources
          </p>
          
          {/* Stats Cards */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8">
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20">
              <div className="p-2 bg-white/20 rounded-xl">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-white">{externalCourses.length}+</p>
                <p className="text-xs text-white/80">Free Courses</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20">
              <div className="p-2 bg-white/20 rounded-xl">
                <Youtube className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-white">{youtubePlaylistsForBeginners.length}+</p>
                <p className="text-xs text-white/80">Playlists</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20">
              <div className="p-2 bg-white/20 rounded-xl">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-white">Open</p>
                <p className="text-xs text-white/80">Community</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Share2 className="w-4 h-4" />
            <span className="text-sm">Share resources with friends & earn recognition!</span>
          </div>
          <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg">
                <Plus className="w-4 h-4" />
                Submit a Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  Submit Learning Resource
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Complete React Course"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the resource..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select value={formData.resource_type} onValueChange={(v) => setFormData({ ...formData, resource_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="playlist">Playlist</SelectItem>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Web Development"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform *</Label>
                    <Input
                      id="platform"
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      placeholder="e.g., YouTube, Udemy"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instructor/Channel *</Label>
                    <Input
                      id="instructor"
                      value={formData.instructor_or_channel}
                      onChange={(e) => setFormData({ ...formData, instructor_or_channel: e.target.value })}
                      placeholder="e.g., freeCodeCamp"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="link">Link *</Label>
                  <Input
                    id="link"
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://..."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="https://... (optional)"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="videos">Videos</Label>
                    <Input
                      id="videos"
                      value={formData.video_count}
                      onChange={(e) => setFormData({ ...formData, video_count: e.target.value })}
                      placeholder="e.g., 50+"
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit for Review
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 h-auto p-1.5 bg-muted/50 rounded-2xl">
            <TabsTrigger value="courses" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Courses</span>
            </TabsTrigger>
            <TabsTrigger value="playlists" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Youtube className="w-4 h-4" />
              <span className="hidden sm:inline">Playlists</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
            <TabsTrigger value="my-submissions" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">My Submissions</span>
            </TabsTrigger>
          </TabsList>

          {/* Free Courses Tab */}
          <TabsContent value="courses">
            <div className="space-y-6 mb-8">
              <div className="max-w-xl mx-auto">
                <SearchBar
                  placeholder="Search courses by title or platform..."
                  value={search}
                  onChange={setSearch}
                />
              </div>
              <CategoryFilter
                categories={courseCategories}
                selected={courseCategory}
                onSelect={setCourseCategory}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-border/50 flex flex-col bg-card/80 backdrop-blur-sm"
                >
                  <div className="relative h-36 overflow-hidden bg-muted">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-2 right-2">
                      {course.isFree ? (
                        <Badge className="bg-emerald-500 text-white shadow-lg text-xs">Free</Badge>
                      ) : (
                        <Badge className="bg-orange-500 text-white shadow-lg text-xs">Paid</Badge>
                      )}
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm text-xs">
                        {course.platform}
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm text-xs">
                          {course.level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardHeader className="pb-2 flex-1">
                    <CardTitle className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                      {course.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">by {course.instructor}</p>
                  </CardHeader>
                  <CardContent className="pt-0 pb-2">
                    <Badge variant="outline" className="text-xs">
                      {course.category}
                    </Badge>
                  </CardContent>
                  <CardFooter className="pt-2 pb-3 flex flex-col gap-2 border-t border-border/50">
                    <div className="flex items-center justify-between w-full">
                      <Button size="sm" className="flex-1 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-xs" asChild>
                        <a href={course.link} target="_blank" rel="noopener noreferrer">
                          <BookOpen className="mr-1.5 h-3 w-3" />
                          View Course
                        </a>
                      </Button>
                    </div>
                    <div className="w-full flex justify-center border-t border-border/30 pt-2">
                      <ResourceShareButtons 
                        title={course.title} 
                        resourceType="course" 
                        resourceId={String(course.id)}
                        platform={course.platform}
                        compact={true}
                      />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-16">
                <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter</p>
              </div>
            )}
          </TabsContent>

          {/* YouTube Playlists Tab */}
          <TabsContent value="playlists">
            <div className="space-y-6 mb-8">
              <div className="max-w-xl mx-auto">
                <SearchBar
                  placeholder="Search playlists by title or channel..."
                  value={search}
                  onChange={setSearch}
                />
              </div>
              <CategoryFilter
                categories={playlistCategories}
                selected={playlistCategory}
                onSelect={setPlaylistCategory}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredPlaylists.map((playlist) => (
                <Card
                  key={playlist.id}
                  className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-border/50 flex flex-col bg-card/80 backdrop-blur-sm"
                >
                  <div className="relative h-36 overflow-hidden bg-muted">
                    <img
                      src={playlist.thumbnail}
                      alt={playlist.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-600 text-white shadow-lg text-xs">
                        <Video className="w-3 h-3 mr-1" />
                        {playlist.videos}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-black/60 text-white text-xs backdrop-blur-sm">
                        <Globe className="w-3 h-3 mr-1" />
                        {playlist.language}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2 flex-1">
                    <CardTitle className="text-sm font-semibold line-clamp-2 group-hover:text-red-500 transition-colors leading-tight">
                      {playlist.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Youtube className="w-3 h-3 text-red-500" />
                      {playlist.channel}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0 pb-2">
                    <Badge variant="outline" className="text-xs">
                      {playlist.category}
                    </Badge>
                  </CardContent>
                  <CardFooter className="pt-2 pb-3 flex flex-col gap-2 border-t border-border/50">
                    <Button size="sm" className="w-full h-8 bg-red-600 hover:bg-red-700 text-xs" asChild>
                      <a href={playlist.link} target="_blank" rel="noopener noreferrer">
                        <Play className="mr-1.5 h-3 w-3" />
                        Watch Playlist
                      </a>
                    </Button>
                    <div className="w-full flex justify-center border-t border-border/30 pt-2">
                      <ResourceShareButtons 
                        title={playlist.title} 
                        resourceType="playlist" 
                        resourceId={String(playlist.id)}
                        platform="YouTube"
                        compact={true}
                      />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredPlaylists.length === 0 && (
              <div className="text-center py-16">
                <Youtube className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No playlists found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter</p>
              </div>
            )}
          </TabsContent>

          {/* Community Resources Tab */}
          <TabsContent value="community">
            <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold">Community Contributed Resources</h3>
              </div>
              <p className="text-sm text-muted-foreground">Resources shared by students and approved by our team. Submit yours to help others!</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : communityResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {communityResources.map((resource) => (
                  <Card
                    key={resource.id}
                    className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-border/50 flex flex-col bg-card/80 backdrop-blur-sm"
                  >
                    <div className="relative h-36 overflow-hidden bg-muted">
                      <img
                        src={resource.thumbnail_url || "/placeholder.svg"}
                        alt={resource.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-purple-600 text-white shadow-lg text-xs capitalize">
                          {resource.resource_type}
                        </Badge>
                      </div>
                      {resource.is_free && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-emerald-500 text-white shadow-lg text-xs">Free</Badge>
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2 flex-1">
                      <CardTitle className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                        {resource.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {resource.platform} • {resource.instructor_or_channel}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0 pb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {resource.category}
                        </Badge>
                        {resource.level && (
                          <Badge variant="outline" className="text-xs">
                            {resource.level}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 pb-3 flex flex-col gap-2 border-t border-border/50">
                      <Button size="sm" className="w-full h-8 text-xs" asChild>
                        <a href={resource.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-1.5 h-3 w-3" />
                          View Resource
                        </a>
                      </Button>
                      <div className="w-full flex justify-center border-t border-border/30 pt-2">
                        <ResourceShareButtons 
                          title={resource.title} 
                          resourceType="resource" 
                          resourceId={resource.id}
                          platform={resource.platform}
                          compact={true}
                        />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Community Resources Yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to contribute!</p>
                <Button onClick={() => setIsSubmitOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Submit a Resource
                </Button>
              </div>
            )}
          </TabsContent>

          {/* My Submissions Tab */}
          <TabsContent value="my-submissions">
            {!user ? (
              <div className="text-center py-16">
                <Send className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
                <p className="text-muted-foreground">Please sign in to view your submissions</p>
              </div>
            ) : mySubmissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {mySubmissions.map((submission) => (
                  <Card key={submission.id} className="border-border/50 bg-card/80">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm line-clamp-2">
                          {submission.title}
                        </CardTitle>
                        {getStatusBadge(submission.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {submission.platform} • {submission.category}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getStatusIcon(submission.status)}
                        <span className="text-xs">
                          {submission.status === 'pending' && "Awaiting admin review"}
                          {submission.status === 'approved' && "Published to community"}
                          {submission.status === 'rejected' && "Not approved"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Submitted on {new Date(submission.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Send className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Submissions Yet</h3>
                <p className="text-muted-foreground mb-4">Share helpful resources with the community!</p>
                <Button onClick={() => setIsSubmitOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Submit Your First Resource
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Play, Heart, Eye, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Reel {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  category: string;
  platform: string;
  likes_count: number;
  views_count: number;
  is_hidden: boolean;
  created_at: string;
}

interface UserReelsSectionProps {
  userId: string;
}

export function UserReelsSection({ userId }: UserReelsSectionProps) {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserReels();
  }, [userId]);

  const fetchUserReels = async () => {
    const { data, error } = await supabase
      .from("reels")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reels:", error);
    } else {
      setReels(data || []);
      const likes = (data || []).reduce((sum, reel) => sum + (reel.likes_count || 0), 0);
      const views = (data || []).reduce((sum, reel) => sum + (reel.views_count || 0), 0);
      setTotalLikes(likes);
      setTotalViews(views);
    }
    setLoading(false);
  };

  const handleDeleteReel = async (reelId: string) => {
    const { error } = await supabase
      .from("reels")
      .delete()
      .eq("id", reelId)
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Error", description: "Failed to delete reel", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Reel deleted successfully" });
      fetchUserReels();
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Web Development": "bg-blue-500",
      "Data Science": "bg-green-500",
      "Mobile Development": "bg-purple-500",
      "AI/ML": "bg-orange-500",
      "DevOps": "bg-cyan-500",
      "Career Tips": "bg-pink-500",
      "Interview Prep": "bg-amber-500",
      "Project Showcase": "bg-indigo-500",
    };
    return colors[category] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4 text-center">
            <Play className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{reels.length}</p>
            <p className="text-sm text-muted-foreground">Reels Shared</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
          <CardContent className="p-4 text-center">
            <Heart className="h-6 w-6 mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold">{totalLikes}</p>
            <p className="text-sm text-muted-foreground">Total Likes</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4 text-center">
            <Eye className="h-6 w-6 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{totalViews}</p>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>
      </div>

      {/* Reels List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            My Shared Reels
          </CardTitle>
          <CardDescription>Manage your educational content</CardDescription>
        </CardHeader>
        <CardContent>
          {reels.length === 0 ? (
            <div className="text-center py-8">
              <Play className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">You haven't shared any reels yet</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.href = "/reels"}>
                Share Your First Reel
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {reels.map((reel) => (
                <div
                  key={reel.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${
                    reel.is_hidden ? "bg-destructive/10 border-destructive/30" : "bg-card"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{reel.title}</h4>
                      {reel.is_hidden && (
                        <Badge variant="destructive" className="text-xs">Hidden</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {reel.description || "No description"}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Badge className={`${getCategoryColor(reel.category)} text-white text-xs`}>
                        {reel.category}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {reel.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {reel.views_count}
                      </span>
                      <span>{new Date(reel.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(reel.video_url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Reel?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your reel.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteReel(reel.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Lock, Globe, Trash2, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  is_internal: boolean;
  attachments: string[] | null;
  created_at: string;
}

interface TaskCommentsProps {
  taskId: string;
  taskTitle: string;
}

export function TaskComments({ taskId, taskTitle }: TaskCommentsProps) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [users, setUsers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    fetchUsers();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("task_comments")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("student_profiles").select("user_id, full_name, avatar_url");
    const userMap: Record<string, any> = {};
    data?.forEach(user => {
      userMap[user.user_id] = user;
    });
    setUsers(userMap);
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
        return;
      }

      const { error } = await supabase.from("task_comments").insert([{
        task_id: taskId,
        user_id: user.id,
        comment: newComment.trim(),
        is_internal: isInternal,
      }]);

      if (error) throw error;

      toast({ title: "Success", description: "Comment added" });
      setNewComment("");
      await fetchComments();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("task_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      toast({ title: "Success", description: "Comment deleted" });
      await fetchComments();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getUserInfo = (userId: string) => {
    const user = users[userId];
    return {
      name: user?.full_name || "Unknown User",
      avatar: user?.avatar_url,
      initials: (user?.full_name || "U").substring(0, 2).toUpperCase(),
    };
  };

  if (isLoading) {
    return <div className="text-center py-4 text-muted-foreground text-sm">Loading comments...</div>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Discussion
        </CardTitle>
        <CardDescription className="text-xs line-clamp-1">{taskTitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comments List */}
        <ScrollArea className="max-h-[300px] pr-3">
          {comments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No comments yet</p>
              <p className="text-xs">Start the discussion</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => {
                const userInfo = getUserInfo(comment.user_id);
                return (
                  <div key={comment.id} className="flex gap-3 group">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={userInfo.avatar} />
                      <AvatarFallback className="text-xs">{userInfo.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{userInfo.name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                        {comment.is_internal && (
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Lock className="h-2.5 w-2.5" />
                            Internal
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                        {comment.comment}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                        onClick={() => handleDelete(comment.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* New Comment Form */}
        <div className="space-y-3 pt-3 border-t">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
            className="resize-none text-sm"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="internal"
                checked={isInternal}
                onCheckedChange={setIsInternal}
              />
              <Label htmlFor="internal" className="text-xs flex items-center gap-1 cursor-pointer">
                {isInternal ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                {isInternal ? "Internal only" : "Visible to all"}
              </Label>
            </div>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
              className="gap-1"
            >
              <Send className="h-3.5 w-3.5" />
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

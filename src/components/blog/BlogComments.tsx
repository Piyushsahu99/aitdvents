import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, User, Clock, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  author_name: string | null;
}

interface BlogCommentsProps {
  blogId: string;
}

export function BlogComments({ blogId }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    checkUser();
  }, [blogId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('blog_id', blogId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      toast({
        title: 'Empty comment',
        description: 'Please write something before posting.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Not logged in',
        description: 'Please log in to comment.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Get user profile for name
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      const authorName = profile?.full_name || user.email || 'Anonymous';

      const { error } = await supabase.from('blog_comments').insert({
        blog_id: blogId,
        user_id: user.id,
        content: newComment.trim(),
        author_name: authorName,
      });

      if (error) throw error;

      toast({
        title: 'Comment posted! 💬',
        description: 'Your comment is now visible.',
      });

      setNewComment('');
      fetchComments();
    } catch (error: any) {
      console.error('Comment error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to post comment.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h2>
      </div>

      {/* Add Comment Form */}
      <Card className="p-4 bg-muted/30 border-border/50">
        <div className="space-y-3">
          <Textarea
            placeholder={
              user
                ? 'Share your thoughts...'
                : 'Please log in to comment'
            }
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!user || submitting}
            className="min-h-[100px] resize-none bg-background"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {newComment.length}/500
            </p>
            <Button
              onClick={handleSubmit}
              disabled={!user || submitting || !newComment.trim()}
              size="sm"
              className="rounded-full"
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Post Comment
            </Button>
          </div>
        </div>
      </Card>

      {/* Comments List */}
      {comments.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground font-medium mb-1">
            No comments yet
          </p>
          <p className="text-sm text-muted-foreground">
            Be the first to share your thoughts!
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div key={comment.id}>
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                      {comment.author_name?.charAt(0)?.toUpperCase() || <User className="h-5 w-5" />}
                    </div>
                  </div>

                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">
                        {comment.author_name || 'Anonymous'}
                      </p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </Card>
              {index < comments.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

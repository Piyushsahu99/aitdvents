import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  CheckCircle, XCircle, Clock, ExternalLink, 
  Loader2, GraduationCap, Trash2, Eye
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
  admin_notes: string | null;
  submitted_by: string | null;
  created_at: string;
}

export function LearningResourcesManager() {
  const [selectedResource, setSelectedResource] = useState<LearningResource | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['admin-learning-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as LearningResource[];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('learning_resources')
        .update({
          status,
          admin_notes: notes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Resource ${actionType === 'approve' ? 'approved' : 'rejected'}!`);
      setActionDialogOpen(false);
      setSelectedResource(null);
      setAdminNotes("");
      queryClient.invalidateQueries({ queryKey: ['admin-learning-resources'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('learning_resources')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Resource deleted");
      queryClient.invalidateQueries({ queryKey: ['admin-learning-resources'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleAction = (resource: LearningResource, action: 'approve' | 'reject') => {
    setSelectedResource(resource);
    setActionType(action);
    setAdminNotes(resource.admin_notes || "");
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedResource || !actionType) return;
    updateMutation.mutate({
      id: selectedResource.id,
      status: actionType === 'approve' ? 'approved' : 'rejected',
      notes: adminNotes
    });
  };

  const pendingResources = resources.filter(r => r.status === 'pending');
  const approvedResources = resources.filter(r => r.status === 'approved');
  const rejectedResources = resources.filter(r => r.status === 'rejected');

  const ResourceCard = ({ resource, showActions = true }: { resource: LearningResource; showActions?: boolean }) => (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base line-clamp-2">{resource.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {resource.platform} • {resource.instructor_or_channel}
            </p>
          </div>
          <Badge variant={resource.resource_type === 'course' ? 'default' : 'secondary'}>
            {resource.resource_type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {resource.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">{resource.category}</Badge>
          {resource.level && <Badge variant="outline" className="text-xs">{resource.level}</Badge>}
          {resource.language && <Badge variant="outline" className="text-xs">{resource.language}</Badge>}
          {resource.is_free && <Badge className="bg-green-500/10 text-green-600 text-xs">Free</Badge>}
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          <Button variant="outline" size="sm" asChild>
            <a href={resource.link} target="_blank" rel="noopener noreferrer">
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </a>
          </Button>
          
          {showActions && resource.status === 'pending' && (
            <>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleAction(resource, 'approve')}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleAction(resource, 'reject')}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-destructive hover:text-destructive ml-auto"
            onClick={() => {
              if (confirm("Delete this resource permanently?")) {
                deleteMutation.mutate(resource.id);
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Submitted: {new Date(resource.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            Learning Resources
          </h2>
          <p className="text-muted-foreground">Review and manage community-submitted learning resources</p>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span>{pendingResources.length} pending</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{approvedResources.length} approved</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingResources.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved ({approvedResources.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="w-4 h-4" />
            Rejected ({rejectedResources.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingResources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No pending submissions</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {approvedResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedResources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} showActions={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No approved resources yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rejectedResources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} showActions={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <XCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No rejected resources</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Resource
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium">{selectedResource?.title}</p>
              <p className="text-sm text-muted-foreground">
                {selectedResource?.platform} • {selectedResource?.category}
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Notes (optional)</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes for this decision..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAction}
              disabled={updateMutation.isPending}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : actionType === 'approve' ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

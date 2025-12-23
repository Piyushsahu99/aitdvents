import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Download,
  Clock,
  BookOpen,
  FileQuestion,
  Notebook,
  FileText,
  Library,
  ExternalLink,
} from 'lucide-react';

interface StudyMaterial {
  id: string;
  title: string;
  description: string | null;
  category: string;
  subject: string;
  course: string | null;
  semester: string | null;
  year: string | null;
  college: string | null;
  university: string | null;
  state: string | null;
  city: string | null;
  file_url: string;
  file_type: string | null;
  downloads_count: number | null;
  status: string;
  rejection_reason: string | null;
  created_at: string | null;
  uploaded_by: string;
}

const categories = [
  { value: 'books', label: 'Books', icon: BookOpen },
  { value: 'question_papers', label: 'Question Papers', icon: FileQuestion },
  { value: 'notes', label: 'Notes', icon: Notebook },
  { value: 'syllabus', label: 'Syllabus', icon: FileText },
  { value: 'other', label: 'Other', icon: Library },
];

export default function StudyMaterialsManager() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchMaterials();
  }, [filter]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('study_materials')
        .update({ 
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Material approved successfully');
      fetchMaterials();
      setSelectedMaterial(null);
    } catch (error) {
      console.error('Error approving material:', error);
      toast.error('Failed to approve material');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const { error } = await supabase
        .from('study_materials')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Material rejected');
      fetchMaterials();
      setSelectedMaterial(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting material:', error);
      toast.error('Failed to reject material');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      const { error } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Material deleted');
      fetchMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.icon || FileText;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const filteredMaterials = materials.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.college?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: materials.length,
    pending: materials.filter(m => m.status === 'pending').length,
    approved: materials.filter(m => m.status === 'approved').length,
    rejected: materials.filter(m => m.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Materials</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search materials..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Materials List */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : filteredMaterials.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No materials found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMaterials.map((material) => {
            const CategoryIcon = getCategoryIcon(material.category);
            return (
              <Card key={material.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <CategoryIcon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{material.title}</h3>
                          {getStatusBadge(material.status)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <span>{material.subject}</span>
                          {material.course && <span> • {material.course}</span>}
                          {material.college && <span> • {material.college}</span>}
                          {material.state && <span> • {material.state}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploaded: {new Date(material.created_at || '').toLocaleDateString()}
                          {material.downloads_count && ` • ${material.downloads_count} downloads`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(material.file_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMaterial(material)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {material.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleApprove(material.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setSelectedMaterial(material)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(material.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail/Reject Dialog */}
      <Dialog open={!!selectedMaterial} onOpenChange={() => setSelectedMaterial(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Material Details</DialogTitle>
          </DialogHeader>
          {selectedMaterial && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{selectedMaterial.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{categories.find(c => c.value === selectedMaterial.category)?.label}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-medium">{selectedMaterial.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">{selectedMaterial.course || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">College</p>
                  <p className="font-medium">{selectedMaterial.college || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">University</p>
                  <p className="font-medium">{selectedMaterial.university || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">State</p>
                  <p className="font-medium">{selectedMaterial.state || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium">{selectedMaterial.city || '-'}</p>
                </div>
              </div>

              {selectedMaterial.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{selectedMaterial.description}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={() => window.open(selectedMaterial.file_url, '_blank')}>
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
              </div>

              {selectedMaterial.status === 'pending' && (
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Rejection Reason (if rejecting)</p>
                    <Textarea
                      placeholder="Provide a reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => handleApprove(selectedMaterial.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(selectedMaterial.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

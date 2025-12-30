import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useEarnCoins } from '@/hooks/useEarnCoins';
import {
  Search,
  Upload,
  BookOpen,
  FileText,
  Download,
  Eye,
  Filter,
  GraduationCap,
  Building,
  MapPin,
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  FileQuestion,
  Notebook,
  Library,
  Coins,
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
  views_count: number | null;
  status: string;
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

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

const courses = [
  'B.Tech', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'BBA', 'MBA', 
  'B.Com', 'M.Com', 'BA', 'MA', 'B.Pharma', 'MBBS', 'BDS', 'LLB', 'Other'
];

const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

export default function StudyMaterials() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [myUploads, setMyUploads] = useState<StudyMaterial[]>([]);
  const { earnCoins, POINT_VALUES } = useEarnCoins();
  
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'notes',
    subject: '',
    course: '',
    semester: '',
    year: '',
    college: '',
    university: '',
    state: '',
    city: '',
    file: null as File | null,
  });

  useEffect(() => {
    fetchMaterials();
    checkUser();
  }, [selectedCategory, selectedState, selectedCourse]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchMyUploads(user.id);
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('study_materials')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }
      if (selectedState !== 'all') {
        query = query.eq('state', selectedState);
      }
      if (selectedCourse !== 'all') {
        query = query.eq('course', selectedCourse);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyUploads = async (userId: string) => {
    const { data } = await supabase
      .from('study_materials')
      .select('*')
      .eq('uploaded_by', userId)
      .order('created_at', { ascending: false });
    setMyUploads(data || []);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File size must be less than 20MB');
        return;
      }
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!user) {
      toast.error('Please login to upload materials');
      return;
    }

    if (!uploadForm.title || !uploadForm.subject || !uploadForm.file) {
      toast.error('Please fill in required fields and select a file');
      return;
    }

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = uploadForm.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(fileName, uploadForm.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('study-materials')
        .getPublicUrl(fileName);

      // Insert material record
      const { error: insertError } = await supabase
        .from('study_materials')
        .insert({
          title: uploadForm.title,
          description: uploadForm.description,
          category: uploadForm.category,
          subject: uploadForm.subject,
          course: uploadForm.course || null,
          semester: uploadForm.semester || null,
          year: uploadForm.year || null,
          college: uploadForm.college || null,
          university: uploadForm.university || null,
          state: uploadForm.state || null,
          city: uploadForm.city || null,
          file_url: publicUrl,
          file_type: fileExt,
          file_size: uploadForm.file.size,
          uploaded_by: user.id,
        });

      if (insertError) throw insertError;

      // Earn coins for uploading material (will be credited when approved)
      toast.success('Material uploaded successfully! You will earn ' + POINT_VALUES.STUDY_MATERIAL_UPLOAD + ' coins when approved.');
      setIsUploadOpen(false);
      setUploadForm({
        title: '',
        description: '',
        category: 'notes',
        subject: '',
        course: '',
        semester: '',
        year: '',
        college: '',
        university: '',
        state: '',
        city: '',
        file: null,
      });
      fetchMyUploads(user.id);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (material: StudyMaterial) => {
    // Increment download count
    await supabase
      .from('study_materials')
      .update({ downloads_count: (material.downloads_count || 0) + 1 })
      .eq('id', material.id);

    window.open(material.file_url, '_blank');
  };

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.college?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.university?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-background pt-20">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Study Materials</h1>
              <p className="text-muted-foreground mt-1">
                Free books, question papers, notes & more for students
              </p>
              <Badge className="mt-2 bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                <Coins className="w-3 h-3 mr-1" />
                Earn {POINT_VALUES.STUDY_MATERIAL_UPLOAD} coins per upload!
              </Badge>
            </div>
            {user && (
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Material
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Upload Study Material</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                          placeholder="e.g., Data Structures Notes"
                          value={uploadForm.title}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select
                          value={uploadForm.category}
                          onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Brief description of the material"
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Subject *</Label>
                        <Input
                          placeholder="e.g., Computer Science"
                          value={uploadForm.subject}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, subject: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Course</Label>
                        <Select
                          value={uploadForm.course}
                          onValueChange={(value) => setUploadForm(prev => ({ ...prev, course: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Semester</Label>
                        <Select
                          value={uploadForm.semester}
                          onValueChange={(value) => setUploadForm(prev => ({ ...prev, semester: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent>
                            {semesters.map(s => (
                              <SelectItem key={s} value={s}>{s} Semester</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Year (for question papers)</Label>
                        <Input
                          placeholder="e.g., 2024"
                          value={uploadForm.year}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, year: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>College Name</Label>
                        <Input
                          placeholder="e.g., IIT Delhi"
                          value={uploadForm.college}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, college: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>University</Label>
                        <Input
                          placeholder="e.g., Delhi University"
                          value={uploadForm.university}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, university: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Select
                          value={uploadForm.state}
                          onValueChange={(value) => setUploadForm(prev => ({ ...prev, state: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {indianStates.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          placeholder="e.g., Mumbai"
                          value={uploadForm.city}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, city: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Upload File * (PDF, DOC, Images - Max 20MB)</Label>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                      {uploadForm.file && (
                        <p className="text-sm text-muted-foreground">
                          Selected: {uploadForm.file.name} ({(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>

                    <Button onClick={handleUpload} disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Upload Material'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Categories Quick Links */}
        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(selectedCategory === cat.value ? 'all' : cat.value)}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, subject, college..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger>
              <MapPin className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {indianStates.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <GraduationCap className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">Browse Materials</TabsTrigger>
            {user && <TabsTrigger value="my-uploads">My Uploads</TabsTrigger>}
          </TabsList>

          <TabsContent value="browse">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted rounded mb-4" />
                      <div className="h-4 bg-muted rounded mb-2 w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No materials found</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to upload study materials for your college!
                </p>
                {user && (
                  <Button onClick={() => setIsUploadOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Now
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaterials.map((material) => {
                  const CategoryIcon = getCategoryIcon(material.category);
                  return (
                    <Card key={material.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <CategoryIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg line-clamp-1">{material.title}</CardTitle>
                              <Badge variant="secondary" className="mt-1">
                                {categories.find(c => c.value === material.category)?.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {material.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {material.description}
                          </p>
                        )}
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <BookOpen className="w-4 h-4" />
                            <span>{material.subject}</span>
                            {material.course && <span>• {material.course}</span>}
                          </div>
                          
                          {material.college && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Building className="w-4 h-4" />
                              <span className="line-clamp-1">{material.college}</span>
                            </div>
                          )}
                          
                          {(material.state || material.city) && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{[material.city, material.state].filter(Boolean).join(', ')}</span>
                            </div>
                          )}
                          
                          {material.year && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>Year: {material.year}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Download className="w-4 h-4" />
                              {material.downloads_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {material.views_count || 0}
                            </span>
                          </div>
                          <Button size="sm" onClick={() => handleDownload(material)}>
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {user && (
            <TabsContent value="my-uploads">
              {myUploads.length === 0 ? (
                <div className="text-center py-16">
                  <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No uploads yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Share study materials with fellow students!
                  </p>
                  <Button onClick={() => setIsUploadOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Your First Material
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myUploads.map((material) => {
                    const CategoryIcon = getCategoryIcon(material.category);
                    return (
                      <Card key={material.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <CategoryIcon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg line-clamp-1">{material.title}</CardTitle>
                                {getStatusBadge(material.status)}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Subject: {material.subject}</p>
                            <p>Category: {categories.find(c => c.value === material.category)?.label}</p>
                            <p>Uploaded: {new Date(material.created_at || '').toLocaleDateString()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}

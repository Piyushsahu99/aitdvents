import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Search,
  Users,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  Linkedin,
  Instagram,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

interface Ambassador {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  college: string;
  city: string;
  state: string;
  year_of_study: string;
  course: string;
  linkedin_url: string | null;
  instagram_url: string | null;
  why_ambassador: string;
  previous_experience: string | null;
  skills: string[] | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

export function AmbassadorManager() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAmbassador, setSelectedAmbassador] = useState<Ambassador | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAmbassadors();
  }, []);

  const fetchAmbassadors = async () => {
    try {
      const { data, error } = await supabase
        .from("campus_ambassadors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAmbassadors(data || []);
    } catch (error) {
      console.error("Error fetching ambassadors:", error);
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("campus_ambassadors")
        .update({ status, admin_notes: adminNotes || null })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Application ${status}`);
      fetchAmbassadors();
      setDetailsOpen(false);
      setAdminNotes("");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update application");
    } finally {
      setUpdating(false);
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      const { error } = await supabase
        .from("campus_ambassadors")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Application deleted");
      fetchAmbassadors();
      setDetailsOpen(false);
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to delete application");
    }
  };

  const openDetails = (ambassador: Ambassador) => {
    setSelectedAmbassador(ambassador);
    setAdminNotes(ambassador.admin_notes || "");
    setDetailsOpen(true);
  };

  const filteredAmbassadors = ambassadors.filter((ambassador) => {
    const matchesSearch =
      ambassador.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ambassador.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ambassador.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ambassador.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || ambassador.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-500 text-white">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const stats = {
    total: ambassadors.length,
    pending: ambassadors.filter((a) => a.status === "pending").length,
    approved: ambassadors.filter((a) => a.status === "approved").length,
    rejected: ambassadors.filter((a) => a.status === "rejected").length,
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Users className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.rejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, college, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Applications Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAmbassadors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No applications found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAmbassadors.map((ambassador) => (
                  <TableRow key={ambassador.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ambassador.full_name}</p>
                        <p className="text-xs text-muted-foreground">{ambassador.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{ambassador.college}</TableCell>
                    <TableCell>
                      {ambassador.city}, {ambassador.state}
                    </TableCell>
                    <TableCell>{ambassador.year_of_study}</TableCell>
                    <TableCell>{format(new Date(ambassador.created_at), "dd MMM yyyy")}</TableCell>
                    <TableCell>{getStatusBadge(ambassador.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetails(ambassador)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {ambassador.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-emerald-600 hover:text-emerald-700"
                              onClick={() => updateStatus(ambassador.id, "approved")}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => updateStatus(ambassador.id, "rejected")}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review the campus ambassador application
            </DialogDescription>
          </DialogHeader>

          {selectedAmbassador && (
            <div className="space-y-6">
              {/* Applicant Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedAmbassador.full_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedAmbassador.status)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </p>
                  <p className="font-medium">{selectedAmbassador.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone
                  </p>
                  <p className="font-medium">{selectedAmbassador.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" /> College
                  </p>
                  <p className="font-medium">{selectedAmbassador.college}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Location
                  </p>
                  <p className="font-medium">
                    {selectedAmbassador.city}, {selectedAmbassador.state}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Year of Study</p>
                  <p className="font-medium">{selectedAmbassador.year_of_study}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Course/Branch</p>
                  <p className="font-medium">{selectedAmbassador.course}</p>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-4">
                {selectedAmbassador.linkedin_url && (
                  <a
                    href={selectedAmbassador.linkedin_url.startsWith("http") ? selectedAmbassador.linkedin_url : `https://${selectedAmbassador.linkedin_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                )}
                {selectedAmbassador.instagram_url && (
                  <a
                    href={selectedAmbassador.instagram_url.startsWith("http") ? selectedAmbassador.instagram_url : `https://instagram.com/${selectedAmbassador.instagram_url.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-pink-600 hover:underline"
                  >
                    <Instagram className="h-4 w-4" /> Instagram
                  </a>
                )}
              </div>

              {/* Motivation */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Why do they want to be an Ambassador?</p>
                <p className="text-sm bg-muted p-4 rounded-lg">{selectedAmbassador.why_ambassador}</p>
              </div>

              {/* Previous Experience */}
              {selectedAmbassador.previous_experience && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Previous Experience</p>
                  <p className="text-sm bg-muted p-4 rounded-lg">
                    {selectedAmbassador.previous_experience}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor="admin_notes">Admin Notes</Label>
                <Textarea
                  id="admin_notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this application..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                {selectedAmbassador.status === "pending" && (
                  <>
                    <Button
                      onClick={() => updateStatus(selectedAmbassador.id, "approved")}
                      disabled={updating}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateStatus(selectedAmbassador.id, "rejected")}
                      disabled={updating}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </>
                )}
                {selectedAmbassador.status !== "pending" && (
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selectedAmbassador.id, "pending")}
                    disabled={updating}
                  >
                    Reset to Pending
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => deleteApplication(selectedAmbassador.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

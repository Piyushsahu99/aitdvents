import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, Clock, FileText, Image, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";

interface Submission {
  id: string;
  task_id: string;
  ambassador_id: string;
  report_title: string;
  report_content: string;
  proof_images: string[];
  proof_links: string[];
  attachments: string[];
  status: string;
  points_awarded: number;
  admin_feedback: string | null;
  created_at: string;
  task?: {
    title: string;
    points: number;
  };
  ambassador?: {
    full_name: string;
    email: string;
    college: string;
  };
}

export function AmbassadorSubmissionReview() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: "approved",
    points_awarded: 0,
    admin_feedback: "",
  });

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const fetchSubmissions = async () => {
    try {
      let query = supabase
        .from("ambassador_task_submissions")
        .select(`
          *,
          task:ambassador_tasks(title, points),
          ambassador:campus_ambassadors(full_name, email, college)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const openReviewDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setReviewData({
      status: "approved",
      points_awarded: submission.task?.points || 0,
      admin_feedback: "",
    });
    setIsReviewDialogOpen(true);
  };

  const handleReview = async () => {
    if (!selectedSubmission) return;

    try {
      const { error } = await supabase
        .from("ambassador_task_submissions")
        .update({
          status: reviewData.status,
          points_awarded: reviewData.status === "approved" ? reviewData.points_awarded : 0,
          admin_feedback: reviewData.admin_feedback,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedSubmission.id);

      if (error) throw error;

      // Update ambassador points if approved
      if (reviewData.status === "approved" && reviewData.points_awarded > 0) {
        const { data: existingPoints, error: fetchError } = await supabase
          .from("ambassador_points")
          .select("*")
          .eq("ambassador_id", selectedSubmission.ambassador_id)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

        if (existingPoints) {
          await supabase
            .from("ambassador_points")
            .update({
              total_points: existingPoints.total_points + reviewData.points_awarded,
              tasks_completed: existingPoints.tasks_completed + 1,
            })
            .eq("id", existingPoints.id);
        } else {
          // Get active cycle
          const { data: activeCycle } = await supabase
            .from("ambassador_program_cycles")
            .select("id")
            .eq("is_active", true)
            .single();

          await supabase.from("ambassador_points").insert({
            ambassador_id: selectedSubmission.ambassador_id,
            cycle_id: activeCycle?.id,
            total_points: reviewData.points_awarded,
            tasks_completed: 1,
          });
        }
      }

      toast.success(`Submission ${reviewData.status}`);
      setIsReviewDialogOpen(false);
      fetchSubmissions();
    } catch (error) {
      console.error("Error reviewing submission:", error);
      toast.error("Failed to review submission");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "revision_needed":
        return <Badge className="bg-yellow-500">Revision Needed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  if (loading) {
    return <div className="text-center py-8">Loading submissions...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Task Submissions
              {pendingCount > 0 && (
                <Badge variant="destructive">{pendingCount} pending</Badge>
              )}
            </CardTitle>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="revision_needed">Revision Needed</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No submissions found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ambassador</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Report</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="font-medium">{submission.ambassador?.full_name}</div>
                      <div className="text-xs text-muted-foreground">{submission.ambassador?.college}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{submission.task?.title}</div>
                      <div className="text-xs text-muted-foreground">{submission.task?.points} points</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium line-clamp-1">{submission.report_title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {submission.proof_images?.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Image className="h-3 w-3 mr-1" />
                            {submission.proof_images.length}
                          </Badge>
                        )}
                        {submission.proof_links?.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <LinkIcon className="h-3 w-3 mr-1" />
                            {submission.proof_links.length}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(submission.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReviewDialog(submission)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Ambassador</Label>
                    <p className="font-medium">{selectedSubmission.ambassador?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedSubmission.ambassador?.email}</p>
                    <p className="text-sm text-muted-foreground">{selectedSubmission.ambassador?.college}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Task</Label>
                    <p className="font-medium">{selectedSubmission.task?.title}</p>
                    <p className="text-sm text-muted-foreground">{selectedSubmission.task?.points} points</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Report Title</Label>
                  <p className="font-medium">{selectedSubmission.report_title}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Report Content</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap">
                    {selectedSubmission.report_content}
                  </div>
                </div>

                {selectedSubmission.proof_images?.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Proof Images</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {selectedSubmission.proof_images.map((img, idx) => (
                        <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                          <img
                            src={img}
                            alt={`Proof ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg hover:opacity-80 transition"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSubmission.proof_links?.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Proof Links</Label>
                    <div className="space-y-1 mt-2">
                      {selectedSubmission.proof_links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-primary hover:underline"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Decision</Label>
                      <Select
                        value={reviewData.status}
                        onValueChange={(value) => setReviewData({ ...reviewData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">Approve</SelectItem>
                          <SelectItem value="rejected">Reject</SelectItem>
                          <SelectItem value="revision_needed">Request Revision</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {reviewData.status === "approved" && (
                      <div>
                        <Label>Points to Award</Label>
                        <Input
                          type="number"
                          value={reviewData.points_awarded}
                          onChange={(e) => setReviewData({ ...reviewData, points_awarded: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Feedback for Ambassador</Label>
                    <Textarea
                      value={reviewData.admin_feedback}
                      onChange={(e) => setReviewData({ ...reviewData, admin_feedback: e.target.value })}
                      placeholder="Provide feedback..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleReview}>
                    Submit Review
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Play, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Trash2, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Flag,
  MessageSquare
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  is_approved: boolean;
  reported_count: number;
  user_id: string;
  created_at: string;
}

interface Report {
  id: string;
  reel_id: string;
  user_id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
}

export function ReelsModerationManager() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [reportedReels, setReportedReels] = useState<Reel[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReelReports, setSelectedReelReports] = useState<Report[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAllReels(), fetchReports()]);
    setLoading(false);
  };

  const fetchAllReels = async () => {
    const { data, error } = await supabase
      .from("reels")
      .select("*")
      .order("reported_count", { ascending: false });

    if (error) {
      console.error("Error fetching reels:", error);
    } else {
      setReels(data || []);
      setReportedReels((data || []).filter(r => r.reported_count > 0));
    }
  };

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("reel_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error);
    } else {
      setReports(data || []);
    }
  };

  const handleToggleVisibility = async (reelId: string, currentHidden: boolean) => {
    const { error } = await supabase
      .from("reels")
      .update({ is_hidden: !currentHidden })
      .eq("id", reelId);

    if (error) {
      toast({ title: "Error", description: "Failed to update reel", variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Reel ${!currentHidden ? "hidden" : "visible"} now` });
      fetchAllReels();
    }
  };

  const handleDeleteReel = async (reelId: string) => {
    const { error } = await supabase
      .from("reels")
      .delete()
      .eq("id", reelId);

    if (error) {
      toast({ title: "Error", description: "Failed to delete reel", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Reel deleted successfully" });
      fetchData();
    }
  };

  const handleDismissReports = async (reelId: string) => {
    const { error: updateError } = await supabase
      .from("reel_reports")
      .update({ status: "dismissed" })
      .eq("reel_id", reelId);

    if (updateError) {
      toast({ title: "Error", description: "Failed to dismiss reports", variant: "destructive" });
      return;
    }

    const { error: reelError } = await supabase
      .from("reels")
      .update({ reported_count: 0, is_hidden: false })
      .eq("id", reelId);

    if (reelError) {
      toast({ title: "Error", description: "Failed to update reel", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Reports dismissed, reel restored" });
      fetchData();
    }
  };

  const getReportsForReel = (reelId: string) => {
    return reports.filter(r => r.reel_id === reelId && r.status === "pending");
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

  const totalReels = reels.length;
  const hiddenReels = reels.filter(r => r.is_hidden).length;
  const pendingReports = reports.filter(r => r.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <Play className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{totalReels}</p>
            <p className="text-xs text-muted-foreground">Total Reels</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-orange-500 mb-1" />
            <p className="text-2xl font-bold">{reportedReels.length}</p>
            <p className="text-xs text-muted-foreground">Reported Reels</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <EyeOff className="h-5 w-5 mx-auto text-red-500 mb-1" />
            <p className="text-2xl font-bold">{hiddenReels}</p>
            <p className="text-xs text-muted-foreground">Hidden Reels</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <Flag className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
            <p className="text-2xl font-bold">{pendingReports}</p>
            <p className="text-xs text-muted-foreground">Pending Reports</p>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="reported" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reported">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Reported ({reportedReels.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            <Play className="h-4 w-4 mr-1" />
            All Reels ({totalReels})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reported">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Reported Reels
              </CardTitle>
              <CardDescription>Review and moderate flagged content</CardDescription>
            </CardHeader>
            <CardContent>
              {reportedReels.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-muted-foreground">No reported reels to review</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Reports</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportedReels.map((reel) => {
                      const reelReports = getReportsForReel(reel.id);
                      return (
                        <TableRow key={reel.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium truncate max-w-[200px]">{reel.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(reel.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getCategoryColor(reel.category)} text-white text-xs`}>
                              {reel.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedReelReports(reelReports)}
                                >
                                  <Flag className="h-4 w-4 mr-1 text-red-500" />
                                  {reel.reported_count}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Reports for "{reel.title}"</DialogTitle>
                                  <DialogDescription>
                                    Review all reports for this reel
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                  {reelReports.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">
                                      No pending reports
                                    </p>
                                  ) : (
                                    reelReports.map((report) => (
                                      <div key={report.id} className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                          <Badge variant="outline">{report.reason}</Badge>
                                          <span className="text-xs text-muted-foreground">
                                            {new Date(report.created_at).toLocaleString()}
                                          </span>
                                        </div>
                                        {report.description && (
                                          <p className="text-sm text-muted-foreground">
                                            <MessageSquare className="h-3 w-3 inline mr-1" />
                                            {report.description}
                                          </p>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                          <TableCell>
                            {reel.is_hidden ? (
                              <Badge variant="destructive">Hidden</Badge>
                            ) : (
                              <Badge variant="secondary">Visible</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(reel.video_url, "_blank")}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleVisibility(reel.id, reel.is_hidden)}
                              >
                                {reel.is_hidden ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <EyeOff className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600"
                                onClick={() => handleDismissReports(reel.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
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
                                      This will permanently delete this reel and all associated data.
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
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Reels</CardTitle>
              <CardDescription>Manage all platform reels</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reels.map((reel) => (
                    <TableRow key={reel.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium truncate max-w-[200px]">{reel.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(reel.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getCategoryColor(reel.category)} text-white text-xs`}>
                          {reel.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{reel.likes_count}</TableCell>
                      <TableCell>{reel.views_count}</TableCell>
                      <TableCell>
                        {reel.is_hidden ? (
                          <Badge variant="destructive">Hidden</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-500">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(reel.video_url, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleVisibility(reel.id, reel.is_hidden)}
                          >
                            {reel.is_hidden ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
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
                                  This will permanently delete this reel.
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

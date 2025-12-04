import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Search, 
  Download, 
  Mail, 
  School, 
  Calendar,
  Phone,
  ExternalLink,
  Loader2,
  FileSpreadsheet
} from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string | null;
  college: string | null;
  graduation_year: number | null;
  skills: string[] | null;
  linkedin_url: string | null;
  github_url: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  is_public: boolean | null;
  email?: string;
}

export function UserManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("student_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(query) ||
      user.college?.toLowerCase().includes(query) ||
      user.phone?.includes(query)
    );
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const exportToExcel = () => {
    setExporting(true);
    try {
      // Create CSV content
      const headers = ["Name", "College", "Graduation Year", "Phone", "Skills", "LinkedIn", "GitHub", "Joined Date"];
      const rows = filteredUsers.map(user => [
        user.full_name,
        user.college || "N/A",
        user.graduation_year?.toString() || "N/A",
        user.phone || "N/A",
        user.skills?.join(", ") || "N/A",
        user.linkedin_url || "N/A",
        user.github_url || "N/A",
        new Date(user.created_at).toLocaleDateString(),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `AITD_Users_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `Exported ${filteredUsers.length} users to CSV`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export user data",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Registered Users ({users.length})
              </CardTitle>
              <CardDescription>View and manage all registered users</CardDescription>
            </div>
            <Button onClick={exportToExcel} disabled={exporting} variant="outline">
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 mr-2" />
              )}
              Export to Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, college, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold text-primary">{users.length}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold text-green-500">
                {users.filter(u => new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-500">
                {users.filter(u => u.college).length}
              </p>
              <p className="text-xs text-muted-foreground">With College</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-500">
                {users.filter(u => u.phone).length}
              </p>
              <p className="text-xs text-muted-foreground">With Phone</p>
            </Card>
          </div>

          {/* Users Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar_url || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.full_name}</p>
                            {user.is_public && (
                              <Badge variant="outline" className="text-xs">Public</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <School className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate max-w-[150px]">{user.college || "—"}</span>
                        </div>
                        {user.graduation_year && (
                          <span className="text-xs text-muted-foreground">Class of {user.graduation_year}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.phone ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {user.phone}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap max-w-[200px]">
                          {user.skills?.slice(0, 2).map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                          {user.skills && user.skills.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{user.skills.length - 2}</Badge>
                          )}
                          {!user.skills?.length && <span className="text-muted-foreground">—</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.linkedin_url && (
                            <Button size="icon" variant="ghost" asChild className="h-8 w-8">
                              <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
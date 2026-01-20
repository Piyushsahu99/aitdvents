import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Search, Download, UserCheck, User } from "lucide-react";

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  college: string | null;
  role: string;
  designation: string | null;
  status: string;
  created_at: string;
}

interface AmbassadorWithTeam {
  id: string;
  full_name: string;
  email: string;
  college: string;
  status: string;
  team_members: TeamMember[];
}

export function AmbassadorTeamOverview() {
  const [ambassadors, setAmbassadors] = useState<AmbassadorWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    fetchAmbassadorsWithTeams();
  }, []);

  const fetchAmbassadorsWithTeams = async () => {
    try {
      // Fetch approved ambassadors
      const { data: ambassadorsData, error: ambassadorsError } = await supabase
        .from("campus_ambassadors")
        .select("id, full_name, email, college, status")
        .eq("status", "approved")
        .order("full_name");

      if (ambassadorsError) throw ambassadorsError;

      // Fetch all team members
      const { data: teamData, error: teamError } = await supabase
        .from("ambassador_team_members")
        .select("*")
        .order("role", { ascending: true });

      if (teamError) throw teamError;

      // Group team members by ambassador
      const ambassadorsWithTeams = (ambassadorsData || []).map((ambassador) => ({
        ...ambassador,
        team_members: (teamData || []).filter((tm) => tm.ambassador_id === ambassador.id),
      }));

      setAmbassadors(ambassadorsWithTeams);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch ambassador teams");
    } finally {
      setLoading(false);
    }
  };

  const updateMemberStatus = async (memberId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("ambassador_team_members")
        .update({ 
          status: newStatus, 
          joined_at: newStatus === "active" ? new Date().toISOString() : null 
        })
        .eq("id", memberId);

      if (error) throw error;
      toast.success("Member status updated");
      fetchAmbassadorsWithTeams();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update member status");
    }
  };

  const exportTeamData = () => {
    let csv = "Ambassador,Ambassador Email,College,Member Name,Member Email,Phone,Role,Designation,Status\n";
    
    ambassadors.forEach((amb) => {
      if (amb.team_members.length === 0) {
        csv += `"${amb.full_name}","${amb.email}","${amb.college}","No team members","","","","",""\n`;
      } else {
        amb.team_members.forEach((tm) => {
          csv += `"${amb.full_name}","${amb.email}","${amb.college}","${tm.full_name}","${tm.email}","${tm.phone || ""}","${tm.role}","${tm.designation || ""}","${tm.status}"\n`;
        });
      }
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ambassador-teams-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Team data exported");
  };

  const filteredAmbassadors = ambassadors.filter((amb) => {
    const matchesSearch = 
      amb.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      amb.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      amb.team_members.some((tm) => tm.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (roleFilter === "all") return matchesSearch;
    return matchesSearch && amb.team_members.some((tm) => tm.role === roleFilter);
  });

  const totalCoreTeam = ambassadors.reduce(
    (sum, amb) => sum + amb.team_members.filter((tm) => tm.role === "core_team").length,
    0
  );
  const totalVolunteers = ambassadors.reduce(
    (sum, amb) => sum + amb.team_members.filter((tm) => tm.role === "volunteer").length,
    0
  );

  const getRoleBadge = (role: string) => {
    return role === "core_team" ? (
      <Badge className="bg-purple-500">Core Team</Badge>
    ) : (
      <Badge variant="secondary">Volunteer</Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading teams...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{ambassadors.length}</p>
                <p className="text-sm text-muted-foreground">Active Ambassadors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <UserCheck className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{totalCoreTeam}</p>
                <p className="text-sm text-muted-foreground">Core Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <User className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalVolunteers}</p>
                <p className="text-sm text-muted-foreground">Volunteers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{totalCoreTeam + totalVolunteers}</p>
                <p className="text-sm text-muted-foreground">Total Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ambassador Teams Overview
          </CardTitle>
          <Button variant="outline" onClick={exportTeamData}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ambassadors or team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="core_team">Core Team</SelectItem>
                <SelectItem value="volunteer">Volunteers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredAmbassadors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No ambassadors or teams found.
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {filteredAmbassadors.map((ambassador) => (
                <AccordionItem key={ambassador.id} value={ambassador.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="text-left">
                        <p className="font-medium">{ambassador.full_name}</p>
                        <p className="text-sm text-muted-foreground">{ambassador.college}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {ambassador.team_members.filter((tm) => tm.role === "core_team").length} core
                        </Badge>
                        <Badge variant="outline">
                          {ambassador.team_members.filter((tm) => tm.role === "volunteer").length} volunteers
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {ambassador.team_members.length === 0 ? (
                      <p className="text-muted-foreground py-4 text-center">
                        No team members registered yet
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ambassador.team_members.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell className="font-medium">{member.full_name}</TableCell>
                              <TableCell>{member.email}</TableCell>
                              <TableCell>{getRoleBadge(member.role)}</TableCell>
                              <TableCell>{member.designation || "-"}</TableCell>
                              <TableCell>{getStatusBadge(member.status)}</TableCell>
                              <TableCell>
                                <Select
                                  value={member.status}
                                  onValueChange={(value) => updateMemberStatus(member.id, value)}
                                >
                                  <SelectTrigger className="w-28 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trophy, Medal, Award, Download, RefreshCw, TrendingUp } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  ambassador_id: string;
  total_points: number;
  tasks_completed: number;
  team_size: number;
  rank: number | null;
  ambassador?: {
    full_name: string;
    email: string;
    college: string;
  };
}

interface Cycle {
  id: string;
  name: string;
  is_active: boolean;
}

export function AmbassadorLeaderboardAdmin() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCycles();
  }, []);

  useEffect(() => {
    if (selectedCycle) {
      fetchLeaderboard();
    }
  }, [selectedCycle]);

  const fetchCycles = async () => {
    try {
      const { data, error } = await supabase
        .from("ambassador_program_cycles")
        .select("id, name, is_active")
        .order("start_date", { ascending: false });

      if (error) throw error;
      setCycles(data || []);

      // Select active cycle by default
      const activeCycle = data?.find((c) => c.is_active);
      if (activeCycle) {
        setSelectedCycle(activeCycle.id);
      } else if (data && data.length > 0) {
        setSelectedCycle(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching cycles:", error);
      toast.error("Failed to fetch cycles");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("ambassador_points")
        .select(`
          *,
          ambassador:campus_ambassadors(full_name, email, college)
        `)
        .eq("cycle_id", selectedCycle)
        .order("total_points", { ascending: false });

      if (error) throw error;

      // Add ranks
      const rankedData = (data || []).map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

      setLeaderboard(rankedData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Failed to fetch leaderboard");
    } finally {
      setRefreshing(false);
    }
  };

  const recalculateRanks = async () => {
    setRefreshing(true);
    try {
      // Update ranks in database
      for (let i = 0; i < leaderboard.length; i++) {
        await supabase
          .from("ambassador_points")
          .update({ rank: i + 1 })
          .eq("id", leaderboard[i].id);
      }

      toast.success("Ranks recalculated successfully");
      fetchLeaderboard();
    } catch (error) {
      console.error("Error recalculating ranks:", error);
      toast.error("Failed to recalculate ranks");
    }
  };

  const exportLeaderboard = () => {
    let csv = "Rank,Name,Email,College,Points,Tasks Completed,Team Size\n";
    
    leaderboard.forEach((entry) => {
      csv += `${entry.rank},"${entry.ambassador?.full_name || ""}","${entry.ambassador?.email || ""}","${entry.ambassador?.college || ""}",${entry.total_points},${entry.tasks_completed},${entry.team_size}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ambassador-leaderboard-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Leaderboard exported");
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-medium">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500">🥇 Gold</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400">🥈 Silver</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600">🥉 Bronze</Badge>;
    if (rank <= 5) return <Badge variant="default">Top 5</Badge>;
    if (rank <= 10) return <Badge variant="secondary">Top 10</Badge>;
    return null;
  };

  if (loading) {
    return <div className="text-center py-8">Loading leaderboard...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Ambassador Leaderboard
        </CardTitle>
        <div className="flex gap-2 flex-wrap">
          <Select value={selectedCycle} onValueChange={setSelectedCycle}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select cycle" />
            </SelectTrigger>
            <SelectContent>
              {cycles.map((cycle) => (
                <SelectItem key={cycle.id} value={cycle.id}>
                  {cycle.name} {cycle.is_active && "(Active)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchLeaderboard} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={recalculateRanks} disabled={refreshing}>
            Recalculate Ranks
          </Button>
          <Button variant="outline" onClick={exportLeaderboard}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No ambassadors have earned points yet in this cycle.
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {leaderboard.slice(0, 3).map((entry, index) => {
                const positions = [1, 0, 2]; // Silver, Gold, Bronze order for podium
                const actualEntry = leaderboard[positions[index]];
                if (!actualEntry) return null;
                
                const heights = ["h-24", "h-32", "h-20"];
                const bgColors = ["bg-gray-200", "bg-yellow-100", "bg-amber-100"];
                
                return (
                  <div
                    key={actualEntry.id}
                    className={`flex flex-col items-center justify-end ${heights[index]} ${bgColors[index]} rounded-lg p-4`}
                  >
                    <Avatar className="h-12 w-12 mb-2">
                      <AvatarFallback className="text-lg">
                        {actualEntry.ambassador?.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="font-semibold text-sm line-clamp-1">{actualEntry.ambassador?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{actualEntry.total_points} pts</p>
                    </div>
                    <div className="mt-2">{getRankIcon(positions[index] + 1)}</div>
                  </div>
                );
              })}
            </div>

            {/* Full Leaderboard Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Ambassador</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead className="text-center">Points</TableHead>
                  <TableHead className="text-center">Tasks</TableHead>
                  <TableHead className="text-center">Team</TableHead>
                  <TableHead>Badge</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => (
                  <TableRow key={entry.id} className={entry.rank && entry.rank <= 3 ? "bg-muted/30" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center justify-center">
                        {entry.rank && getRankIcon(entry.rank)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {entry.ambassador?.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{entry.ambassador?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{entry.ambassador?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{entry.ambassador?.college}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-bold">
                        {entry.total_points}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{entry.tasks_completed}</TableCell>
                    <TableCell className="text-center">{entry.team_size}</TableCell>
                    <TableCell>{entry.rank && getRankBadge(entry.rank)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}

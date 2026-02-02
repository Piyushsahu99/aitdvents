import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Activity, User, Clock, Filter, Search, Calendar, FileText, CheckCircle, XCircle, Edit, Plus, Trash2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface ActivityLog {
  id: string;
  user_id: string | null;
  action_type: string;
  action_description: string | null;
  entity_type: string | null;
  entity_id: string | null;
  metadata: any;
  created_at: string;
}

const ACTION_ICONS: Record<string, any> = {
  task_created: Plus,
  task_updated: Edit,
  task_completed: CheckCircle,
  task_cancelled: XCircle,
  task_assigned: User,
  user_login: User,
  user_register: User,
  content_created: FileText,
  content_updated: Edit,
  content_deleted: Trash2,
};

const ACTION_COLORS: Record<string, string> = {
  task_created: "bg-primary/10 text-primary",
  task_completed: "bg-success/10 text-success",
  task_cancelled: "bg-destructive/10 text-destructive",
  user_login: "bg-info/10 text-info",
  content_created: "bg-accent/10 text-accent",
  default: "bg-muted text-muted-foreground",
};

export function ActivityLogViewer() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [users, setUsers] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchLogs();
    fetchUsers();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("student_profiles").select("user_id, full_name");
    if (data) {
      const userMap: Record<string, string> = {};
      data.forEach(u => {
        userMap[u.user_id] = u.full_name || "Unknown";
      });
      setUsers(userMap);
    }
  };

  const getActionIcon = (actionType: string) => {
    const Icon = ACTION_ICONS[actionType] || Activity;
    return Icon;
  };

  const getActionColor = (actionType: string) => {
    return ACTION_COLORS[actionType] || ACTION_COLORS.default;
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return "System";
    return users[userId] || "Unknown User";
  };

  const filteredLogs = logs.filter(log => {
    if (filterType !== "all" && log.action_type !== filterType) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        log.action_description?.toLowerCase().includes(searchLower) ||
        log.action_type.toLowerCase().includes(searchLower) ||
        log.entity_type?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const actionTypes = [...new Set(logs.map(l => l.action_type))];

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading activity...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Activity Log
        </CardTitle>
        <CardDescription>Track all platform activities and changes</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {actionTypes.map(type => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Activity List */}
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No activity logs found</p>
                <p className="text-sm">Activities will appear here as they happen</p>
              </div>
            ) : (
              filteredLogs.map(log => {
                const Icon = getActionIcon(log.action_type);
                return (
                  <div key={log.id} className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className={`p-2 rounded-lg h-fit ${getActionColor(log.action_type)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium line-clamp-2">
                            {log.action_description || log.action_type.replace(/_/g, " ")}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{getUserName(log.user_id)}</span>
                            {log.entity_type && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {log.entity_type}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70">
                            {format(new Date(log.created_at), "MMM dd, HH:mm")}
                          </p>
                        </div>
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-2 p-2 rounded bg-background/50 text-xs">
                          <pre className="text-muted-foreground overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Stats Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t text-sm text-muted-foreground">
          <span>Showing {filteredLogs.length} of {logs.length} activities</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Last 100 entries
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

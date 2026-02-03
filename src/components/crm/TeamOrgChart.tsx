import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Users, ChevronDown, ChevronRight, Building, Mail, Phone } from "lucide-react";

interface TeamMember {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  role_title: string | null;
  department: string | null;
  status: string;
  reporting_to: string | null;
  avatar_url: string | null;
}

interface OrgNode extends TeamMember {
  children: OrgNode[];
  expanded: boolean;
}

export function TeamOrgChart() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [orgTree, setOrgTree] = useState<OrgNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("status", "active")
        .order("full_name");

      if (error) throw error;

      // Also fetch avatar URLs from profiles if available
      const memberData = data || [];
      const userIds = memberData.filter(m => m.user_id).map(m => m.user_id);
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("student_profiles")
          .select("user_id, avatar_url")
          .in("user_id", userIds);

        const avatarMap = new Map(profiles?.map(p => [p.user_id, p.avatar_url]) || []);
        memberData.forEach(member => {
          if (member.user_id && avatarMap.has(member.user_id)) {
            member.avatar_url = avatarMap.get(member.user_id);
          }
        });
      }

      setMembers(memberData);
      buildOrgTree(memberData);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const buildOrgTree = (memberList: TeamMember[]) => {
    const memberMap = new Map<string, OrgNode>();
    
    // Create nodes for all members
    memberList.forEach(member => {
      memberMap.set(member.id, { ...member, children: [], expanded: true });
    });

    const rootNodes: OrgNode[] = [];

    // Build tree structure
    memberList.forEach(member => {
      const node = memberMap.get(member.id)!;
      if (member.reporting_to && memberMap.has(member.reporting_to)) {
        memberMap.get(member.reporting_to)!.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    // Expand all by default
    memberList.forEach(m => expandedNodes.add(m.id));
    setExpandedNodes(new Set(expandedNodes));
    setOrgTree(rootNodes);
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getDepartmentColor = (department: string | null) => {
    const colors: Record<string, string> = {
      "engineering": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      "marketing": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      "design": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      "operations": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      "content": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    };
    return colors[department?.toLowerCase() || ""] || "bg-muted text-muted-foreground";
  };

  const OrgNodeCard = ({ node, depth = 0 }: { node: OrgNode; depth?: number }) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    return (
      <div className="relative">
        {/* Connector line */}
        {depth > 0 && (
          <div className="absolute left-6 -top-4 w-px h-4 bg-border" />
        )}
        
        <Card className="relative hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              {/* Expand/Collapse button */}
              {hasChildren ? (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => toggleNode(node.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="w-6" />
              )}

              {/* Avatar */}
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={node.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-primary/10">
                  {getInitials(node.full_name)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{node.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {node.role_title || "Team Member"}
                </p>
              </div>

              {/* Department badge */}
              {node.department && (
                <Badge 
                  variant="secondary" 
                  className={`text-[10px] capitalize hidden sm:inline-flex ${getDepartmentColor(node.department)}`}
                >
                  {node.department}
                </Badge>
              )}

              {/* Contact icons */}
              <div className="hidden md:flex gap-1">
                {node.email && (
                  <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                    <a href={`mailto:${node.email}`}>
                      <Mail className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
                {node.phone && (
                  <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                    <a href={`tel:${node.phone}`}>
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-8 mt-2 space-y-2 border-l-2 border-border pl-4">
            {node.children.map(child => (
              <OrgNodeCard key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading org chart...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Organization Chart
        </CardTitle>
        <CardDescription>Team hierarchy and reporting structure</CardDescription>
      </CardHeader>
      <CardContent>
        {orgTree.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No team structure defined</p>
            <p className="text-sm">Set up reporting relationships in Team Management</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orgTree.map(node => (
              <OrgNodeCard key={node.id} node={node} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp, Users, GraduationCap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string;
  college: string | null;
  graduation_year: number | null;
  avatar_url: string | null;
  skills: string[] | null;
  created_at: string;
}

export default function Leaderboard() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground w-6 text-center">#{index + 1}</span>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="text-muted-foreground">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <p className="text-muted-foreground">Top students on the platform - Early adopters ranked first!</p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="all">
            <Users className="h-4 w-4 mr-2" />
            All Students
          </TabsTrigger>
          <TabsTrigger value="team">
            <TrendingUp className="h-4 w-4 mr-2" />
            Looking for Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {students.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No students yet. Be the first to join!</p>
              </CardContent>
            </Card>
          ) : (
            students.map((student, index) => (
              <Card
                key={student.id}
                className={`hover:shadow-lg transition-all ${
                  index < 3 ? "border-2 border-primary/20" : ""
                }`}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex-shrink-0 w-10 flex items-center justify-center">
                    {getRankIcon(index)}
                  </div>

                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={student.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                      {getInitials(student.full_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{student.full_name}</h3>
                      {index < 3 && (
                        <Badge variant="secondary" className="text-xs">
                          Early Adopter
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {student.college && (
                        <div className="flex items-center gap-1 truncate">
                          <GraduationCap className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{student.college}</span>
                        </div>
                      )}
                      {student.graduation_year && (
                        <span className="flex-shrink-0">Class of {student.graduation_year}</span>
                      )}
                    </div>
                  </div>

                  {student.skills && student.skills.length > 0 && (
                    <div className="hidden md:flex gap-2">
                      {student.skills.slice(0, 2).map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {student.skills.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{student.skills.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          {students.filter(s => (s as any).is_looking_for_team).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No students looking for a team right now</p>
              </CardContent>
            </Card>
          ) : (
            students
              .filter(s => (s as any).is_looking_for_team)
              .map((student, index) => (
                <Card key={student.id} className="hover:shadow-lg transition-all">
                  <CardContent className="flex items-center gap-4 p-6">
                    <Avatar className="h-12 w-12 border-2 border-accent/20">
                      <AvatarImage src={student.avatar_url || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-accent to-primary text-white font-bold">
                        {getInitials(student.full_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{student.full_name}</h3>
                        <Badge className="bg-success/10 text-success border-success/20 text-xs">
                          Looking for Team
                        </Badge>
                      </div>
                      {student.college && (
                        <p className="text-sm text-muted-foreground truncate">{student.college}</p>
                      )}
                    </div>

                    {student.skills && student.skills.length > 0 && (
                      <div className="hidden md:flex gap-2">
                        {student.skills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { BookOpen, Award, Clock, Loader2, GraduationCap } from "lucide-react";

interface EnrolledCourse {
  id: string;
  course_id: string;
  progress_percentage: number;
  completed_at: string | null;
  enrolled_at: string;
  courses: {
    id: string;
    title: string;
    description: string;
    instructor_name: string;
    category: string;
    thumbnail_url: string | null;
    total_lessons: number;
    duration: string;
  };
}

export default function MyCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    fetchEnrolledCourses(user.id);
  };

  const fetchEnrolledCourses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select(`
          *,
          courses (
            id,
            title,
            description,
            instructor_name,
            category,
            thumbnail_url,
            total_lessons,
            duration
          )
        `)
        .eq("user_id", userId)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;
      setEnrolledCourses(data || []);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const completedCourses = enrolledCourses.filter((e) => e.completed_at);
  const inProgressCourses = enrolledCourses.filter((e) => !e.completed_at);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <Badge className="mb-4">
            <GraduationCap className="w-4 h-4 mr-2" />
            My Learning
          </Badge>
          <h1 className="text-4xl font-bold mb-4">My Courses</h1>
          <p className="text-muted-foreground text-lg">
            Track your learning progress and continue where you left off
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {enrolledCourses.length}
                  </p>
                </div>
                <BookOpen className="w-12 h-12 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold text-green-600">
                    {inProgressCourses.length}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {completedCourses.length}
                  </p>
                </div>
                <Award className="w-12 h-12 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {enrolledCourses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No enrolled courses yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your learning journey by enrolling in a course
              </p>
              <Button onClick={() => navigate("/courses")}>
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* In Progress Courses */}
            {inProgressCourses.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Continue Learning</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inProgressCourses.map((enrollment) => (
                    <Card
                      key={enrollment.id}
                      className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden"
                      onClick={() => navigate(`/courses/${enrollment.course_id}`)}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={enrollment.courses.thumbnail_url || "/placeholder.svg"}
                          alt={enrollment.courses.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <CardHeader>
                        <Badge className="w-fit mb-2">{enrollment.courses.category}</Badge>
                        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                          {enrollment.courses.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          by {enrollment.courses.instructor_name}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-2 text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-semibold">
                                {enrollment.progress_percentage}%
                              </span>
                            </div>
                            <Progress value={enrollment.progress_percentage} className="h-2" />
                          </div>
                          <Button className="w-full">
                            Continue Course
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Courses */}
            {completedCourses.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Completed Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedCourses.map((enrollment) => (
                    <Card
                      key={enrollment.id}
                      className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden relative"
                      onClick={() => navigate(`/courses/${enrollment.course_id}`)}
                    >
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-green-500">
                          <Award className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={enrollment.courses.thumbnail_url || "/placeholder.svg"}
                          alt={enrollment.courses.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-90"
                        />
                      </div>
                      <CardHeader>
                        <Badge className="w-fit mb-2">{enrollment.courses.category}</Badge>
                        <CardTitle className="line-clamp-2">
                          {enrollment.courses.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          by {enrollment.courses.instructor_name}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          Review Course
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

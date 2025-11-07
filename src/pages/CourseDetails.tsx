import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Loader2,
  Award,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  instructor_bio: string | null;
  category: string;
  level: string;
  duration: string;
  thumbnail_url: string | null;
  enrolled_count: number;
  rating: number;
  total_lessons: number;
  is_free: boolean;
  price: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  order_index: number;
  is_free_preview: boolean;
}

interface Enrollment {
  id: string;
  progress_percentage: number;
  completed_at: string | null;
}

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchCourseDetails();
  }, [id]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      checkEnrollment(user.id);
    }
  };

  const fetchCourseDetails = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", id)
        .order("order_index", { ascending: true });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);
    } catch (error) {
      console.error("Error fetching course:", error);
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("course_id", id)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      setEnrollment(data);
    } catch (error) {
      console.error("Error checking enrollment:", error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setEnrolling(true);
    try {
      const { error } = await supabase
        .from("course_enrollments")
        .insert({
          course_id: id,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You've been enrolled in this course",
      });

      checkEnrollment(user.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to enroll in course",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLesson = (lessonId: string) => {
    if (!enrollment) {
      toast({
        title: "Enroll First",
        description: "Please enroll in the course to access lessons",
        variant: "destructive",
      });
      return;
    }
    navigate(`/courses/${id}/lessons/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Course not found</h2>
        <Button onClick={() => navigate("/courses")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/courses")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <Card className="overflow-hidden">
              <div className="relative h-64">
                <img
                  src={course.thumbnail_url || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  <Badge>{course.category}</Badge>
                  <Badge variant="outline">{course.level}</Badge>
                </div>
                <CardTitle className="text-3xl">{course.title}</CardTitle>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">{course.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.enrolled_count} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
              </CardContent>
            </Card>

            {/* Instructor */}
            <Card>
              <CardHeader>
                <CardTitle>Your Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-2">{course.instructor_name}</h3>
                {course.instructor_bio && (
                  <p className="text-muted-foreground">{course.instructor_bio}</p>
                )}
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {lessons.length} lessons • {course.duration}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lessons.map((lesson, index) => {
                    const isLocked = !enrollment && !lesson.is_free_preview;
                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          isLocked ? "bg-muted/50" : "hover:bg-accent cursor-pointer"
                        }`}
                        onClick={() => !isLocked && handleStartLesson(lesson.id)}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-shrink-0">
                            {isLocked ? (
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            ) : enrollment ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Play className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {index + 1}. {lesson.title}
                            </p>
                            {lesson.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {lesson.is_free_preview && (
                            <Badge variant="outline" className="text-green-500">
                              Free
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {lesson.duration_minutes} min
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="sticky top-4">
              <CardContent className="pt-6">
                {enrollment ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Your Progress</span>
                      <span className="text-sm font-semibold">
                        {enrollment.progress_percentage}%
                      </span>
                    </div>
                    <Progress value={enrollment.progress_percentage} className="h-2" />
                    {enrollment.completed_at ? (
                      <div className="flex items-center gap-2 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <Award className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium text-green-500">
                          Course Completed!
                        </span>
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => handleStartLesson(lessons[0]?.id)}
                      >
                        Continue Learning
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      {course.is_free ? (
                        <p className="text-3xl font-bold text-green-500">Free</p>
                      ) : (
                        <p className="text-3xl font-bold">${course.price}</p>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        "Enroll Now"
                      )}
                    </Button>
                  </div>
                )}

                <div className="mt-6 space-y-3 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lessons</span>
                    <span className="font-semibold">{course.total_lessons}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="font-semibold">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Level</span>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

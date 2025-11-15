import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, BookOpen, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  progress: number;
  enrolled_at: string;
  teacher_name: string;
  completed_at: string | null;
}

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          id,
          progress,
          enrolled_at,
          completed_at,
          course_id,
          courses (
            id,
            title,
            description,
            thumbnail_url,
            teacher_id
          )
        `)
        .eq("student_id", user?.id);

      if (error) throw error;

      // Fetch teacher profiles separately
      const teacherIds = data?.map((e: any) => e.courses.teacher_id).filter(Boolean) || [];
      let teacherProfiles: any = {};
      
      if (teacherIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", teacherIds);
        
        teacherProfiles = profiles?.reduce((acc: any, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {}) || {};
      }

      const formattedCourses = data?.map((enrollment: any) => ({
        id: enrollment.courses.id,
        title: enrollment.courses.title,
        description: enrollment.courses.description || "No description available",
        thumbnail_url: enrollment.courses.thumbnail_url,
        progress: enrollment.progress || 0,
        enrolled_at: enrollment.enrolled_at,
        completed_at: enrollment.completed_at,
        teacher_name: teacherProfiles[enrollment.courses.teacher_id]?.full_name || "Unknown Teacher",
      })) || [];

      setCourses(formattedCourses);
    } catch (error: any) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading your courses...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Courses</h1>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
            <Button asChild>
              <Link to="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <Play size={48} className="text-muted-foreground" />
                )}
              </div>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  By {course.teacher_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Enrolled {new Date(course.enrolled_at).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-semibold">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                  {course.completed_at && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Award className="w-4 h-4" />
                      <span>Completed on {new Date(course.completed_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  <Button className="w-full">
                    <Play className="mr-2 h-4 w-4" />
                    {course.progress === 100 ? "Review Course" : "Continue Learning"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
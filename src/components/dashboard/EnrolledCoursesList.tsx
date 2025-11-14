import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  progress: number;
  enrollment_id: string;
}

export default function EnrolledCoursesList() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    try {
      const { data: enrollments, error } = await supabase
        .from("enrollments")
        .select(`
          id,
          progress,
          courses (
            id,
            title,
            description,
            thumbnail_url
          )
        `)
        .eq("student_id", user?.id);

      if (error) throw error;

      const formattedCourses = enrollments?.map((enrollment: any) => ({
        id: enrollment.courses.id,
        title: enrollment.courses.title,
        description: enrollment.courses.description,
        thumbnail_url: enrollment.courses.thumbnail_url,
        progress: enrollment.progress,
        enrollment_id: enrollment.id,
      })) || [];

      setCourses(formattedCourses);
    } catch (error: any) {
      toast.error("Failed to load enrolled courses");
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="text-primary" />
            My Enrolled Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading courses...</div>
        </CardContent>
      </Card>
    );
  }

  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="text-primary" />
            My Enrolled Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
            <Link to="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="text-primary" />
          My Enrolled Courses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center gap-4 p-4 bg-secondary/20 rounded-lg"
            >
              {course.thumbnail_url && (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {course.description}
                </p>
                <div className="flex items-center gap-2">
                  <Progress value={course.progress} className="flex-1" />
                  <span className="text-sm font-medium">{course.progress}%</span>
                </div>
              </div>
              <Link to={`/courses/${course.id}`}>
                <Button size="sm">
                  <Play className="mr-2 h-4 w-4" />
                  Continue
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  progress: number;
  thumbnail_url: string | null;
  teacher_name: string;
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
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          id,
          progress,
          test_progress_bonus,
          courses (
            id,
            title,
            description,
            thumbnail_url,
            teacher_id
          )
        `)
        .eq("student_id", user?.id)
        .limit(3);

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

      const formattedCourses = data?.map((enrollment: any) => {
        const rawProgress = enrollment.progress || 0;
        const bonus = enrollment.test_progress_bonus || 0;
        const combinedProgress = Math.min(rawProgress + bonus, 100);

        return {
          id: enrollment.courses.id,
          title: enrollment.courses.title,
          description: enrollment.courses.description || "No description available",
          progress: combinedProgress,
          thumbnail_url: enrollment.courses.thumbnail_url,
          teacher_name: teacherProfiles[enrollment.courses.teacher_id]?.full_name || "Unknown Teacher",
        };
      }) || [];

      setCourses(formattedCourses);
    } catch (error: any) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Card><CardContent className="py-6">Loading...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          My Enrolled Courses
        </CardTitle>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            You haven't enrolled in any courses yet.
          </p>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">By {course.teacher_name}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-1" />
                    Continue
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
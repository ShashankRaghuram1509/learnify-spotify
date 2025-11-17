import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Edit, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  description: string;
  student_count: number;
  price: number;
  is_premium: boolean;
}

export default function ContentManager() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyCourses();
    }
  }, [user]);

  const fetchMyCourses = async () => {
    try {
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("teacher_id", user?.id)
        .limit(5);

      if (coursesError) throw coursesError;

      const coursesWithCounts = await Promise.all(
        (coursesData || []).map(async (course) => {
          const { count } = await supabase
            .from("enrollments")
            .select("id", { count: "exact", head: true })
            .eq("course_id", course.id);

          return {
            id: course.id,
            title: course.title,
            description: course.description || "No description",
            student_count: count || 0,
            price: course.price || 0,
            is_premium: course.is_premium || false,
          };
        })
      );

      setCourses(coursesWithCounts);
    } catch (error: any) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const { error } = await supabase.from("courses").delete().eq("id", courseId);
      if (error) throw error;

      toast.success("Course deleted successfully!");
      fetchMyCourses();
    } catch (error: any) {
      toast.error("Failed to delete course");
    }
  };

  if (loading) {
    return <Card><CardContent className="py-6">Loading...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>My Courses</CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Course
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            You haven't created any courses yet.
          </p>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Users className="h-3 w-3" />
                      {course.student_count} students
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
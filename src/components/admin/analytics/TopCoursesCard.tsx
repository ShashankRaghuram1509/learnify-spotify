import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { BookOpen, Users } from "lucide-react";

interface CourseStats {
  id: string;
  title: string;
  enrollments: number;
  completionRate: number;
}

export default function TopCoursesCard() {
  const [courses, setCourses] = useState<CourseStats[]>([]);

  useEffect(() => {
    fetchTopCourses();
  }, []);

  const fetchTopCourses = async () => {
    const { data: enrollmentData } = await supabase
      .from('enrollments')
      .select('course_id, progress, courses(title)');

    if (!enrollmentData) return;

    const courseMap = new Map<string, { title: string; enrollments: number; completed: number }>();

    enrollmentData.forEach((enrollment: any) => {
      const courseId = enrollment.course_id;
      const courseTitle = enrollment.courses?.title || 'Unknown';
      
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, { title: courseTitle, enrollments: 0, completed: 0 });
      }
      
      const course = courseMap.get(courseId)!;
      course.enrollments++;
      if (enrollment.progress === 100) {
        course.completed++;
      }
    });

    const topCourses: CourseStats[] = Array.from(courseMap.entries())
      .map(([id, data]) => ({
        id,
        title: data.title,
        enrollments: data.enrollments,
        completionRate: data.enrollments > 0 ? (data.completed / data.enrollments) * 100 : 0
      }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    setCourses(topCourses);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Courses</CardTitle>
        <CardDescription>Most popular courses by enrollment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course, index) => (
            <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{course.title}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.enrollments} students
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {course.completionRate.toFixed(0)}% completion
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No course data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function StudentTeacherMonitoring() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch teachers with their courses
    const { data: teacherRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'teacher');

    if (teacherRoles) {
      const teacherIds = teacherRoles.map(r => r.user_id);
      const { data: teacherProfiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', teacherIds);

      const teachersWithCourses = await Promise.all(
        (teacherProfiles || []).map(async (teacher) => {
          const { data: courses, count: courseCount } = await supabase
            .from('courses')
            .select('*, enrollments(count)', { count: 'exact' })
            .eq('teacher_id', teacher.id);

          return {
            ...teacher,
            courses: courses || [],
            totalCourses: courseCount || 0,
            totalStudents: courses?.reduce((sum, c) => sum + (c.enrollments?.[0]?.count || 0), 0) || 0
          };
        })
      );

      setTeachers(teachersWithCourses);
    }

    // Fetch students with their enrollments
    const { data: studentRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'student');

    if (studentRoles) {
      const studentIds = studentRoles.map(r => r.user_id);
      const { data: studentProfiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', studentIds);

      const studentsWithData = await Promise.all(
        (studentProfiles || []).map(async (student) => {
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select('*, courses(title)')
            .eq('student_id', student.id);

          const avgProgress = enrollments?.reduce((sum, e) => sum + (e.progress || 0), 0) / (enrollments?.length || 1) || 0;

          return {
            ...student,
            enrollments: enrollments || [],
            totalCourses: enrollments?.length || 0,
            avgProgress
          };
        })
      );

      setStudents(studentsWithData);
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Tabs defaultValue="teachers" className="space-y-4">
      <TabsList>
        <TabsTrigger value="teachers">Teachers ({teachers.length})</TabsTrigger>
        <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="teachers" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <Card key={teacher.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={teacher.avatar_url} />
                    <AvatarFallback>{teacher.full_name?.[0] || 'T'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{teacher.full_name}</CardTitle>
                    <CardDescription>{teacher.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Courses</span>
                  <Badge variant="secondary">{teacher.totalCourses}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Students</span>
                  <Badge variant="secondary">{teacher.totalStudents}</Badge>
                </div>
                {teacher.courses.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs font-medium">Recent Courses:</p>
                    {teacher.courses.slice(0, 3).map((course: any) => (
                      <div key={course.id} className="text-xs text-muted-foreground">
                        • {course.title}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="students" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <Card key={student.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={student.avatar_url} />
                    <AvatarFallback>{student.full_name?.[0] || 'S'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{student.full_name}</CardTitle>
                    <CardDescription>{student.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Enrolled Courses</span>
                  <Badge variant="secondary">{student.totalCourses}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Progress</span>
                    <span className="font-medium">{Math.round(student.avgProgress)}%</span>
                  </div>
                  <Progress value={student.avgProgress} className="h-2" />
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Subscription</span>
                  <Badge variant={student.subscription_tier === 'pro' ? 'default' : 'outline'}>
                    {student.subscription_tier || 'free'}
                  </Badge>
                </div>
                {student.enrollments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs font-medium">Enrolled In:</p>
                    {student.enrollments.slice(0, 3).map((enrollment: any) => (
                      <div key={enrollment.id} className="text-xs text-muted-foreground">
                        • {enrollment.courses?.title}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}

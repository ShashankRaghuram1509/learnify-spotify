import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Award, TrendingUp, AlertTriangle, User } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StudentData {
  id: string;
  full_name: string;
  email: string;
  enrollmentData: {
    courseTitle: string;
    progress: number;
    videoMinutesWatched: number;
    testProgressBonus: number;
  }[];
  testAttempts: {
    total: number;
    passed: number;
    failed: number;
  };
  violations: {
    count: number;
    blockedUntil: string | null;
  };
}

export default function StudentPerformanceAnalytics() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStudentData();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('teacher-analytics-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enrollments',
        },
        () => fetchStudentData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_test_attempts',
        },
        () => fetchStudentData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignment_submissions',
        },
        () => fetchStudentData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchStudentData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get teacher's courses
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title")
        .eq("teacher_id", user.id);

      if (!courses || courses.length === 0) {
        setStudents([]);
        return;
      }

      const courseIds = courses.map(c => c.id);

      // Get enrollments for teacher's courses
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("*")
        .in("course_id", courseIds);

      if (!enrollments || enrollments.length === 0) {
        setStudents([]);
        return;
      }

      // Get unique student IDs
      const studentIds = [...new Set(enrollments.map(e => e.student_id))];

      // Fetch profiles for these students
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", studentIds);

      // Fetch courses data
      const { data: coursesData } = await supabase
        .from("courses")
        .select("id, title")
        .in("id", courseIds);

      // Group by student
      const studentMap = new Map<string, StudentData>();

      for (const enrollment of enrollments) {
        const studentId = enrollment.student_id;
        const profile = profiles?.find(p => p.id === studentId);
        const course = coursesData?.find(c => c.id === enrollment.course_id);

        if (!profile) continue;

        if (!studentMap.has(studentId)) {
          // Fetch test attempts for this student
          const { data: attempts } = await supabase
            .from("student_test_attempts")
            .select("*")
            .eq("student_id", studentId);

          // Fetch violations for this student
          const { data: violations } = await supabase
            .from("proctoring_violations")
            .select("*")
            .eq("student_id", studentId);

          const totalAttempts = attempts?.length || 0;
          const passedAttempts = attempts?.filter(a => a.passed)?.length || 0;
          const failedAttempts = totalAttempts - passedAttempts;

          const totalViolations = violations?.reduce((sum, v) => sum + (v.violation_count || 0), 0) || 0;
          const blockedViolation = violations?.find(v => v.blocked_until && new Date(v.blocked_until) > new Date());

          studentMap.set(studentId, {
            id: studentId,
            full_name: profile.full_name || "Unknown",
            email: profile.email || "",
            enrollmentData: [],
            testAttempts: {
              total: totalAttempts,
              passed: passedAttempts,
              failed: failedAttempts,
            },
            violations: {
              count: totalViolations,
              blockedUntil: blockedViolation?.blocked_until || null,
            },
          });
        }

        const student = studentMap.get(studentId)!;
        student.enrollmentData.push({
          courseTitle: course?.title || "Unknown Course",
          progress: enrollment.progress || 0,
          videoMinutesWatched: enrollment.video_minutes_watched || 0,
          testProgressBonus: enrollment.test_progress_bonus || 0,
        });
      }

      const studentsArray = Array.from(studentMap.values());
      setStudents(studentsArray);

      if (studentsArray.length > 0 && !selectedStudent) {
        setSelectedStudent(studentsArray[0].id);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading student analytics...</div>;
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No student data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const currentStudent = students.find(s => s.id === selectedStudent);

  if (!currentStudent) return null;

  const totalVideoMinutes = currentStudent.enrollmentData.reduce((sum, e) => sum + e.videoMinutesWatched, 0);
  const averageProgress = currentStudent.enrollmentData.length > 0
    ? Math.round(currentStudent.enrollmentData.reduce((sum, e) => sum + e.progress, 0) / currentStudent.enrollmentData.length)
    : 0;
  const totalTestBonus = currentStudent.enrollmentData.reduce((sum, e) => sum + e.testProgressBonus, 0);
  const testSuccessRate = currentStudent.testAttempts.total > 0
    ? Math.round((currentStudent.testAttempts.passed / currentStudent.testAttempts.total) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Student Performance Analytics</span>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <User className="h-4 w-4" />
            {currentStudent.email}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProgress}%</div>
            <p className="text-xs text-muted-foreground">
              across {currentStudent.enrollmentData.length} courses
            </p>
            <Progress value={averageProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVideoMinutes}</div>
            <p className="text-xs text-muted-foreground">minutes watched</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Success Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">
              {currentStudent.testAttempts.passed} / {currentStudent.testAttempts.total} passed
            </p>
            <Progress value={testSuccessRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress Bonus</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalTestBonus}%</div>
            <p className="text-xs text-muted-foreground">from test achievements</p>
          </CardContent>
        </Card>
      </div>

      {currentStudent.violations.blockedUntil && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Student Test Access Suspended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              This student is temporarily blocked from taking tests due to proctoring violations.
            </p>
            <p className="text-sm font-medium mt-2">
              Access restores: {new Date(currentStudent.violations.blockedUntil).toLocaleDateString()}
            </p>
            <Badge variant="destructive" className="mt-2">
              {currentStudent.violations.count} Total Violations
            </Badge>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Course-wise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentStudent.enrollmentData.map((enrollment, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{enrollment.courseTitle}</span>
                  <Badge variant="outline">{enrollment.progress}%</Badge>
                </div>
                <Progress value={enrollment.progress} />
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Video: {enrollment.videoMinutesWatched} min</span>
                  <span>Test Bonus: +{enrollment.testProgressBonus}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

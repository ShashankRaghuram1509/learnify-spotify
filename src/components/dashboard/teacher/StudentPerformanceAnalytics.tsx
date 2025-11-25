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
import { Clock, Award, TrendingUp, AlertTriangle, User, DollarSign } from "lucide-react";
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
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [completedPayments, setCompletedPayments] = useState(0);

  useEffect(() => {
    if (user) {
      fetchStudentData();
      fetchRevenueData();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchRevenueData = async () => {
    if (!user) return;

    try {
      // Get teacher's courses with prices
      const { data: courses } = await supabase
        .from("courses")
        .select("id, price")
        .eq("teacher_id", user.id);

      if (!courses || courses.length === 0) {
        setTotalRevenue(0);
        setCompletedPayments(0);
        return;
      }

      const courseIds = courses.map((c) => c.id);

      // Get enrollments for teacher's courses
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .in("course_id", courseIds);

      if (!enrollments || enrollments.length === 0) {
        setTotalRevenue(0);
        setCompletedPayments(0);
        return;
      }

      // Map course prices
      const priceMap = new Map<string, number>();
      courses.forEach((course) => {
        priceMap.set(course.id, Number(course.price) || 0);
      });

      // Total revenue is sum of course price per enrollment
      const revenue = enrollments.reduce((sum, enrollment) => {
        const coursePrice = priceMap.get(enrollment.course_id) ?? 0;
        return sum + coursePrice;
      }, 0);

      setTotalRevenue(revenue);
      setCompletedPayments(enrollments.length);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    }
  };

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
        () => {
          console.log('Enrollment updated in teacher view, refetching...');
          fetchStudentData();
          fetchRevenueData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_test_attempts',
        },
        () => {
          console.log('Test attempt updated in teacher view, refetching...');
          fetchStudentData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignment_submissions',
        },
        () => {
          console.log('Assignment submission updated in teacher view, refetching...');
          fetchStudentData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        () => {
          console.log('Payment updated, refetching revenue...');
          fetchRevenueData();
        }
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

      // Get enrollments for teacher's courses with explicit fields
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("student_id, course_id, progress, video_minutes_watched, test_progress_bonus")
        .in("course_id", courseIds);
      
      console.log('Fetched enrollments with progress bonus:', enrollments?.map(e => ({
        student_id: e.student_id,
        bonus: e.test_progress_bonus
      })));

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
        setSelectedStudent("all");
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

  const currentStudent = selectedStudent === "all" ? null : students.find(s => s.id === selectedStudent);

  // Calculate aggregated data for "All Students" view
  const allStudentsData = {
    totalVideoMinutes: students.reduce((sum, s) => sum + s.enrollmentData.reduce((s2, e) => s2 + e.videoMinutesWatched, 0), 0),
    averageProgress: students.length > 0
      ? Math.round(
          students.reduce((sum, s) => {
            const studentAvg = s.enrollmentData.length > 0
              ? s.enrollmentData.reduce((s2, e) => s2 + e.progress, 0) / s.enrollmentData.length
              : 0;
            return sum + studentAvg;
          }, 0) / students.length
        )
      : 0,
    totalTestBonus: students.reduce((sum, s) => sum + s.enrollmentData.reduce((s2, e) => s2 + e.testProgressBonus, 0), 0),
    totalTestAttempts: students.reduce((sum, s) => sum + s.testAttempts.total, 0),
    passedTestAttempts: students.reduce((sum, s) => sum + s.testAttempts.passed, 0),
    totalViolations: students.reduce((sum, s) => sum + s.violations.count, 0),
  };

  const allStudentsTestSuccessRate = allStudentsData.totalTestAttempts > 0
    ? Math.round((allStudentsData.passedTestAttempts / allStudentsData.totalTestAttempts) * 100)
    : 0;

  // Course-wise aggregated data
  const courseWiseData = new Map<string, {
    title: string;
    totalProgress: number;
    studentCount: number;
    totalVideoMinutes: number;
    totalTestBonus: number;
  }>();

  students.forEach(student => {
    student.enrollmentData.forEach(enrollment => {
      if (!courseWiseData.has(enrollment.courseTitle)) {
        courseWiseData.set(enrollment.courseTitle, {
          title: enrollment.courseTitle,
          totalProgress: 0,
          studentCount: 0,
          totalVideoMinutes: 0,
          totalTestBonus: 0,
        });
      }
      const course = courseWiseData.get(enrollment.courseTitle)!;
      course.totalProgress += enrollment.progress;
      course.studentCount += 1;
      course.totalVideoMinutes += enrollment.videoMinutesWatched;
      course.totalTestBonus += enrollment.testProgressBonus;
    });
  });

  const courseWiseArray = Array.from(courseWiseData.values()).map(course => ({
    ...course,
    avgProgress: Math.round(course.totalProgress / course.studentCount),
  }));

  // Compute values for individual student
  const totalVideoMinutes = currentStudent
    ? currentStudent.enrollmentData.reduce((sum, e) => sum + e.videoMinutesWatched, 0)
    : 0;
  const averageProgress = currentStudent
    ? currentStudent.enrollmentData.length > 0
      ? Math.round(currentStudent.enrollmentData.reduce((sum, e) => sum + e.progress, 0) / currentStudent.enrollmentData.length)
      : 0
    : 0;
  const totalTestBonus = currentStudent
    ? currentStudent.enrollmentData.reduce((sum, e) => sum + e.testProgressBonus, 0)
    : 0;
  const testSuccessRate = currentStudent
    ? currentStudent.testAttempts.total > 0
      ? Math.round((currentStudent.testAttempts.passed / currentStudent.testAttempts.total) * 100)
      : 0
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              from {completedPayments} enrolled students
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <User className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              enrolled across your courses
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Student Performance Analytics</span>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        {currentStudent && (
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <User className="h-4 w-4" />
              {currentStudent.email}
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">
              {currentStudent ? averageProgress : allStudentsData.averageProgress}%
            </div>
            <p className="text-xs text-muted-foreground">
              {currentStudent
                ? `across ${currentStudent.enrollmentData.length} courses`
                : `average across ${students.length} students`}
            </p>
            <Progress
              value={currentStudent ? averageProgress : allStudentsData.averageProgress}
              className="mt-2 [&>div]:bg-cyan-500"
            />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {currentStudent ? totalVideoMinutes : allStudentsData.totalVideoMinutes}
            </div>
            <p className="text-xs text-muted-foreground">minutes watched</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Success Rate</CardTitle>
            <Award className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {currentStudent ? testSuccessRate : allStudentsTestSuccessRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {currentStudent
                ? `${currentStudent.testAttempts.passed} / ${currentStudent.testAttempts.total} passed`
                : `${allStudentsData.passedTestAttempts} / ${allStudentsData.totalTestAttempts} passed`}
            </p>
            <Progress
              value={currentStudent ? testSuccessRate : allStudentsTestSuccessRate}
              className="mt-2 [&>div]:bg-rose-500"
            />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress Bonus</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              +{currentStudent ? totalTestBonus : allStudentsData.totalTestBonus}%
            </div>
            <p className="text-xs text-muted-foreground">from test achievements</p>
          </CardContent>
        </Card>
      </div>

      {currentStudent && currentStudent.violations.blockedUntil && (
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

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Areas of Improvement {!currentStudent && "(All Students)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentStudent ? (
              <>
                {averageProgress < 30 && (
                  <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Low Course Progress</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Student is behind schedule. Consider scheduling a check-in call to address any blockers.
                      </p>
                    </div>
                  </div>
                )}
                
                {testSuccessRate < 60 && currentStudent.testAttempts.total > 0 && (
                  <div className="flex gap-3 p-3 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-800">
                    <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-rose-900 dark:text-rose-100">Low Test Success Rate</p>
                      <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                        Student is struggling with assessments. Recommend reviewing course materials and offering additional practice exercises.
                      </p>
                    </div>
                  </div>
                )}
                
                {totalVideoMinutes < 60 && currentStudent.enrollmentData.length > 0 && (
                  <div className="flex gap-3 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <Clock className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Limited Video Engagement</p>
                      <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                        Low video watch time indicates minimal engagement. Consider sending motivational messages or breaking content into shorter segments.
                      </p>
                    </div>
                  </div>
                )}
                
                {currentStudent.violations.count > 0 && (
                  <div className="flex gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900 dark:text-red-100">Proctoring Violations Detected</p>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                        {currentStudent.violations.count} violation(s) recorded. Discuss academic integrity policies with the student.
                      </p>
                    </div>
                  </div>
                )}

                {averageProgress >= 70 && testSuccessRate >= 80 && totalVideoMinutes >= 120 && currentStudent.violations.count === 0 && (
                  <div className="flex gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <Award className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Excellent Performance!</p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                        Student is performing exceptionally well across all metrics. Consider offering advanced challenges or mentorship opportunities.
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {allStudentsData.averageProgress < 40 && (
                  <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Below Average Progress</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Overall student progress is below target. Consider reviewing course pacing and providing additional support materials.
                      </p>
                    </div>
                  </div>
                )}
                
                {allStudentsTestSuccessRate < 65 && allStudentsData.totalTestAttempts > 0 && (
                  <div className="flex gap-3 p-3 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-800">
                    <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-rose-900 dark:text-rose-100">Low Overall Test Success Rate</p>
                      <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                        Students are struggling with assessments. Review test difficulty and ensure course content adequately prepares students.
                      </p>
                    </div>
                  </div>
                )}
                
                {allStudentsData.totalVideoMinutes / students.length < 60 && students.length > 0 && (
                  <div className="flex gap-3 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <Clock className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Low Average Video Engagement</p>
                      <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                        Average video watch time is low. Consider improving video content, adding interactive elements, or shortening video lengths.
                      </p>
                    </div>
                  </div>
                )}
                
                {allStudentsData.totalViolations > 0 && (
                  <div className="flex gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900 dark:text-red-100">Proctoring Violations Detected</p>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                        {allStudentsData.totalViolations} total violation(s) across all students. Review academic integrity policies with your class.
                      </p>
                    </div>
                  </div>
                )}

                {allStudentsData.averageProgress >= 70 && allStudentsTestSuccessRate >= 80 && (allStudentsData.totalVideoMinutes / students.length) >= 120 && allStudentsData.totalViolations === 0 && (
                  <div className="flex gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <Award className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Excellent Overall Performance!</p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                        Your students are performing exceptionally well across all metrics. Keep up the great teaching!
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStudent ? 'Course-wise Performance' : 'Course-wise Performance (All Students)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentStudent ? (
              currentStudent.enrollmentData.map((enrollment, index) => {
                const colors = ['bg-violet-500', 'bg-orange-500', 'bg-sky-500', 'bg-pink-500', 'bg-lime-500'];
                const borderColors = ['border-l-violet-500', 'border-l-orange-500', 'border-l-sky-500', 'border-l-pink-500', 'border-l-lime-500'];
                const progressColor = colors[index % colors.length];
                const borderColor = borderColors[index % borderColors.length];
                
                return (
                  <div key={index} className={`border-l-4 ${borderColor} pl-4 space-y-2`}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{enrollment.courseTitle}</span>
                      <Badge variant="outline">{enrollment.progress}%</Badge>
                    </div>
                    <Progress value={enrollment.progress} className={`[&>div]:${progressColor}`} />
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>📹 {enrollment.videoMinutesWatched} min</span>
                      <span>🏆 +{enrollment.testProgressBonus}%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              courseWiseArray.map((course, index) => {
                const colors = ['bg-violet-500', 'bg-orange-500', 'bg-sky-500', 'bg-pink-500', 'bg-lime-500'];
                const borderColors = ['border-l-violet-500', 'border-l-orange-500', 'border-l-sky-500', 'border-l-pink-500', 'border-l-lime-500'];
                const progressColor = colors[index % colors.length];
                const borderColor = borderColors[index % borderColors.length];
                
                return (
                  <div key={index} className={`border-l-4 ${borderColor} pl-4 space-y-2`}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{course.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{course.studentCount} students</Badge>
                        <Badge variant="outline">{course.avgProgress}%</Badge>
                      </div>
                    </div>
                    <Progress value={course.avgProgress} className={`[&>div]:${progressColor}`} />
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>📹 {course.totalVideoMinutes} min total</span>
                      <span>🏆 +{course.totalTestBonus}% total bonus</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

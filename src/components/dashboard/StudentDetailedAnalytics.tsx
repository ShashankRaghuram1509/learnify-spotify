import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Clock, Award, TrendingUp, AlertTriangle } from "lucide-react";

interface AnalyticsData {
  totalCourses: number;
  completedCourses: number;
  videoMinutesWatched: number;
  testProgressBonus: number;
  totalProgressWithBonus: number;
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

export default function StudentDetailedAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('student-analytics-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enrollments',
          filter: `student_id=eq.${user?.id}`,
        },
        () => {
          console.log('Enrollment updated, refetching analytics...');
          fetchAnalytics();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_test_attempts',
          filter: `student_id=eq.${user?.id}`,
        },
        () => {
          console.log('Test attempt updated, refetching analytics...');
          fetchAnalytics();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignment_submissions',
          filter: `student_id=eq.${user?.id}`,
        },
        () => {
          console.log('Assignment submission updated, refetching analytics...');
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch enrollments with fresh data
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("id, progress, completed_at, video_minutes_watched, test_progress_bonus, courses(title)")
        .eq("student_id", user.id);
      
      console.log('Student analytics - Fetched enrollments:', enrollments?.map(e => ({
        progress: e.progress,
        test_progress_bonus: e.test_progress_bonus,
        course: e.courses?.title
      })));

      // Fetch test attempts
      const { data: attempts } = await supabase
        .from("student_test_attempts")
        .select("*")
        .eq("student_id", user.id);

      // Fetch violations
      const { data: violations } = await supabase
        .from("proctoring_violations")
        .select("*")
        .eq("student_id", user.id);

      const totalCourses = enrollments?.length || 0;
      const completedCourses = enrollments?.filter(e => {
        const combined = Math.min((e.progress || 0) + (e.test_progress_bonus || 0), 100);
        return combined >= 100 || e.completed_at;
      }).length || 0;

      const videoMinutesWatched = enrollments?.reduce(
        (sum, e) => sum + (e.video_minutes_watched || 0),
        0
      ) || 0;

      const totalProgressWithBonus = enrollments?.reduce((sum, e) => {
        const combined = Math.min((e.progress || 0) + (e.test_progress_bonus || 0), 100);
        return sum + combined;
      }, 0) || 0;

      const testProgressBonus = enrollments?.reduce(
        (sum, e) => sum + (e.test_progress_bonus || 0),
        0
      ) || 0;
      
      console.log('Student analytics - Calculated test progress bonus:', testProgressBonus, 'total progress with bonus:', totalProgressWithBonus);

      const totalAttempts = attempts?.length || 0;
      const passedAttempts = attempts?.filter(a => a.passed)?.length || 0;
      const failedAttempts = totalAttempts - passedAttempts;

      const totalViolations = violations?.reduce((sum, v) => sum + (v.violation_count || 0), 0) || 0;
      const blockedViolation = violations?.find(v => v.blocked_until && new Date(v.blocked_until) > new Date());

      setAnalytics({
        totalCourses,
        completedCourses,
        videoMinutesWatched,
        testProgressBonus,
        totalProgressWithBonus,
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
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  const completionRate = analytics.totalCourses > 0
    ? Math.round((analytics.totalProgressWithBonus || 0) / analytics.totalCourses)
    : 0;

  const testSuccessRate = analytics.testAttempts.total > 0
    ? Math.round((analytics.testAttempts.passed / analytics.testAttempts.total) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.completedCourses} of {analytics.totalCourses} completed
            </p>
            <Progress value={completionRate} className="mt-2 [&>div]:bg-blue-500" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analytics.videoMinutesWatched}</div>
            <p className="text-xs text-muted-foreground">minutes watched</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Performance</CardTitle>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{testSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.testAttempts.passed} passed / {analytics.testAttempts.total} total
            </p>
            <Progress value={testSuccessRate} className="mt-2 [&>div]:bg-amber-500" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress Bonus</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">+{analytics.testProgressBonus}%</div>
            <p className="text-xs text-muted-foreground">from test achievements</p>
          </CardContent>
        </Card>
      </div>

      {analytics.violations.blockedUntil && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Test Access Suspended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Due to repeated proctoring violations, you are temporarily blocked from taking tests.
            </p>
            <p className="text-sm font-medium mt-2">
              Access will be restored on: {new Date(analytics.violations.blockedUntil).toLocaleDateString()}
            </p>
            <Badge variant="destructive" className="mt-2">
              {analytics.violations.count} Total Violations
            </Badge>
          </CardContent>
        </Card>
      )}

      <Card className="border-l-4 border-l-slate-500">
        <CardHeader>
          <CardTitle>Test Attempts Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Attempts</span>
              <Badge variant="outline" className="border-slate-500 text-slate-700">{analytics.testAttempts.total}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Passed (≥75%)</span>
              <Badge className="bg-emerald-500 hover:bg-emerald-600">{analytics.testAttempts.passed}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Failed (&lt;75%)</span>
              <Badge className="bg-orange-500 hover:bg-orange-600">{analytics.testAttempts.failed}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

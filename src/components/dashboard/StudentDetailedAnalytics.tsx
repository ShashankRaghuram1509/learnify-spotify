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
        () => fetchAnalytics()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_test_attempts',
          filter: `student_id=eq.${user?.id}`,
        },
        () => fetchAnalytics()
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

      // Fetch enrollments
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("*, courses(title)")
        .eq("student_id", user.id);

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
      const completedCourses = enrollments?.filter(e => e.completed_at)?.length || 0;
      const videoMinutesWatched = enrollments?.reduce((sum, e) => sum + (e.video_minutes_watched || 0), 0) || 0;
      const testProgressBonus = enrollments?.reduce((sum, e) => sum + (e.test_progress_bonus || 0), 0) || 0;

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
    ? Math.round((analytics.completedCourses / analytics.totalCourses) * 100)
    : 0;

  const testSuccessRate = analytics.testAttempts.total > 0
    ? Math.round((analytics.testAttempts.passed / analytics.testAttempts.total) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.completedCourses} of {analytics.totalCourses} completed
            </p>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.videoMinutesWatched}</div>
            <p className="text-xs text-muted-foreground">minutes watched</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Performance</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.testAttempts.passed} passed / {analytics.testAttempts.total} total
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
            <div className="text-2xl font-bold">+{analytics.testProgressBonus}%</div>
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

      <Card>
        <CardHeader>
          <CardTitle>Test Attempts Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Attempts</span>
              <Badge variant="outline">{analytics.testAttempts.total}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Passed (≥75%)</span>
              <Badge variant="default">{analytics.testAttempts.passed}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Failed (&lt;75%)</span>
              <Badge variant="secondary">{analytics.testAttempts.failed}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

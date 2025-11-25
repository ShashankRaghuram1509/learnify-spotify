import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function ActivityMetrics() {
  const [metrics, setMetrics] = useState({
    dailyActiveUsers: 0,
    totalVideoMinutes: 0,
    avgCompletionRate: 0
  });

  useEffect(() => {
    fetchActivityMetrics();
  }, []);

  const fetchActivityMetrics = async () => {
    // Daily active users (users who updated progress today)
    const today = new Date().toISOString().split('T')[0];
    const { data: activeUsers } = await supabase
      .from('video_watch_tracking')
      .select('student_id')
      .gte('updated_at', today);

    const uniqueActiveUsers = new Set(activeUsers?.map(u => u.student_id)).size;

    // Total video minutes watched
    const { data: videoStats } = await supabase
      .from('video_watch_tracking')
      .select('minutes_watched');

    const totalMinutes = videoStats?.reduce((sum, v) => sum + (v.minutes_watched || 0), 0) || 0;

    // Average completion rate
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('progress, test_progress_bonus');

    const avgProgress = enrollments?.length
      ? enrollments.reduce((sum, e) => {
          const combined = Math.min((e.progress || 0) + (e.test_progress_bonus || 0), 100);
          return sum + combined;
        }, 0) / enrollments.length
      : 0;

    setMetrics({
      dailyActiveUsers: uniqueActiveUsers,
      totalVideoMinutes: totalMinutes,
      avgCompletionRate: avgProgress
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
          <Activity className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.dailyActiveUsers}</div>
          <p className="text-xs text-muted-foreground">Active today</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Video Minutes</CardTitle>
          <PlayCircle className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalVideoMinutes.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total minutes watched</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.avgCompletionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Course completion</p>
        </CardContent>
      </Card>
    </div>
  );
}

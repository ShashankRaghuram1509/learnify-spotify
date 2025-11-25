import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function ProgressTracker() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    averageProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchProgress = async () => {
    try {
      const { data: enrollments, error } = await supabase
        .from("enrollments")
        .select("progress, test_progress_bonus, completed_at")
        .eq("student_id", user?.id);

      if (error) throw error;

      const totalCourses = enrollments?.length || 0;
      const completedCourses = enrollments?.filter(e => {
        const combined = Math.min((e.progress || 0) + (e.test_progress_bonus || 0), 100);
        return combined >= 100 || e.completed_at;
      })?.length || 0;

      const averageProgress = totalCourses > 0
        ? Math.round(
            enrollments.reduce((sum, e) => {
              const combined = Math.min((e.progress || 0) + (e.test_progress_bonus || 0), 100);
              return sum + combined;
            }, 0) / totalCourses
          )
        : 0;

      setStats({
        totalCourses,
        completedCourses,
        averageProgress,
      });
    } catch (error) {
      // Silent fail - progress will show as 0
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-primary" />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="text-primary" />
          Learning Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-medium">{stats.averageProgress}%</span>
          </div>
          <Progress value={stats.averageProgress} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="bg-secondary/20 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Enrolled</p>
            <p className="text-2xl font-bold text-primary">{stats.totalCourses}</p>
          </div>
          <div className="bg-secondary/20 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-primary">{stats.completedCourses}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

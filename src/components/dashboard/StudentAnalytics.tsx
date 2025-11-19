import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, BookOpen, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const COLORS = ["#1DB954", "#1ED760", "#1AA34A", "#15803d"];

interface AnalyticsData {
  totalStudents: number;
  activeCourses: number;
  completionRate: number;
  monthlyEnrollments: { name: string; students: number }[];
  popularCourses: { name: string; value: number }[];
}

export default function StudentAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalStudents: 0,
    activeCourses: 0,
    completionRate: 0,
    monthlyEnrollments: [],
    popularCourses: [],
  });

  useEffect(() => {
    if (user) {
      fetchAnalytics();
      
      // Set up realtime subscription for enrollments
      const channel = supabase
        .channel('analytics-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'enrollments'
          },
          () => {
            fetchAnalytics();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Get teacher's courses
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title")
        .eq("teacher_id", user?.id);

      if (!courses) return;

      const courseIds = courses.map((c) => c.id);

      // Get total unique students
      const { count: totalStudents } = await supabase
        .from("enrollments")
        .select("student_id", { count: "exact", head: true })
        .in("course_id", courseIds);

      // Get enrollments with completion data
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("progress, enrolled_at, course_id")
        .in("course_id", courseIds);

      // Calculate completion rate
      const completedCount = enrollments?.filter((e) => e.progress === 100).length || 0;
      const completionRate = enrollments?.length
        ? Math.round((completedCount / enrollments.length) * 100)
        : 0;

      // Calculate monthly enrollments (last 6 months)
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return {
          month: date.getMonth(),
          year: date.getFullYear(),
          name: monthNames[date.getMonth()],
        };
      });

      const monthlyData = last6Months.map((month) => {
        const count = enrollments?.filter((e) => {
          const enrollDate = new Date(e.enrolled_at);
          return (
            enrollDate.getMonth() === month.month &&
            enrollDate.getFullYear() === month.year
          );
        }).length || 0;

        return {
          name: month.name,
          students: count,
        };
      });

      // Get popular courses
      const courseEnrollments = await Promise.all(
        courses.slice(0, 4).map(async (course) => {
          const { count } = await supabase
            .from("enrollments")
            .select("id", { count: "exact", head: true })
            .eq("course_id", course.id);

          return {
            name: course.title,
            value: count || 0,
          };
        })
      );

      setAnalytics({
        totalStudents: totalStudents || 0,
        activeCourses: courses.length,
        completionRate,
        monthlyEnrollments: monthlyData,
        popularCourses: courseEnrollments.filter((c) => c.value > 0),
      });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading analytics...</div>;
  }
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Across all your courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeCourses}</div>
            <p className="text-xs text-muted-foreground">Published courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Average across all courses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Student Enrollment Over Time</CardTitle>
            <CardDescription>Monthly new student sign-ups (Last 6 months).</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlyEnrollments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Legend />
                <Bar dataKey="students" fill="#1DB954" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Most Popular Courses</CardTitle>
            <CardDescription>Distribution of student enrollments.</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.popularCourses.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No enrollment data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.popularCourses}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => entry.name}
                  >
                    {analytics.popularCourses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      borderColor: "hsl(var(--border))",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
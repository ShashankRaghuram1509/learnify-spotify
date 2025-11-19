import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface RevenueData {
  totalRevenue: number;
  totalStudents: number;
  totalCourses: number;
  recentPayments: {
    course_title: string;
    amount: number;
    created_at: string;
    student_name: string;
  }[];
}

export default function TeacherRevenue() {
  const { user } = useAuth();
  const [revenueData, setRevenueData] = useState<RevenueData>({
    totalRevenue: 0,
    totalStudents: 0,
    totalCourses: 0,
    recentPayments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRevenueData();
    }
  }, [user]);

  const fetchRevenueData = async () => {
    try {
      // Get teacher's courses
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title, price")
        .eq("teacher_id", user?.id)
        .eq("is_premium", true);

      if (!courses) return;

      const courseIds = courses.map((c) => c.id);

      // Get all payments for teacher's courses (50% revenue)
      const { data: payments } = await supabase
        .from("payments")
        .select(`
          amount,
          created_at,
          course_id,
          user_id
        `)
        .in("course_id", courseIds)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      // Get unique students count
      const { count: studentCount } = await supabase
        .from("enrollments")
        .select("student_id", { count: "exact", head: true })
        .in("course_id", courseIds);

      // Calculate total revenue (50% of payments)
      const totalRevenue = (payments || []).reduce(
        (sum, payment) => sum + Number(payment.amount) * 0.5,
        0
      );

      // Get recent payments with student names
      const recentPayments = await Promise.all(
        (payments || []).slice(0, 5).map(async (payment) => {
          const course = courses.find((c) => c.id === payment.course_id);
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", payment.user_id)
            .single();

          return {
            course_title: course?.title || "Unknown Course",
            amount: Number(payment.amount) * 0.5,
            created_at: payment.created_at,
            student_name: profile?.full_name || "Unknown Student",
          };
        })
      );

      setRevenueData({
        totalRevenue,
        totalStudents: studentCount || 0,
        totalCourses: courses.length,
        recentPayments,
      });
    } catch (error) {
      console.error("Failed to fetch revenue data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading revenue data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (50%)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{revenueData.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Your 50% share from course sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all your paid courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Premium courses published
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenueData.recentPayments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-4">
              {revenueData.recentPayments.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{payment.course_title}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.student_name} •{" "}
                      {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      +₹{payment.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Your share</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

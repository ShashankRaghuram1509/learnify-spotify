import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Users, BookOpen, DollarSign, TrendingUp, Clock, UserPlus } from "lucide-react";

export default function PlatformAnalytics() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    activeToday: 0,
    newSignupsToday: 0
  });

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [enrollmentTrends, setEnrollmentTrends] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
    
    const channel = supabase
      .channel('analytics-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchAnalytics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, fetchAnalytics)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAnalytics = async () => {
    // Total users
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    
    // Students and teachers
    const { data: roles } = await supabase.from('user_roles').select('role');
    const totalStudents = roles?.filter(r => r.role === 'student').length || 0;
    const totalTeachers = roles?.filter(r => r.role === 'teacher').length || 0;
    
    // Courses
    const { count: totalCourses } = await supabase.from('courses').select('*', { count: 'exact', head: true });
    
    // Enrollments
    const { count: totalEnrollments } = await supabase.from('enrollments').select('*', { count: 'exact', head: true });
    
    // Revenue
    const { data: payments } = await supabase.from('payments').select('amount').eq('status', 'completed');
    const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    
    // Today's signups
    const today = new Date().toISOString().split('T')[0];
    const { count: newSignupsToday } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);
    
    setStats({
      totalUsers: totalUsers || 0,
      totalStudents,
      totalTeachers,
      totalCourses: totalCourses || 0,
      totalEnrollments: totalEnrollments || 0,
      totalRevenue,
      activeToday: 0,
      newSignupsToday: newSignupsToday || 0
    });

    // Revenue trends (last 7 days)
    const { data: recentPayments } = await supabase
      .from('payments')
      .select('created_at, amount')
      .eq('status', 'completed')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at');

    const revenueByDay = recentPayments?.reduce((acc: any, payment) => {
      const date = new Date(payment.created_at).toLocaleDateString();
      if (!acc[date]) acc[date] = 0;
      acc[date] += Number(payment.amount);
      return acc;
    }, {});

    setRevenueData(Object.entries(revenueByDay || {}).map(([date, amount]) => ({ date, amount })));

    // Enrollment trends (last 30 days)
    const { data: recentEnrollments } = await supabase
      .from('enrollments')
      .select('enrolled_at')
      .gte('enrolled_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('enrolled_at');

    const enrollmentsByDay = recentEnrollments?.reduce((acc: any, enrollment) => {
      const date = new Date(enrollment.enrolled_at).toLocaleDateString();
      if (!acc[date]) acc[date] = 0;
      acc[date]++;
      return acc;
    }, {});

    setEnrollmentTrends(Object.entries(enrollmentsByDay || {}).map(([date, count]) => ({ date, count })));
  };

  const userDistribution = [
    { name: 'Students', value: stats.totalStudents, color: '#3b82f6' },
    { name: 'Teachers', value: stats.totalTeachers, color: '#8b5cf6' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+{stats.newSignupsToday} today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">{stats.totalEnrollments} enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {stats.totalEnrollments} enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Signups</CardTitle>
            <UserPlus className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newSignupsToday}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends (Last 7 Days)</CardTitle>
            <CardDescription>Daily revenue overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrollment Trends (Last 30 Days)</CardTitle>
            <CardDescription>Daily enrollment count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrollmentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Distribution</CardTitle>
          <CardDescription>Students vs Teachers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

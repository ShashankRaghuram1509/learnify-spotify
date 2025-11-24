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
    
    // Revenue - Include ALL completed payments (courses + subscriptions)
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, plan_name')
      .eq('status', 'completed');
    
    const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const subscriptionRevenue = payments?.filter(p => p.plan_name).reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    
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

    // Revenue trends (last 7 days) - with all days filled
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { data: recentPayments } = await supabase
      .from('payments')
      .select('created_at, amount, plan_name')
      .eq('status', 'completed')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at');

    // Create array with all 7 days
    const revenueTrends: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayRevenue = recentPayments?.filter(p => p.created_at.startsWith(dateStr))
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      
      revenueTrends.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: dayRevenue
      });
    }

    setRevenueData(revenueTrends);

    // Enrollment trends (last 30 days) - with all days filled
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { data: recentEnrollments } = await supabase
      .from('enrollments')
      .select('enrolled_at')
      .gte('enrolled_at', thirtyDaysAgo.toISOString())
      .order('enrolled_at');

    // Create array with all 30 days
    const enrollTrends: any[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayEnrollments = recentEnrollments?.filter(e => e.enrolled_at.startsWith(dateStr)).length || 0;
      
      enrollTrends.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: dayEnrollments
      });
    }

    setEnrollmentTrends(enrollTrends);
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
            <p className="text-xs text-muted-foreground">From courses & premium subscriptions</p>
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
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
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
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => [value, 'Enrollments']} />
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

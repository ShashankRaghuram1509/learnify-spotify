import StudentPerformanceAnalytics from "@/components/dashboard/teacher/StudentPerformanceAnalytics";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Performance Analytics</h1>
        <p className="text-muted-foreground">Track individual student progress, test performance, and engagement metrics</p>
      </div>
      <StudentPerformanceAnalytics />
    </div>
  );
}
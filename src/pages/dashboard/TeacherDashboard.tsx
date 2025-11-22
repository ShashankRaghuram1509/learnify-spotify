import ContentManager from "@/components/dashboard/ContentManager";
import TeacherChatList from "@/components/dashboard/TeacherChatList";
import TeacherRevenue from "@/components/dashboard/TeacherRevenue";
import TeacherUpcomingCalls from "@/components/dashboard/TeacherUpcomingCalls";

export default function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your teaching activity.
        </p>
      </div>
      
      <TeacherRevenue />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ContentManager />
        <TeacherChatList />
        <TeacherUpcomingCalls />
      </div>
    </div>
  );
}
import ContentManager from "@/components/dashboard/ContentManager";
import VideoCallManagement from "@/components/dashboard/VideoCallManagement";
import TeacherVideoCallReminders from "@/components/dashboard/TeacherVideoCallReminders";
import TeacherChatList from "@/components/dashboard/TeacherChatList";
import StudentPerformanceAnalytics from "@/components/dashboard/teacher/StudentPerformanceAnalytics";

export default function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <StudentPerformanceAnalytics />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <VideoCallManagement />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <TeacherVideoCallReminders />
        </div>
        <div className="md:col-span-2 lg:col-span-2">
          <ContentManager />
        </div>
        <div className="md:col-span-2 lg:col-span-2">
          <TeacherChatList />
        </div>
      </div>
    </div>
  );
}
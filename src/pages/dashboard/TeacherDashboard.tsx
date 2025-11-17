import ContentManager from "@/components/dashboard/ContentManager";
import StudentAnalytics from "@/components/dashboard/StudentAnalytics";
import VideoCallManagement from "@/components/dashboard/VideoCallManagement";
import TeacherChatList from "@/components/dashboard/TeacherChatList";

export default function TeacherDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="md:col-span-2 lg:col-span-3">
        <StudentAnalytics />
      </div>
      <div className="lg:col-span-1">
        <VideoCallManagement />
      </div>
      <div className="md:col-span-2 lg:col-span-4">
        <ContentManager />
      </div>
      <div className="md:col-span-2 lg:col-span-4">
        <TeacherChatList />
      </div>
    </div>
  );
}
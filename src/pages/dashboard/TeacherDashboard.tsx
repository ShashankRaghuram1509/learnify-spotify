import ContentManager from "@/components/dashboard/ContentManager";
import StudentAnalytics from "@/components/dashboard/StudentAnalytics";
import TimetableScheduler from "@/components/dashboard/TimetableScheduler";
import TeacherChatList from "@/components/dashboard/TeacherChatList";

export default function TeacherDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="md:col-span-2 lg:col-span-3">
        <StudentAnalytics />
      </div>
      <div className="md:col-span-2 lg:col-span-4">
        <TimetableScheduler />
      </div>
      <div className="md:col-span-2 lg:col-span-2">
        <ContentManager />
      </div>
      <div className="md:col-span-2 lg:col-span-2">
        <TeacherChatList />
      </div>
    </div>
  );
}
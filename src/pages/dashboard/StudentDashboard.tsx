import ProgressTracker from "@/components/dashboard/ProgressTracker";
import StudentTimetable from "@/components/dashboard/StudentTimetable";
import PremiumChatList from "@/components/dashboard/PremiumChatList";

export default function StudentDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ProgressTracker />
      </div>
      <div className="lg:col-span-1">
        <StudentTimetable />
      </div>
      <div className="lg:col-span-3">
        <PremiumChatList />
      </div>
    </div>
  );
}
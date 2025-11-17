import CertificateManager from "@/components/dashboard/CertificateManager";
import EnrolledCoursesList from "@/components/dashboard/EnrolledCoursesList";
import ProgressTracker from "@/components/dashboard/ProgressTracker";
import StudentTimetable from "@/components/dashboard/StudentTimetable";
import PremiumChatList from "@/components/dashboard/PremiumChatList";

export default function StudentDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="md:col-span-2 lg:col-span-3">
        <EnrolledCoursesList />
      </div>
      <div className="lg:col-span-1">
        <ProgressTracker />
      </div>
      <div className="md:col-span-2 lg:col-span-2">
        <CertificateManager />
      </div>
      <div className="md:col-span-2 lg:col-span-2">
        <StudentTimetable />
      </div>
      <div className="md:col-span-2 lg:col-span-4">
        <PremiumChatList />
      </div>
    </div>
  );
}
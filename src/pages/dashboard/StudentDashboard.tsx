import CertificateManager from "@/components/dashboard/CertificateManager";
import EnrolledCoursesList from "@/components/dashboard/EnrolledCoursesList";
import ProgressTracker from "@/components/dashboard/ProgressTracker";
import VideoCallReminders from "@/components/dashboard/VideoCallReminders";
import PremiumChatList from "@/components/dashboard/PremiumChatList";
import StudentDetailedAnalytics from "@/components/dashboard/StudentDetailedAnalytics";

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <StudentDetailedAnalytics />
      
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
          <VideoCallReminders />
        </div>
        <div className="md:col-span-2 lg:col-span-4">
          <PremiumChatList />
        </div>
      </div>
    </div>
  );
}
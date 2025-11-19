import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import CourseViewer from "@/pages/dashboard/student/CourseViewer";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Auth from "./pages/auth/Auth";
import PremiumFeatures from "./pages/PremiumFeatures";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import MyCoursesPage from "./pages/dashboard/student/MyCourses";
import CertificatesPage from "./pages/dashboard/student/Certificates";
import ProfilePage from "./pages/dashboard/student/Profile";
import SettingsPage from "./pages/dashboard/student/Settings";
import UpgradeToProPage from "./pages/dashboard/student/UpgradeToPro";
import TeacherMyCourses from "./pages/dashboard/teacher/MyCourses";
import TeacherAnalytics from "./pages/dashboard/teacher/Analytics";
import TeacherSchedule from "./pages/dashboard/teacher/Schedule";
import TeacherProfile from "./pages/dashboard/teacher/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirect from "./components/AuthRedirect";
import DashboardLayout from "./components/layout/DashboardLayout";
import AIAssistant from "./components/AIAssistant";
import Live from "./pages/Live";
import VideoCall from "./pages/VideoCall";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/premium-features" element={<PremiumFeatures />} />

          {/* Authentication Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/redirect" element={<AuthRedirect />} />

          {/* Live Video Call Route */}
          <Route path="/live" element={<Live />} />
          <Route path="/video-call/:roomID" element={<VideoCall />} />

          {/* Admin Route */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route index element={<AdminDashboard />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/student" element={<ProtectedRoute allowedRoles={["student"]} />}>
              <Route index element={<StudentDashboard />} />
              <Route path="my-courses" element={<MyCoursesPage />} />
              <Route path="course/:id" element={<CourseViewer />} />
              <Route path="certificates" element={<CertificatesPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="upgrade" element={<UpgradeToProPage />} />
            </Route>
            <Route path="/dashboard/teacher" element={<ProtectedRoute allowedRoles={["teacher"]} />}>
              <Route index element={<TeacherDashboard />} />
              <Route path="courses" element={<TeacherMyCourses />} />
              <Route path="analytics" element={<TeacherAnalytics />} />
              <Route path="schedule" element={<TeacherSchedule />} />
              <Route path="profile" element={<TeacherProfile />} />
            </Route>
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIAssistant />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AuthLayout from "./pages/auth/AuthLayout";
import LoginForm from "./pages/auth/Login";
import SignupForm from "./pages/auth/Signup";
import PremiumCourses from "./pages/PremiumCourses";
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
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import AIAssistant from "./components/AIAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/premium-courses" element={<PremiumCourses />} />

          {/* Authentication Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/student" element={<ProtectedRoute allowedRoles={["student"]} />}>
              <Route index element={<StudentDashboard />} />
              <Route path="my-courses" element={<MyCoursesPage />} />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function AuthRedirect() {
  const { userRole, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (userRole === "student") {
    return <Navigate to="/dashboard/student" replace />;
  }

  if (userRole === "teacher") {
    return <Navigate to="/dashboard/teacher" replace />;
  }

  if (userRole === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/" replace />;
}

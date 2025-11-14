import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: ("student" | "teacher" | "admin")[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { userRole, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}

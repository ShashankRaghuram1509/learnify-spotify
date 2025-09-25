import { useAuth } from "@/hooks/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: ("student" | "teacher")[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user || user.role === "guest") {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after a
    // successful login.
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If the user is logged in but doesn't have the right role,
    // redirect them to a "not authorized" page or the home page.
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
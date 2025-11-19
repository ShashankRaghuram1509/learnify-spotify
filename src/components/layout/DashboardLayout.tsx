import {
  Bell,
  Home,
  LineChart,
  Package,
  Package2,
  ShoppingCart,
  Users,
  Award,
  Settings,
  User,
  BookOpen,
  Video,
  BarChart,
  Star,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const studentNavItems = [
  { to: "/dashboard/student", icon: Home, label: "Dashboard" },
  { to: "/dashboard/student/my-courses", icon: BookOpen, label: "My Courses" },
  { to: "/dashboard/student/certificates", icon: Award, label: "Certificates" },
  { to: "/dashboard/student/profile", icon: User, label: "Profile" },
  { to: "/dashboard/student/settings", icon: Settings, label: "Settings" },
  { to: "/dashboard/student/upgrade", icon: Star, label: "Upgrade to Pro" },
];

const teacherNavItems = [
  { to: "/dashboard/teacher", icon: Home, label: "Dashboard" },
  { to: "/dashboard/teacher/courses", icon: BookOpen, label: "My Courses" },
  { to: "/dashboard/teacher/analytics", icon: BarChart, label: "Analytics" },
  { to: "/dashboard/teacher/schedule", icon: Video, label: "Schedule Calls" },
  { to: "/dashboard/teacher/profile", icon: User, label: "Profile" },
];

export default function DashboardLayout() {
  const { user, userRole, signOut, subscriptionTier, subscriptionExpiresAt } = useAuth();
  const location = useLocation();

  const hasValidSubscription = (() => {
    if (!subscriptionTier) return false;
    const valid = ["Lite", "Premium", "Premium Pro"].includes(subscriptionTier);
    if (!valid) return false;
    if (!subscriptionExpiresAt) return true;
    return new Date(subscriptionExpiresAt) > new Date();
  })();

  const baseItems = userRole === "student" ? studentNavItems : teacherNavItems;
  const navItems = userRole === "student"
    ? baseItems.filter(item => item.to !== "/dashboard/student/upgrade" || !hasValidSubscription)
    : baseItems;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6 text-spotify" />
              <span className="">Learnify</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    location.pathname === item.to && "bg-muted text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            {/* Mobile Nav Trigger can be added here if needed */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.email || 'My Account'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/${userRole}/settings`}>Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-4 md:gap-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
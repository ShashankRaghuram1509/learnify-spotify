import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { UserPlus, Shield } from "lucide-react";
import PlatformAnalytics from "@/components/admin/PlatformAnalytics";
import StudentTeacherMonitoring from "@/components/admin/StudentTeacherMonitoring";
import PlacementManagement from "@/components/admin/PlacementManagement";
import MOUManagement from "@/components/admin/MOUManagement";

export default function AdminDashboard() {
  const { userRole, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-create-instructor', {
        body: { email, password, fullName }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Instructor account created successfully!");
      setEmail("");
      setPassword("");
      setFullName("");
    } catch (error: any) {
      console.error('Create instructor error:', error);
      toast.error(error.message || "Failed to create instructor account");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userRole || userRole !== "admin") {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              Platform analytics, user monitoring, and placement management
            </p>
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="monitoring">Users</TabsTrigger>
              <TabsTrigger value="placement">Placement</TabsTrigger>
              <TabsTrigger value="mou">MOU Partners</TabsTrigger>
              <TabsTrigger value="instructor">Add Instructor</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              <PlatformAnalytics />
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <StudentTeacherMonitoring />
            </TabsContent>

            <TabsContent value="placement" className="space-y-6">
              <PlacementManagement />
            </TabsContent>

            <TabsContent value="mou" className="space-y-6">
              <MOUManagement />
            </TabsContent>

            <TabsContent value="instructor" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-primary" />
                      <CardTitle>Create Instructor Account</CardTitle>
                    </div>
                    <CardDescription>
                      Add a new instructor to the platform with secure credentials
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateInstructor} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          placeholder="John Doe"
                          maxLength={100}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="instructor@example.com"
                          maxLength={255}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Initial Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          minLength={8}
                          maxLength={100}
                        />
                        <p className="text-xs text-muted-foreground">
                          Must be at least 8 characters
                        </p>
                      </div>

                      <Button type="submit" disabled={creating} className="w-full">
                        {creating ? "Creating Account..." : "Create Instructor Account"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

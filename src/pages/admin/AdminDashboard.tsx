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
import CourseReviewsManagement from "@/components/admin/CourseReviewsManagement";
import UserManagement from "@/components/admin/UserManagement";
import CourseManagement from "@/components/admin/CourseManagement";

export default function AdminDashboard() {
  const { userRole, loading } = useAuth();
  const [creating, setCreating] = useState(false);

  const handleCreateInstructor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const { data, error } = await supabase.functions.invoke('admin-create-instructor', {
        body: { 
          email: formData.get('email') as string,
          password: formData.get('password') as string,
          fullName: formData.get('fullName') as string,
          experienceLevel: formData.get('experienceLevel') as string,
          linkedin: formData.get('linkedin') as string,
          phone: formData.get('phone') as string,
          resumeUrl: formData.get('resumeUrl') as string,
          college: formData.get('college') as string
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Instructor account created successfully!");
      e.currentTarget.reset();
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
            <div className="overflow-x-auto pb-2">
              <TabsList className="inline-flex w-auto min-w-full">
                <TabsTrigger value="analytics" className="whitespace-nowrap">Analytics</TabsTrigger>
                <TabsTrigger value="users" className="whitespace-nowrap">Users</TabsTrigger>
                <TabsTrigger value="courses" className="whitespace-nowrap">Courses</TabsTrigger>
                <TabsTrigger value="monitoring" className="whitespace-nowrap">Monitoring</TabsTrigger>
                <TabsTrigger value="placement" className="whitespace-nowrap">Placement</TabsTrigger>
                <TabsTrigger value="reviews" className="whitespace-nowrap">Reviews</TabsTrigger>
                <TabsTrigger value="mou" className="whitespace-nowrap">MOU Partners</TabsTrigger>
                <TabsTrigger value="instructor" className="whitespace-nowrap">Add Instructor</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="analytics" className="space-y-6">
              <PlatformAnalytics />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>

            <TabsContent value="courses" className="space-y-6">
              <CourseManagement />
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <StudentTeacherMonitoring />
            </TabsContent>

            <TabsContent value="placement" className="space-y-6">
              <PlacementManagement />
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <CourseReviewsManagement />
            </TabsContent>

            <TabsContent value="mou" className="space-y-6">
              <MOUManagement />
            </TabsContent>

            <TabsContent value="instructor" className="space-y-6">
              <Card className="max-w-3xl">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    <CardTitle>Create Instructor Account</CardTitle>
                  </div>
                  <CardDescription>
                    Add a new instructor to the platform with complete profile details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateInstructor} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          type="text"
                          required
                          placeholder="John Doe"
                          maxLength={100}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="instructor@example.com"
                          maxLength={255}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="password">Initial Password *</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          required
                          placeholder="••••••••"
                          minLength={8}
                          maxLength={100}
                        />
                        <p className="text-xs text-muted-foreground">
                          Must be at least 8 characters
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+91 9876543210"
                          maxLength={20}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="experienceLevel">Experience Level *</Label>
                        <select
                          id="experienceLevel"
                          name="experienceLevel"
                          required
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select experience level</option>
                          <option value="beginner">Beginner (0-2 years)</option>
                          <option value="intermediate">Intermediate (2-5 years)</option>
                          <option value="advanced">Advanced (5-10 years)</option>
                          <option value="expert">Expert (10+ years)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="college">Institution/Organization</Label>
                        <Input
                          id="college"
                          name="college"
                          type="text"
                          placeholder="University name or company"
                          maxLength={200}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                      <Input
                        id="linkedin"
                        name="linkedin"
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        maxLength={255}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resumeUrl">Resume/CV URL *</Label>
                      <Input
                        id="resumeUrl"
                        name="resumeUrl"
                        type="url"
                        required
                        placeholder="https://drive.google.com/file/d/..."
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground">
                        Provide a public link to Google Drive, Dropbox, or similar
                      </p>
                    </div>

                    <Button type="submit" disabled={creating} className="w-full">
                      {creating ? "Creating Account..." : "Create Instructor Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

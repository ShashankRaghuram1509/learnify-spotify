import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { FileText, Star } from "lucide-react";

interface Application {
  id: string;
  student_id: string;
  job_role_id: string;
  status: string;
  applied_at: string;
  resume_url?: string;
  profiles: {
    full_name: string;
    email: string;
  };
  job_roles: {
    title: string;
    companies: {
      name: string;
    };
  };
}

export default function PlacementReview() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      // First get courses taught by this teacher
      const { data: teacherCourses, error: coursesError } = await supabase
        .from('courses')
        .select('id')
        .eq('teacher_id', user?.id);

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        toast.error('Failed to fetch courses');
        return;
      }

      if (!teacherCourses || teacherCourses.length === 0) {
        setApplications([]);
        return;
      }

      const courseIds = teacherCourses.map(c => c.id);

      // Get students enrolled in these courses
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('student_id')
        .in('course_id', courseIds);

      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
        toast.error('Failed to fetch enrollments');
        return;
      }

      if (!enrollments || enrollments.length === 0) {
        setApplications([]);
        return;
      }

      const studentIds = [...new Set(enrollments.map(e => e.student_id))];

      // Fetch applications, job roles, companies, and profiles separately
      const { data: applicationsData, error: appsError } = await supabase
        .from('student_applications')
        .select('*')
        .in('student_id', studentIds)
        .order('applied_at', { ascending: false });

      if (appsError) {
        console.error('Error fetching applications:', appsError);
        toast.error('Failed to fetch applications');
        return;
      }

      if (!applicationsData || applicationsData.length === 0) {
        setApplications([]);
        return;
      }

      // Fetch student profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      // Fetch job roles with companies
      const jobRoleIds = [...new Set(applicationsData.map(app => app.job_role_id))];
      const { data: jobRolesData } = await supabase
        .from('job_roles')
        .select('id, title, company_id');

      const companyIds = jobRolesData ? [...new Set(jobRolesData.map(jr => jr.company_id))] : [];
      const { data: companiesData } = await supabase
        .from('companies')
        .select('id, name')
        .in('id', companyIds);

      // Combine the data
      const enrichedApplications = applicationsData.map(app => {
        const profile = profilesData?.find(p => p.id === app.student_id);
        const jobRole = jobRolesData?.find(jr => jr.id === app.job_role_id);
        const company = companiesData?.find(c => c.id === jobRole?.company_id);

        return {
          ...app,
          profiles: profile,
          job_roles: {
            title: jobRole?.title,
            companies: { name: company?.name }
          }
        };
      });

      setApplications(enrichedApplications as any);
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred');
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedApp) return;

    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase
      .from('teacher_feedback')
      .insert({
        student_id: selectedApp.student_id,
        teacher_id: user?.id,
        application_id: selectedApp.id,
        technical_skills: formData.get('technical_skills') as string,
        soft_skills: formData.get('soft_skills') as string,
        strengths: formData.get('strengths') as string,
        areas_for_improvement: formData.get('areas_for_improvement') as string,
        recommendation: formData.get('recommendation') as string,
        rating: Number(formData.get('rating')),
      });

    if (error) {
      console.error("Feedback submission error:", error);
      toast.error(`Failed to submit feedback: ${error.message}`);
    } else {
      toast.success("Feedback submitted successfully");
      setShowFeedbackDialog(false);
      setSelectedApp(null);
    }
  };

  const openFeedbackDialog = (app: Application) => {
    setSelectedApp(app);
    setShowFeedbackDialog(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Placement Review</h2>
        <p className="text-muted-foreground">Review and provide feedback for your students' placement applications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Applications</CardTitle>
          <CardDescription>Applications from students enrolled in your courses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Job Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{app.profiles?.full_name}</div>
                      <div className="text-sm text-muted-foreground">{app.profiles?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{app.job_roles?.title}</TableCell>
                  <TableCell>{app.job_roles?.companies?.name}</TableCell>
                  <TableCell>{new Date(app.applied_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {app.resume_url ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(app.resume_url, '_blank')}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View Resume
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">No resume</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      app.status === 'selected' ? 'default' :
                      app.status === 'shortlisted' ? 'secondary' :
                      app.status === 'rejected' ? 'destructive' : 'outline'
                    }>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openFeedbackDialog(app)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Add Feedback
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {applications.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No placement applications from your students yet
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Provide Student Feedback</DialogTitle>
            <DialogDescription>
              Add detailed feedback for {selectedApp?.profiles?.full_name}'s placement application
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Overall Rating (1-5) *</Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                min="1"
                max="5"
                required
                placeholder="Rate from 1 to 5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="technical_skills">Technical Skills Assessment</Label>
              <Textarea
                id="technical_skills"
                name="technical_skills"
                rows={3}
                placeholder="Evaluate the student's technical proficiency..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="soft_skills">Soft Skills Assessment</Label>
              <Textarea
                id="soft_skills"
                name="soft_skills"
                rows={3}
                placeholder="Evaluate communication, teamwork, leadership..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="strengths">Key Strengths</Label>
              <Textarea
                id="strengths"
                name="strengths"
                rows={3}
                placeholder="Highlight the student's key strengths..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="areas_for_improvement">Areas for Improvement</Label>
              <Textarea
                id="areas_for_improvement"
                name="areas_for_improvement"
                rows={3}
                placeholder="Constructive feedback for growth..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recommendation">Recommendation *</Label>
              <Textarea
                id="recommendation"
                name="recommendation"
                rows={4}
                required
                placeholder="Your overall recommendation for this placement..."
              />
            </div>
            <Button type="submit" className="w-full">
              Submit Feedback
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

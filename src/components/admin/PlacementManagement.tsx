import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Building2, Briefcase, Users, FileText, Download, Package, Upload } from "lucide-react";

export default function PlacementManagement() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('placement-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_roles' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_applications' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data: jobsData } = await supabase
        .from('job_roles')
        .select('*, companies(name)')
        .order('created_at', { ascending: false });

      // Fetch applications
      const { data: appsData } = await supabase
        .from('student_applications')
        .select('*')
        .order('applied_at', { ascending: false });

      if (appsData && appsData.length > 0) {
        // Fetch student profiles
        const studentIds = [...new Set(appsData.map(app => app.student_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', studentIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        // Fetch job roles with companies
        const jobRoleIds = [...new Set(appsData.map(app => app.job_role_id))];
        const { data: jobRolesWithCompanies, error: jobRolesError } = await supabase
          .from('job_roles')
          .select('id, title, company_id, companies(name)')
          .in('id', jobRoleIds);

        if (jobRolesError) {
          console.error('Error fetching job roles:', jobRolesError);
        }

        // Combine the data
        const enrichedApplications = appsData.map(app => {
          const profile = profilesData?.find(p => p.id === app.student_id);
          const jobRole = jobRolesWithCompanies?.find(jr => jr.id === app.job_role_id);

          console.log('Enriching app:', {
            appId: app.id,
            studentId: app.student_id,
            profile,
            jobRole
          });

          return {
            ...app,
            profiles: profile || { full_name: 'Unknown', email: 'N/A' },
            job_roles: {
              title: jobRole?.title || 'N/A',
              companies: jobRole?.companies || { name: 'N/A' }
            }
          };
        });

        console.log('Setting enriched applications:', enrichedApplications);
        setApplications(enrichedApplications);
      } else {
        setApplications([]);
      }

      setCompanies(companiesData || []);
      setJobRoles(jobsData || []);
    } catch (error) {
      console.error('Error fetching placement data:', error);
      toast.error('Failed to load placement data');
    }
  };

  const handleCreateCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from('companies').insert({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      website: formData.get('website') as string,
    });

    if (error) {
      toast.error("Failed to create company");
    } else {
      toast.success("Company created successfully");
      setShowCompanyDialog(false);
      e.currentTarget.reset();
    }
  };

  const handleCreateJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from('job_roles').insert({
      company_id: selectedCompany,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      experience_level: formData.get('experience_level') as string,
      salary_min: Number(formData.get('salary_min')),
      salary_max: Number(formData.get('salary_max')),
    });

    if (error) {
      toast.error("Failed to create job role");
    } else {
      toast.success("Job role created successfully");
      setShowJobDialog(false);
      e.currentTarget.reset();
    }
  };

  const updateApplicationStatus = async (appId: string, status: string) => {
    const { error } = await supabase
      .from('student_applications')
      .update({ status })
      .eq('id', appId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Application status updated");
      fetchData();
    }
  };

  const downloadApplicationPackage = async (app: any) => {
    try {
      toast.loading("Preparing application package...");
      
      // Fetch teacher feedback
      const { data: feedback } = await supabase
        .from('teacher_feedback')
        .select('*, profiles!teacher_feedback_teacher_id_fkey(full_name)')
        .eq('student_id', app.student_id);

      // Fetch certificates
      const { data: certificates } = await supabase
        .from('certificates')
        .select('*, courses(title)')
        .eq('student_id', app.student_id);

      // Generate recommendation letter
      const letterContent = generateRecommendationLetter(app, feedback);
      
      // Create downloadable content
      let packageContent = `APPLICATION PACKAGE FOR ${app.profiles?.full_name}\n`;
      packageContent += `================================================\n\n`;
      packageContent += `JOB ROLE: ${app.job_roles?.title}\n`;
      packageContent += `COMPANY: ${app.job_roles?.companies?.name}\n`;
      packageContent += `APPLICATION DATE: ${new Date(app.applied_at).toLocaleDateString()}\n`;
      packageContent += `STATUS: ${app.status}\n\n`;
      
      if (app.resume_url) {
        packageContent += `RESUME: ${app.resume_url}\n\n`;
      }

      if (app.cover_letter) {
        packageContent += `COVER LETTER:\n${app.cover_letter}\n\n`;
      }

      if (feedback && feedback.length > 0) {
        packageContent += `TEACHER REVIEWS:\n`;
        packageContent += `================================================\n`;
        feedback.forEach((f: any) => {
          packageContent += `Teacher: ${f.profiles?.full_name}\n`;
          packageContent += `Rating: ${f.rating}/5\n`;
          packageContent += `Technical Skills: ${f.technical_skills || 'N/A'}\n`;
          packageContent += `Soft Skills: ${f.soft_skills || 'N/A'}\n`;
          packageContent += `Strengths: ${f.strengths || 'N/A'}\n`;
          packageContent += `Areas for Improvement: ${f.areas_for_improvement || 'N/A'}\n`;
          packageContent += `Recommendation: ${f.recommendation || 'N/A'}\n\n`;
        });
      }

      if (certificates && certificates.length > 0) {
        packageContent += `CERTIFICATES:\n`;
        packageContent += `================================================\n`;
        certificates.forEach((cert: any) => {
          packageContent += `Course: ${cert.courses?.title}\n`;
          packageContent += `Issued: ${new Date(cert.issued_at).toLocaleDateString()}\n`;
          if (cert.certificate_url) {
            packageContent += `Certificate URL: ${cert.certificate_url}\n`;
          }
          packageContent += `\n`;
        });
      }

      packageContent += `\n\nLETTER OF RECOMMENDATION:\n`;
      packageContent += `================================================\n`;
      packageContent += letterContent;

      // Save recommendation letter URL to database
      await supabase
        .from('student_applications')
        .update({ 
          recommendation_letter_url: 'generated',
          recommendation_generated_at: new Date().toISOString()
        })
        .eq('id', app.id);

      // Download as text file
      const blob = new Blob([packageContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `application_package_${app.profiles?.full_name?.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("Application package downloaded");
      fetchData();
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate package");
      console.error(error);
    }
  };

  const generateRecommendationLetter = (app: any, feedback: any[]) => {
    const studentName = app.profiles?.full_name || 'Student';
    const companyName = app.job_roles?.companies?.name || 'Company';
    const position = app.job_roles?.title || 'Position';
    
    let letter = `To Whom It May Concern,\n\n`;
    letter += `I am pleased to recommend ${studentName} for the position of ${position} at ${companyName}.\n\n`;
    
    if (feedback && feedback.length > 0) {
      letter += `${studentName} has been an outstanding student in our program, earning high praise from multiple instructors:\n\n`;
      
      feedback.forEach((f: any, index: number) => {
        const teacherName = f.profiles?.full_name || 'Instructor';
        letter += `${teacherName} rated ${studentName} ${f.rating}/5 and noted:\n`;
        if (f.strengths) {
          letter += `- Strengths: ${f.strengths}\n`;
        }
        if (f.recommendation) {
          letter += `- Recommendation: ${f.recommendation}\n`;
        }
        letter += `\n`;
      });
    }

    letter += `Based on their performance and dedication, I strongly recommend ${studentName} for this opportunity. They have demonstrated the skills, commitment, and professionalism that would make them a valuable asset to your organization.\n\n`;
    letter += `Please feel free to contact us if you require any additional information.\n\n`;
    letter += `Sincerely,\n`;
    letter += `Academic Administration\n`;
    letter += `Date: ${new Date().toLocaleDateString()}\n`;
    
    return letter;
  };

  const handleUploadCompanyResponse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const responseUrl = formData.get('response_url') as string;

      if (!responseUrl || !selectedApplication) {
        toast.error("Please provide the company response letter URL");
        return;
      }

      const { error } = await supabase
        .from('student_applications')
        .update({
          company_response_letter_url: responseUrl,
          company_response_uploaded_at: new Date().toISOString()
        })
        .eq('id', selectedApplication.id);

      if (error) throw error;

      toast.success("Company response letter uploaded successfully");
      setShowUploadDialog(false);
      setSelectedApplication(null);
      fetchData();
    } catch (error) {
      console.error('Error uploading company response:', error);
      toast.error('Failed to upload company response');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Job Roles</CardTitle>
            <Briefcase className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobRoles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Users className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(a => a.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
              <DialogDescription>Create a new company for placement assistance</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" type="url" />
              </div>
              <Button type="submit">Create Company</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Job Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Job Role</DialogTitle>
              <DialogDescription>Create a new job opening</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience_level">Experience Level</Label>
                <Select name="experience_level" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary_min">Min Salary</Label>
                  <Input id="salary_min" name="salary_min" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_max">Max Salary</Label>
                  <Input id="salary_max" name="salary_max" type="number" />
                </div>
              </div>
              <Button type="submit">Create Job Role</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Manage student applications for placement</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Job Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Download</TableHead>
                <TableHead>Company Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>{app.profiles?.full_name}</TableCell>
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
                        View
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
                    <Select value={app.status} onValueChange={(value) => updateApplicationStatus(app.id, value)}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="selected">Selected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {app.status === 'shortlisted' || app.status === 'selected' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadApplicationPackage(app)}
                      >
                        <Package className="h-4 w-4 mr-1" />
                        Package
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {app.company_response_letter_url ? (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(app.company_response_letter_url, '_blank')}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(app);
                            setShowUploadDialog(true);
                          }}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApplication(app);
                          setShowUploadDialog(true);
                        }}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Company Response Letter</DialogTitle>
            <DialogDescription>
              Upload the company's acceptance letter, interview invitation, or response
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="p-3 border rounded-lg bg-muted/50 text-sm">
                <div><strong>Student:</strong> {selectedApplication.profiles?.full_name}</div>
                <div><strong>Job Role:</strong> {selectedApplication.job_roles?.title}</div>
                <div><strong>Company:</strong> {selectedApplication.job_roles?.companies?.name}</div>
              </div>

              <form onSubmit={handleUploadCompanyResponse} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="response_url">Company Response Letter URL *</Label>
                  <Input
                    id="response_url"
                    name="response_url"
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    defaultValue={selectedApplication.company_response_letter_url || ''}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a publicly accessible URL (Google Drive, Dropbox, etc.)
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={uploading}>
                    {uploading ? "Uploading..." : selectedApplication.company_response_letter_url ? "Update Letter" : "Upload Letter"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowUploadDialog(false);
                      setSelectedApplication(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

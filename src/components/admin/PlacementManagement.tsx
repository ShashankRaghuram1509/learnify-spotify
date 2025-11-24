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
import { Plus, Building2, Briefcase, Users, FileText } from "lucide-react";

export default function PlacementManagement() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>("");

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
    const { data: companiesData } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
    const { data: jobsData } = await supabase.from('job_roles').select('*, companies(name)').order('created_at', { ascending: false });
    const { data: appsData } = await supabase
      .from('student_applications')
      .select('*, job_roles(title, companies(name)), profiles(full_name, email)')
      .order('applied_at', { ascending: false });

    setCompanies(companiesData || []);
    setJobRoles(jobsData || []);
    setApplications(appsData || []);
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
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

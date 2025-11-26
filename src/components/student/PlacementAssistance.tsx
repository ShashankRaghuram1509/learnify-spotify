import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Briefcase, Building2, DollarSign, Clock, Lock, Download, FileCheck, ExternalLink, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PlacementAssistance() {
  const { user, subscriptionTier, subscriptionExpiresAt } = useAuth();
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [externalJobs, setExternalJobs] = useState<any[]>([]);
  const [jobInterests, setJobInterests] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState("");
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);

  const hasValidSubscription = (() => {
    if (!subscriptionTier) return false;
    const valid = ["pro", "premium", "Lite", "Premium", "Premium Pro"].includes(subscriptionTier);
    if (!valid) return false;
    if (!subscriptionExpiresAt) return true;
    return new Date(subscriptionExpiresAt) > new Date();
  })();

  useEffect(() => {
    if (user && hasValidSubscription) {
      fetchData();
      fetchExternalJobs();

      const channel = supabase
        .channel('student-placement-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'job_roles' }, fetchData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'student_applications' }, fetchData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'external_job_interests' }, fetchJobInterests)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, hasValidSubscription]);

  const fetchData = async () => {
    const { data: jobs } = await supabase
      .from('job_roles')
      .select('*, companies(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    const { data: apps } = await supabase
      .from('student_applications')
      .select('*')
      .eq('student_id', user?.id);

    setJobRoles(jobs || []);
    setApplications(apps || []);
    
    await fetchJobInterests();
  };

  const fetchJobInterests = async () => {
    const { data } = await supabase
      .from('external_job_interests')
      .select('*')
      .eq('student_id', user?.id);
    
    setJobInterests(data || []);
  };

  const fetchExternalJobs = async (keywords?: string) => {
    setIsLoadingExternal(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-adzuna-jobs', {
        body: { 
          keywords: keywords || searchKeywords || '',
          location: 'India',
          results_per_page: 20
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        setExternalJobs(data.jobs || []);
        toast.success(`Found ${data.jobs?.length || 0} jobs from Adzuna`);
      } else {
        toast.error(data?.error || 'Failed to fetch external jobs');
      }
    } catch (error) {
      console.error('Error fetching external jobs:', error);
      toast.error('Failed to load external job listings');
    } finally {
      setIsLoadingExternal(false);
    }
  };

  const handleTrackInterest = async (job: any) => {
    const { error } = await supabase.from('external_job_interests').insert({
      student_id: user?.id,
      external_job_id: job.id.toString(),
      job_title: job.title,
      company_name: job.company,
      job_url: job.redirect_url,
    });

    if (error) {
      if (error.code === '23505') {
        toast.info("You've already tracked interest in this job");
      } else {
        toast.error("Failed to track interest");
      }
    } else {
      toast.success("Interest tracked! We'll notify you of updates.");
      fetchJobInterests();
    }
  };

  const hasTrackedInterest = (jobId: string) => {
    return jobInterests.some(interest => interest.external_job_id === jobId.toString());
  };

  const handleApply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from('student_applications').insert({
      student_id: user?.id,
      job_role_id: selectedJob.id,
      cover_letter: formData.get('cover_letter') as string,
      resume_url: formData.get('resume_url') as string,
    });

    if (error) {
      if (error.code === '23505') {
        toast.error("You have already applied for this role");
      } else {
        toast.error("Failed to submit application");
      }
    } else {
      toast.success("Application submitted successfully");
      setShowApplyDialog(false);
      e.currentTarget.reset();
    }
  };

  const hasApplied = (jobId: string) => {
    return applications.some(app => app.job_role_id === jobId);
  };

  const getApplicationStatus = (jobId: string) => {
    return applications.find(app => app.job_role_id === jobId)?.status;
  };

  const downloadRecommendationLetter = async (app: any) => {
    try {
      toast.loading("Generating recommendation letter...");

      // Fetch job role details
      const { data: jobRole } = await supabase
        .from('job_roles')
        .select('*, companies(name)')
        .eq('id', app.job_role_id)
        .single();

      // Fetch teacher feedback
      const { data: feedback } = await supabase
        .from('teacher_feedback')
        .select('*, profiles!teacher_feedback_teacher_id_fkey(full_name)')
        .eq('student_id', user?.id);

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      // Generate letter
      let letter = `LETTER OF RECOMMENDATION\n`;
      letter += `================================================\n\n`;
      letter += `To Whom It May Concern,\n\n`;
      letter += `This is to certify that ${profile?.full_name || 'the student'} has successfully completed our training program and has applied for the position of ${jobRole?.title} at ${jobRole?.companies?.name}.\n\n`;
      
      if (feedback && feedback.length > 0) {
        letter += `Performance Summary:\n\n`;
        feedback.forEach((f: any) => {
          const teacherName = f.profiles?.full_name || 'Instructor';
          letter += `Instructor: ${teacherName}\n`;
          letter += `Rating: ${f.rating}/5\n`;
          if (f.technical_skills) letter += `Technical Skills: ${f.technical_skills}\n`;
          if (f.soft_skills) letter += `Soft Skills: ${f.soft_skills}\n`;
          if (f.strengths) letter += `Strengths: ${f.strengths}\n`;
          if (f.recommendation) letter += `Recommendation: ${f.recommendation}\n`;
          letter += `\n`;
        });
      }

      letter += `We strongly recommend this candidate for the position and believe they will be a valuable asset to your organization.\n\n`;
      letter += `For any queries, please feel free to contact us.\n\n`;
      letter += `Sincerely,\n`;
      letter += `Academic Administration\n`;
      letter += `Date: ${new Date().toLocaleDateString()}\n`;

      // Download
      const blob = new Blob([letter], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recommendation_letter_${profile?.full_name?.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("Recommendation letter downloaded");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate letter");
      console.error(error);
    }
  };

  if (!hasValidSubscription) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Premium Feature</CardTitle>
            <CardDescription>
              Placement assistance is available only for Premium subscribers
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to Premium to access exclusive job opportunities and placement assistance
            </p>
            <Button asChild>
              <Link to="/dashboard/student/upgrade">Upgrade to Premium</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
          <CardDescription>Track your job applications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-500">
                {applications.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Applied</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-amber-500">
                {applications.filter(a => a.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-emerald-500">
                {applications.filter(a => a.status === 'shortlisted' || a.status === 'selected').length}
              </div>
              <div className="text-sm text-muted-foreground">Shortlisted/Selected</div>
            </div>
          </div>

          {applications.some(a => a.status === 'shortlisted' || a.status === 'selected') && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-3">Recommendation Letters Available</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Your application has been shortlisted! Download your recommendation letter below.
              </p>
              <div className="space-y-2">
                {applications
                  .filter(a => a.status === 'shortlisted' || a.status === 'selected')
                  .map(app => (
                    <div key={app.id} className="flex items-center justify-between p-3 border rounded bg-background">
                      <div className="flex-1">
                        <div className="text-sm font-medium">Application ID: {app.id.slice(0, 8)}...</div>
                        <div className="text-xs text-muted-foreground">Status: {app.status}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => downloadRecommendationLetter(app)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download Letter
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {applications.some(a => a.company_response_letter_url) && (
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
                <FileCheck className="h-5 w-5" />
                Company Response Letters
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                You have received response(s) from companies!
              </p>
              <div className="space-y-2">
                {applications
                  .filter(a => a.company_response_letter_url)
                  .map(app => (
                    <div key={app.id} className="flex items-center justify-between p-3 border rounded bg-background">
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          Response from company (Application: {app.id.slice(0, 8)}...)
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Uploaded: {new Date(app.company_response_uploaded_at || app.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => window.open(app.company_response_letter_url, '_blank')}
                      >
                        <FileCheck className="h-4 w-4 mr-1" />
                        View Letter
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Available Opportunities</h2>
          <div className="flex gap-2">
            <Input 
              placeholder="Search jobs (e.g., developer, designer)" 
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              className="w-64"
            />
            <Button onClick={() => fetchExternalJobs(searchKeywords)} disabled={isLoadingExternal}>
              {isLoadingExternal ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Jobs ({jobRoles.length + externalJobs.length})</TabsTrigger>
            <TabsTrigger value="internal">Our Partners ({jobRoles.length})</TabsTrigger>
            <TabsTrigger value="external">External Jobs ({externalJobs.length})</TabsTrigger>
            <TabsTrigger value="interested">Tracked ({jobInterests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {jobRoles.map((job) => (
                <Card key={`internal-${job.id}`} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <Badge variant="secondary">Partner</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          {job.companies?.name}
                        </div>
                      </div>
                      {hasApplied(job.id) && (
                        <Badge variant={
                          getApplicationStatus(job.id) === 'selected' ? 'default' :
                          getApplicationStatus(job.id) === 'shortlisted' ? 'secondary' :
                          getApplicationStatus(job.id) === 'rejected' ? 'destructive' : 'outline'
                        }>
                          {getApplicationStatus(job.id)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{job.experience_level} Level</span>
                      </div>
                      {job.salary_min && job.salary_max && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>₹{job.salary_min.toLocaleString()} - ₹{job.salary_max.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Dialog open={showApplyDialog && selectedJob?.id === job.id} onOpenChange={(open) => {
                      setShowApplyDialog(open);
                      if (open) setSelectedJob(job);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full" 
                          disabled={hasApplied(job.id)}
                        >
                          {hasApplied(job.id) ? 'Already Applied' : 'Apply Now'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Apply for {job.title}</DialogTitle>
                          <DialogDescription>{job.companies?.name}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleApply} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="resume_url">Resume URL</Label>
                            <input
                              id="resume_url"
                              name="resume_url"
                              type="url"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              placeholder="https://..."
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cover_letter">Cover Letter</Label>
                            <Textarea
                              id="cover_letter"
                              name="cover_letter"
                              placeholder="Tell us why you're a great fit..."
                              rows={6}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full">Submit Application</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
              
              {externalJobs.map((job) => (
                <Card key={`external-${job.id}`} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <Badge variant="outline">Adzuna</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          {job.company}
                        </div>
                        <div className="text-xs text-muted-foreground">{job.location}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {job.description?.replace(/<[^>]*>/g, '').substring(0, 200)}...
                    </p>
                    
                    <div className="space-y-2">
                      {job.category && (
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{job.category}</span>
                        </div>
                      )}
                      {job.salary_min && job.salary_max && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>₹{job.salary_min.toLocaleString()} - ₹{job.salary_max.toLocaleString()}</span>
                        </div>
                      )}
                      {job.created && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(job.created).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => window.open(job.redirect_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Apply on Site
                      </Button>
                      <Button 
                        variant={hasTrackedInterest(job.id) ? "secondary" : "outline"}
                        onClick={() => handleTrackInterest(job)}
                        disabled={hasTrackedInterest(job.id)}
                      >
                        <Heart className={`h-4 w-4 ${hasTrackedInterest(job.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="internal" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {jobRoles.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      {job.companies?.name}
                    </div>
                  </div>
                  {hasApplied(job.id) && (
                    <Badge variant={
                      getApplicationStatus(job.id) === 'selected' ? 'default' :
                      getApplicationStatus(job.id) === 'shortlisted' ? 'secondary' :
                      getApplicationStatus(job.id) === 'rejected' ? 'destructive' : 'outline'
                    }>
                      {getApplicationStatus(job.id)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {job.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{job.experience_level} Level</span>
                  </div>
                  {job.salary_min && job.salary_max && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>₹{job.salary_min.toLocaleString()} - ₹{job.salary_max.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <Dialog open={showApplyDialog && selectedJob?.id === job.id} onOpenChange={(open) => {
                  setShowApplyDialog(open);
                  if (open) setSelectedJob(job);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      disabled={hasApplied(job.id)}
                    >
                      {hasApplied(job.id) ? 'Already Applied' : 'Apply Now'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply for {job.title}</DialogTitle>
                      <DialogDescription>{job.companies?.name}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleApply} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="resume_url">Resume URL</Label>
                        <input
                          id="resume_url"
                          name="resume_url"
                          type="url"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="https://..."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cover_letter">Cover Letter</Label>
                        <Textarea
                          id="cover_letter"
                          name="cover_letter"
                          placeholder="Tell us why you're a great fit..."
                          rows={6}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">Submit Application</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="external" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {externalJobs.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  <p>Use the search above to find jobs from Adzuna</p>
                </div>
              ) : (
                externalJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            {job.company}
                          </div>
                          <div className="text-xs text-muted-foreground">{job.location}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {job.description?.replace(/<[^>]*>/g, '').substring(0, 200)}...
                      </p>
                      
                      <div className="space-y-2">
                        {job.category && (
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>{job.category}</span>
                          </div>
                        )}
                        {job.salary_min && job.salary_max && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>₹{job.salary_min.toLocaleString()} - ₹{job.salary_max.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          onClick={() => window.open(job.redirect_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Apply on Site
                        </Button>
                        <Button 
                          variant={hasTrackedInterest(job.id) ? "secondary" : "outline"}
                          onClick={() => handleTrackInterest(job)}
                          disabled={hasTrackedInterest(job.id)}
                        >
                          <Heart className={`h-4 w-4 ${hasTrackedInterest(job.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="interested" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {jobInterests.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  <p>You haven't tracked interest in any external jobs yet</p>
                </div>
              ) : (
                jobInterests.map((interest) => (
                  <Card key={interest.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{interest.job_title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        {interest.company_name}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Heart className="h-4 w-4 fill-current" />
                        <span>Tracked on {new Date(interest.interested_at).toLocaleDateString()}</span>
                      </div>
                      {interest.job_url && (
                        <Button 
                          className="w-full" 
                          onClick={() => window.open(interest.job_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Job
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

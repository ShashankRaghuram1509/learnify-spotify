import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, CheckCircle, Clock, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ViewSubmissionsProps {
  assignmentId: string;
}

export default function ViewSubmissions({ assignmentId }: ViewSubmissionsProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradingSubmission, setGradingSubmission] = useState<any>(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // First get submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("assignment_submissions")
        .select("*")
        .eq("assignment_id", assignmentId)
        .order("created_at", { ascending: false });

      if (submissionsError) {
        console.error("Error fetching submissions:", submissionsError);
        throw submissionsError;
      }

      // Then get student profiles for those submissions
      if (submissionsData && submissionsData.length > 0) {
        const studentIds = submissionsData.map(sub => sub.student_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", studentIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
        }

        // Merge profiles with submissions
        const mergedData = submissionsData.map(submission => ({
          ...submission,
          profiles: profilesData?.find(p => p.id === submission.student_id) || null
        }));

        console.log("Fetched submissions with profiles:", mergedData);
        setSubmissions(mergedData);
      } else {
        setSubmissions([]);
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error("Failed to load submissions: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async () => {
    if (!gradingSubmission) return;

    try {
      const { error } = await supabase
        .from("assignment_submissions")
        .update({
          marks_obtained: parseInt(marks),
          feedback,
          status: "graded",
          graded_at: new Date().toISOString(),
        })
        .eq("id", gradingSubmission.id);

      if (error) throw error;

      toast.success("Submission graded successfully");
      setGradingSubmission(null);
      fetchSubmissions();
    } catch (error: any) {
      toast.error("Failed to grade submission");
    }
  };

  const getProctoringLogs = async (submissionId: string) => {
    const { data } = await supabase
      .from("proctoring_logs")
      .select("*")
      .eq("submission_id", submissionId)
      .order("timestamp", { ascending: true });
    return data || [];
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: Clock },
      submitted: { variant: "default", icon: CheckCircle },
      graded: { variant: "outline", icon: CheckCircle },
      late: { variant: "destructive", icon: AlertCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading submissions...</div>;
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No submissions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">{submission.profiles?.full_name || "Student"}</p>
                <p className="text-sm text-muted-foreground">{submission.profiles?.email}</p>
                {submission.submitted_at && (
                  <p className="text-xs text-muted-foreground">
                    Submitted: {new Date(submission.submitted_at).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(submission.status)}
                {submission.marks_obtained !== null && (
                  <Badge variant="outline">
                    {submission.marks_obtained} marks
                  </Badge>
                )}
                {submission.submission_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={submission.submission_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </a>
                  </Button>
                )}
                {submission.status === "submitted" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setGradingSubmission(submission);
                      setMarks("");
                      setFeedback(submission.feedback || "");
                    }}
                  >
                    Grade
                  </Button>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Submission Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {submission.submission_text && (
                        <div>
                          <Label>Answer</Label>
                          <p className="mt-1 text-sm whitespace-pre-wrap">{submission.submission_text}</p>
                        </div>
                      )}
                      {submission.feedback && (
                        <div>
                          <Label>Feedback</Label>
                          <p className="mt-1 text-sm">{submission.feedback}</p>
                        </div>
                      )}
                      {submission.time_taken_minutes && (
                        <p className="text-sm text-muted-foreground">
                          Time taken: {submission.time_taken_minutes} minutes
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {gradingSubmission && (
        <Dialog open={!!gradingSubmission} onOpenChange={() => setGradingSubmission(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grade Submission</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="marks">Marks Obtained</Label>
                <Input
                  id="marks"
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  placeholder="Enter marks"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  placeholder="Enter feedback for the student"
                />
              </div>
              <Button onClick={handleGrade} className="w-full">
                Submit Grade
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

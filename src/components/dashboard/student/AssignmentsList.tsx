import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Clock, Award, AlertCircle, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import TakeTest from "./TakeTest";
import SubmitAssignment from "./SubmitAssignment";

export default function AssignmentsList() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Get enrolled courses
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", user.id);

      if (!enrollments || enrollments.length === 0) {
        setAssignments([]);
        return;
      }

      const courseIds = enrollments.map((e) => e.course_id);

      // Get assignments for enrolled courses
      const { data: assignmentsData, error } = await supabase
        .from("assignments")
        .select(`
          *,
          courses(title),
          assignment_submissions!left(
            id,
            status,
            marks_obtained,
            feedback,
            submitted_at
          )
        `)
        .in("course_id", courseIds)
        .order("due_date", { ascending: true });

      if (error) throw error;

      // Filter to only show submissions for current user
      const processedData = assignmentsData?.map((assignment) => {
        const userSubmission = assignment.assignment_submissions?.find(
          (sub: any) => sub.id === user.id
        );
        return {
          ...assignment,
          submission: userSubmission || null,
        };
      });

      setAssignments(processedData || []);
    } catch (error: any) {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const canAttempt = (assignment: any) => {
    if (assignment.submission?.status === "submitted" || assignment.submission?.status === "graded") {
      return false;
    }
    if (isOverdue(assignment.due_date) && !assignment.allow_late_submission) {
      return false;
    }
    return true;
  };

  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No assignments available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{assignment.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {assignment.courses?.title}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant={assignment.type === "test" ? "default" : "secondary"}>
                  {assignment.type}
                </Badge>
                {assignment.submission?.status && (
                  <Badge
                    variant={
                      assignment.submission.status === "graded"
                        ? "outline"
                        : assignment.submission.status === "submitted"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {assignment.submission.status}
                  </Badge>
                )}
                {isOverdue(assignment.due_date) && !assignment.submission && (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">{assignment.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Due: {new Date(assignment.due_date).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{assignment.total_marks} marks</span>
                </div>
                {assignment.type === "test" && assignment.duration_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{assignment.duration_minutes} min</span>
                  </div>
                )}
              </div>

              {assignment.submission?.marks_obtained !== null && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    Score: {assignment.submission.marks_obtained}/{assignment.total_marks}
                  </p>
                  {assignment.submission.feedback && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Feedback: {assignment.submission.feedback}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {canAttempt(assignment) && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedAssignment(assignment)}>
                        {assignment.type === "test" ? "Start Test" : "Submit Assignment"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{assignment.title}</DialogTitle>
                      </DialogHeader>
                      {selectedAssignment && assignment.type === "test" ? (
                        <TakeTest assignment={selectedAssignment} onComplete={fetchAssignments} />
                      ) : (
                        <SubmitAssignment assignment={selectedAssignment} onSuccess={fetchAssignments} />
                      )}
                    </DialogContent>
                  </Dialog>
                )}
                {assignment.attachment_url && (
                  <Button variant="outline" asChild>
                    <a href={assignment.attachment_url} target="_blank" rel="noopener noreferrer">
                      <Eye className="w-4 h-4 mr-2" />
                      View Attachment
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

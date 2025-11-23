import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import useProctoring from "@/hooks/useProctoring";

interface TakeTestProps {
  assignment: any;
  onComplete: () => void;
}

export default function TakeTest({ assignment, onComplete }: TakeTestProps) {
  const { user } = useAuth();
  const [answer, setAnswer] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(assignment.duration_minutes * 60);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { violations, startProctoring, stopProctoring } = useProctoring(
    submissionId,
    assignment.proctoring_enabled
  );

  useEffect(() => {
    if (!started || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, timeRemaining]);

  const handleStart = async () => {
    if (!user) return;

    try {
      // Create submission record
      const { data: submission, error } = await supabase
        .from("assignment_submissions")
        .insert({
          assignment_id: assignment.id,
          student_id: user.id,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      setSubmissionId(submission.id);
      setStarted(true);

      // Start proctoring if enabled
      if (assignment.proctoring_enabled) {
        startProctoring();
      }

      toast.success("Test started. Good luck!");
    } catch (error: any) {
      toast.error("Failed to start test");
    }
  };

  const handleAutoSubmit = useCallback(async () => {
    if (!submissionId) return;
    await submitTest(true);
  }, [submissionId, answer]);

  const submitTest = async (auto = false) => {
    if (!submissionId || submitting) return;

    try {
      setSubmitting(true);
      stopProctoring();

      const timeTaken = assignment.duration_minutes - Math.floor(timeRemaining / 60);

      const { error } = await supabase
        .from("assignment_submissions")
        .update({
          submission_text: answer,
          status: "submitted",
          submitted_at: new Date().toISOString(),
          time_taken_minutes: timeTaken,
        })
        .eq("id", submissionId);

      if (error) throw error;

      toast.success(auto ? "Test auto-submitted (time's up)" : "Test submitted successfully");
      onComplete();
    } catch (error: any) {
      toast.error("Failed to submit test");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((assignment.duration_minutes * 60 - timeRemaining) / (assignment.duration_minutes * 60)) * 100;

  if (!started) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Before you start:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Duration: {assignment.duration_minutes} minutes</li>
              <li>Total marks: {assignment.total_marks}</li>
              <li>You cannot pause or restart the test</li>
              {assignment.proctoring_enabled && (
                <li className="text-yellow-600 font-medium">
                  This test is proctored. Your activity will be monitored.
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>

        {assignment.instructions && (
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <p className="text-sm whitespace-pre-wrap">{assignment.instructions}</p>
          </div>
        )}

        <Button onClick={handleStart} className="w-full" size="lg">
          Start Test
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <span className="font-semibold text-lg">{formatTime(timeRemaining)}</span>
        </div>
        {assignment.proctoring_enabled && (
          <div className="flex items-center gap-2 text-yellow-600">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">Proctored</span>
          </div>
        )}
      </div>

      <Progress value={progress} className="h-2" />

      {violations > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {violations} suspicious activities detected. Your teacher will be notified.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Your Answer</label>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={15}
          placeholder="Type your answer here..."
          className="resize-none"
        />
      </div>

      <Button
        onClick={() => submitTest(false)}
        disabled={submitting || !answer.trim()}
        className="w-full"
        size="lg"
      >
        {submitting ? "Submitting..." : "Submit Test"}
      </Button>
    </div>
  );
}

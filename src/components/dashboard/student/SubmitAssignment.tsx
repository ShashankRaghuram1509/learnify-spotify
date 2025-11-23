import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface SubmitAssignmentProps {
  assignment: any;
  onSuccess: () => void;
}

export default function SubmitAssignment({ assignment, onSuccess }: SubmitAssignmentProps) {
  const { user } = useAuth();
  const [answer, setAnswer] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileUrl, setFileUrl] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `submissions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("course-materials")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("course-materials")
        .getPublicUrl(filePath);

      setFileUrl(publicUrl);
      toast.success("File uploaded successfully");
    } catch (error: any) {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!answer.trim() && !fileUrl) {
      toast.error("Please provide an answer or upload a file");
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from("assignment_submissions").insert({
        assignment_id: assignment.id,
        student_id: user.id,
        submission_text: answer,
        submission_url: fileUrl,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Assignment submitted successfully");
      onSuccess();
    } catch (error: any) {
      toast.error("Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {assignment.instructions && (
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <p className="text-sm whitespace-pre-wrap">{assignment.instructions}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label>Written Answer (Optional)</Label>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={10}
          placeholder="Type your answer here..."
        />
      </div>

      <div className="space-y-2">
        <Label>Upload File (Optional)</Label>
        <div className="relative">
          <Input
            type="file"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={uploading}
          />
          <Button type="button" variant="outline" className="w-full" disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
            {fileUrl ? "File Uploaded" : "Upload File"}
          </Button>
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={submitting} className="w-full" size="lg">
        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Submit Assignment
      </Button>
    </div>
  );
}

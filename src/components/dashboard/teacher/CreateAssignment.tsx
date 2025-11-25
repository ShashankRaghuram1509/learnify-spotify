import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, CalendarIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface CreateAssignmentProps {
  onSuccess: () => void;
}

export default function CreateAssignment({ onSuccess }: CreateAssignmentProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [attachmentType, setAttachmentType] = useState<"file" | "google-form">("file");
  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    description: "",
    type: "assignment",
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    total_marks: 100,
    duration_minutes: 60,
    instructions: "",
    attachment_url: "",
    allow_late_submission: false,
    proctoring_enabled: false,
  });

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("courses")
      .select("id, title")
      .eq("teacher_id", user.id);
    setCourses(data || []);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `assignments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("course-materials")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("course-materials")
        .getPublicUrl(filePath);

      setFormData({ ...formData, attachment_url: publicUrl });
      toast.success("File uploaded successfully");
    } catch (error: any) {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabase.from("assignments").insert({
        ...formData,
        teacher_id: user.id,
        due_date: formData.due_date.toISOString(),
      });

      if (error) throw error;

      toast.success("Assignment created successfully");
      onSuccess();
    } catch (error: any) {
      toast.error("Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Course</Label>
        <Select
          value={formData.course_id}
          onValueChange={(value) => setFormData({ ...formData, course_id: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course: any) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Type</Label>
        <RadioGroup
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="assignment" id="assignment" />
            <Label htmlFor="assignment">Assignment</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="test" id="test" />
            <Label htmlFor="test">Test</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          id="instructions"
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(formData.due_date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.due_date}
                onSelect={(date) => date && setFormData({ ...formData, due_date: date })}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_marks">Total Marks</Label>
          <Input
            id="total_marks"
            type="number"
            value={formData.total_marks}
            onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      {formData.type === "test" && (
        <div className="space-y-2">
          <Label htmlFor="duration_minutes">Duration (minutes)</Label>
          <Input
            id="duration_minutes"
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
          />
        </div>
      )}

      <div className="space-y-4">
        <Label>Attachment Type (Optional)</Label>
        <RadioGroup
          value={attachmentType}
          onValueChange={(value: "file" | "google-form") => {
            setAttachmentType(value);
            setFormData({ ...formData, attachment_url: "" });
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="file" id="file" />
            <Label htmlFor="file">Upload File</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="google-form" id="google-form" />
            <Label htmlFor="google-form">Google Form</Label>
          </div>
        </RadioGroup>

        {attachmentType === "file" ? (
          <div className="relative">
            <Input
              type="file"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <Button type="button" variant="outline" className="w-full" disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              {formData.attachment_url ? "File Uploaded" : "Upload File"}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="google-form-url">Google Form URL</Label>
            <Input
              id="google-form-url"
              type="url"
              placeholder="https://docs.google.com/forms/d/e/..."
              value={formData.attachment_url}
              onChange={(e) => setFormData({ ...formData, attachment_url: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Paste the Google Form URL or embed link. Students will be able to access it directly from the assignment.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="allow_late">Allow Late Submission</Label>
        <Switch
          id="allow_late"
          checked={formData.allow_late_submission}
          onCheckedChange={(checked) => setFormData({ ...formData, allow_late_submission: checked })}
        />
      </div>

      {formData.type === "test" && (
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="proctoring">Enable Proctoring</Label>
            <p className="text-sm text-muted-foreground">Monitor student activity during test</p>
          </div>
          <Switch
            id="proctoring"
            checked={formData.proctoring_enabled}
            onCheckedChange={(checked) => setFormData({ ...formData, proctoring_enabled: checked })}
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Create {formData.type === "test" ? "Test" : "Assignment"}
      </Button>
    </form>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Link as LinkIcon, FileText, Video, File } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MaterialsUploadProps {
  courseId: string;
  onUploadComplete?: () => void;
}

export default function MaterialsUpload({ courseId, onUploadComplete }: MaterialsUploadProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resourceType, setResourceType] = useState<string>("pdf");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Check file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error("File size exceeds 50MB limit. Please choose a smaller file.");
        e.target.value = ""; // Clear the input
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !resourceType) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (resourceType === "link" && !url) {
      toast.error("Please provide a URL");
      return;
    }

    if (resourceType !== "link" && !file) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploading(true);

    try {
      let fileData = null;
      let fileName = null;
      let mimeType = null;

      if (file) {
        // Convert file to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]); // Remove data:... prefix
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        fileData = await base64Promise;
        fileName = file.name;
        mimeType = file.type;
      }

      const { data, error } = await supabase.functions.invoke('upload-to-drive', {
        body: {
          course_id: courseId,
          title,
          description,
          resource_type: resourceType,
          file_data: fileData,
          file_name: fileName,
          mime_type: mimeType,
          url: resourceType === "link" ? url : null,
        }
      });

      if (error) throw error;

      toast.success("Material uploaded successfully!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setResourceType("pdf");
      setUrl("");
      setFile(null);
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload material");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Course Materials
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Week 1 Lecture Notes"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the material"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Resource Type *</Label>
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Document
                  </div>
                </SelectItem>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video (MP4)
                  </div>
                </SelectItem>
                <SelectItem value="link">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    External Link
                  </div>
                </SelectItem>
                <SelectItem value="document">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    Other Document
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {resourceType === "link" ? (
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/resource"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="file">File *</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept={
                  resourceType === "pdf" ? ".pdf" :
                  resourceType === "video" ? ".mp4,.mov,.avi" :
                  "*"
                }
                required
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Maximum file size: 50MB
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Material"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
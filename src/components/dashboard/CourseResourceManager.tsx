import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Link as LinkIcon, Video, FileText, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Resource {
  id: string;
  title: string;
  resource_type: string;
  url: string | null;
  file_path: string | null;
  description: string | null;
}

interface CourseResourceManagerProps {
  courseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CourseResourceManager({
  courseId,
  open,
  onOpenChange,
}: CourseResourceManagerProps) {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    resource_type: "pdf",
    description: "",
    url: "",
    file: null as File | null,
  });

  useEffect(() => {
    if (open && courseId) {
      fetchResources();
    }
  }, [open, courseId]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from("course_resources")
        .select("*")
        .eq("course_id", courseId)
        .order("position");

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Failed to load resources");
    }
  };

  const handleFileUpload = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${user?.id}/${courseId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("course-materials")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("course-materials")
      .getPublicUrl(filePath);

    return { filePath, publicUrl };
  };

  const handleAddResource = async () => {
    setUploading(true);
    try {
      let filePath = null;
      let url = newResource.url;

      // If it's a file upload (PDF or video)
      if (newResource.file && (newResource.resource_type === "pdf" || newResource.resource_type === "video")) {
        const uploadResult = await handleFileUpload(newResource.file);
        filePath = uploadResult.filePath;
        url = uploadResult.publicUrl;
      }

      const { error } = await supabase.from("course_resources").insert({
        course_id: courseId,
        title: newResource.title,
        resource_type: newResource.resource_type,
        description: newResource.description,
        url: url || null,
        file_path: filePath,
      });

      if (error) throw error;

      toast.success("Resource added successfully!");
      setNewResource({
        title: "",
        resource_type: "pdf",
        description: "",
        url: "",
        file: null,
      });
      fetchResources();
    } catch (error) {
      console.error("Error adding resource:", error);
      toast.error("Failed to add resource");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResource = async (resourceId: string, filePath: string | null) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      // Delete file from storage if it exists
      if (filePath) {
        await supabase.storage.from("course-materials").remove([filePath]);
      }

      const { error } = await supabase
        .from("course_resources")
        .delete()
        .eq("id", resourceId);

      if (error) throw error;

      toast.success("Resource deleted successfully!");
      fetchResources();
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error("Failed to delete resource");
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "article_link":
      case "video_link":
        return <LinkIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Course Resources</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Resource Form */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Resource Type</Label>
                  <Select
                    value={newResource.resource_type}
                    onValueChange={(value) =>
                      setNewResource({ ...newResource, resource_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="video">Video Upload</SelectItem>
                      <SelectItem value="video_link">Video Link (YouTube, etc.)</SelectItem>
                      <SelectItem value="article_link">Article/Resource Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newResource.title}
                    onChange={(e) =>
                      setNewResource({ ...newResource, title: e.target.value })
                    }
                    placeholder="Resource title"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={newResource.description}
                  onChange={(e) =>
                    setNewResource({ ...newResource, description: e.target.value })
                  }
                  placeholder="Brief description of the resource"
                  rows={2}
                />
              </div>

              {(newResource.resource_type === "video_link" ||
                newResource.resource_type === "article_link") && (
                <div>
                  <Label>URL</Label>
                  <Input
                    type="url"
                    value={newResource.url}
                    onChange={(e) =>
                      setNewResource({ ...newResource, url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
              )}

              {(newResource.resource_type === "pdf" ||
                newResource.resource_type === "video") && (
                <div>
                  <Label>Upload File</Label>
                  <Input
                    type="file"
                    accept={
                      newResource.resource_type === "pdf"
                        ? ".pdf"
                        : "video/*"
                    }
                    onChange={(e) =>
                      setNewResource({
                        ...newResource,
                        file: e.target.files?.[0] || null,
                      })
                    }
                  />
                </div>
              )}

              <Button
                onClick={handleAddResource}
                disabled={
                  uploading ||
                  !newResource.title ||
                  (newResource.resource_type === "pdf" && !newResource.file) ||
                  (newResource.resource_type === "video" && !newResource.file) ||
                  ((newResource.resource_type === "video_link" ||
                    newResource.resource_type === "article_link") &&
                    !newResource.url)
                }
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Add Resource
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Resources List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Existing Resources</h3>
            {loading ? (
              <div className="text-center py-4">Loading resources...</div>
            ) : resources.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No resources added yet
              </div>
            ) : (
              <div className="space-y-3">
                {resources.map((resource) => (
                  <Card key={resource.id}>
                    <CardContent className="py-4 px-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getResourceIcon(resource.resource_type)}
                        <div>
                          <p className="font-medium">{resource.title}</p>
                          {resource.description && (
                            <p className="text-sm text-muted-foreground">
                              {resource.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground capitalize">
                            {resource.resource_type.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          handleDeleteResource(resource.id, resource.file_path)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

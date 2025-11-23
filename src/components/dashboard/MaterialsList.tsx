import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Video, Link as LinkIcon, File, ExternalLink, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Material {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  url: string | null;
  created_at: string;
}

interface MaterialsListProps {
  courseId: string;
  isTeacher?: boolean;
  refreshTrigger?: number;
}

export default function MaterialsList({ courseId, isTeacher = false, refreshTrigger }: MaterialsListProps) {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, [courseId, refreshTrigger]);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from("course_resources")
        .select("*")
        .eq("course_id", courseId)
        .order("position", { ascending: true });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error: any) {
      console.error("Error fetching materials:", error);
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return;

    try {
      const { error } = await supabase
        .from("course_resources")
        .delete()
        .eq("id", materialId);

      if (error) throw error;
      
      toast.success("Material deleted successfully");
      fetchMaterials();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Failed to delete material");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "video":
        return <Video className="h-5 w-5 text-blue-500" />;
      case "link":
        return <LinkIcon className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">Loading materials...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Materials</CardTitle>
      </CardHeader>
      <CardContent>
        {materials.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No materials available yet
          </p>
        ) : (
          <div className="space-y-3">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  {getIcon(material.resource_type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{material.title}</h4>
                    {material.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {material.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(material.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {material.url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(material.url!, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open
                    </Button>
                  )}
                  {isTeacher && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(material.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
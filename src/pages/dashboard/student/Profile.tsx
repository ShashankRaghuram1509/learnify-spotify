import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Upload, Edit2, Save, X, FileText, Loader2, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, subscriptionTier } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    college: "",
    address: "",
    phone: "",
    email: "",
    interests: [] as string[],
    resume_url: "",
    resume_text: "",
    linkedin_url: "",
  });

  const isPremium = subscriptionTier && ["Lite", "Premium", "Premium Pro"].includes(subscriptionTier);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          college: data.college || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || user.email || "",
          interests: (data.interests as string[]) || [],
          resume_url: data.resume_url || "",
          resume_text: data.resume_text || "",
          linkedin_url: data.linkedin_url || "",
        });
      }
    } catch (error: any) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          college: profile.college,
          address: profile.address,
          phone: profile.phone,
          linkedin_url: profile.linkedin_url,
          interests: profile.interests,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("course-materials")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("course-materials")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          resume_url: publicUrl,
          resume_text: `Resume uploaded: ${file.name}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, resume_url: publicUrl, resume_text: `Resume uploaded: ${file.name}` });
      toast.success("Resume uploaded successfully");
    } catch (error: any) {
      toast.error("Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  if (loading && !profile.email) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isPremium ? "border-2 border-yellow-500/50 shadow-xl shadow-yellow-500/20" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>My Profile</CardTitle>
            {isPremium && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={() => setIsEditing(false)} size="sm" variant="outline">
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            readOnly={!isEditing}
            className={!isEditing ? "bg-muted" : ""}
          />
        </div>

        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input
            value={profile.email}
            readOnly
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
        </div>

        <div className="space-y-2">
          <Label>College/University</Label>
          <Input
            value={profile.college}
            onChange={(e) => setProfile({ ...profile, college: e.target.value })}
            readOnly={!isEditing}
            className={!isEditing ? "bg-muted" : ""}
          />
        </div>

        <div className="space-y-2">
          <Label>Address</Label>
          <Input
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            readOnly={!isEditing}
            className={!isEditing ? "bg-muted" : ""}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              readOnly={!isEditing}
              className={!isEditing ? "bg-muted" : ""}
            />
          </div>
          <div className="space-y-2">
            <Label>LinkedIn URL</Label>
            <Input
              value={profile.linkedin_url}
              onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
              readOnly={!isEditing}
              className={!isEditing ? "bg-muted" : ""}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Resume</h3>
          <div className="flex items-center gap-4 p-4 border border-dashed rounded-lg bg-muted/30">
            <FileText className="text-primary w-8 h-8" />
            <div className="flex-1">
              <p className="font-semibold">
                {profile.resume_url ? "Resume uploaded" : "Upload your resume"}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile.resume_text || "PDF, DOC, DOCX up to 5MB"}
              </p>
            </div>
            <div className="relative">
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <Button variant="outline" disabled={uploading}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {uploading ? "Uploading..." : "Choose File"}
              </Button>
            </div>
          </div>
          {profile.resume_url && (
            <Button variant="link" asChild className="p-0">
              <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                View Resume
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

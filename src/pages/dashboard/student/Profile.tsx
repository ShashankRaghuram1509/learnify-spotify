import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Save, Edit, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    college: "",
    address: "",
    interests: [] as string[],
    resume_url: "",
    resume_text: "",
  });
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      setProfile({
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        college: data.college || "",
        address: data.address || "",
        interests: Array.isArray(data.interests) 
          ? (data.interests as string[])
          : [],
        resume_url: data.resume_url || "",
        resume_text: data.resume_text || "",
      });
    } catch (error) {
      toast.error("Failed to load profile");
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          college: profile.college,
          address: profile.address,
          interests: profile.interests,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('doc')) {
      toast.error("Please upload a PDF or DOC file");
      return;
    }

    setUploading(true);
    try {
      // Upload file to storage
      const fileName = `${user?.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("resumes")
        .getPublicUrl(fileName);

      // Update profile with resume URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          resume_url: publicUrl,
          resume_text: `Resume uploaded: ${file.name}`,
        })
        .eq("id", user?.id);

      if (updateError) throw updateError;

      toast.success("Resume uploaded successfully");
      fetchProfile();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  const addInterest = () => {
    if (interestInput.trim() && !profile.interests.includes(interestInput.trim())) {
      setProfile({ ...profile, interests: [...profile.interests, interestInput.trim()] });
      setInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter((i) => i !== interest),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Profile</CardTitle>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                Cancel
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
          />
        </div>

        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input value={profile.email} readOnly />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              readOnly={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label>College/University</Label>
            <Input
              value={profile.college}
              onChange={(e) => setProfile({ ...profile, college: e.target.value })}
              readOnly={!isEditing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Address</Label>
          <Textarea
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            readOnly={!isEditing}
            rows={2}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Interests & Skills</h3>
          {isEditing && (
            <div className="flex gap-2">
              <Input
                placeholder="Add an interest or skill"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addInterest()}
              />
              <Button onClick={addInterest} variant="outline">
                Add
              </Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <div
                key={interest}
                className="bg-secondary/50 text-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {interest}
                {isEditing && (
                  <button
                    onClick={() => removeInterest(interest)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Resume</h3>
          {profile.resume_url ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-secondary/20">
                <FileText className="text-primary h-8 w-8" />
                <div className="flex-1">
                  <p className="font-semibold">Resume uploaded</p>
                  <a
                    href={profile.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View resume
                  </a>
                </div>
                <label htmlFor="resume-upload">
                  <Button variant="outline" size="sm" disabled={uploading} asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? "Uploading..." : "Replace"}
                    </span>
                  </Button>
                </label>
              </div>
              {profile.resume_text && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">Extracted Information</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {profile.resume_text}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 border border-dashed rounded-lg">
              <Upload className="text-primary" />
              <div className="flex-1">
                <p className="font-semibold">Upload your resume</p>
                <p className="text-sm text-muted-foreground">
                  PDF, DOC, DOCX up to 5MB - AI will extract key information
                </p>
              </div>
              <label htmlFor="resume-upload">
                <Button variant="outline" disabled={uploading} asChild>
                  <span>{uploading ? "Uploading..." : "Choose File"}</span>
                </Button>
              </label>
            </div>
          )}
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeUpload}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
}
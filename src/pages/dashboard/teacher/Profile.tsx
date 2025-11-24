import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { BookOpen, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    experience_level: "",
    linkedin_url: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchCourses();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();

    if (data) {
      setProfile(data);
      setEditedProfile({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        experience_level: data.experience_level || '',
        linkedin_url: data.linkedin_url || '',
      });
    }
  };

  const fetchCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('id, title, is_premium, price')
      .eq('teacher_id', user?.id);

    if (data) {
      setCourses(data);
    }
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('profiles')
      .update(editedProfile)
      .eq('id', user?.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      fetchProfile();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Profile</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={editedProfile.full_name}
              onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                value={editedProfile.email}
                onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={editedProfile.phone}
                onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                disabled={!isEditing}
                placeholder="+91-XXXXXXXXXX"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Input
                value={editedProfile.experience_level}
                onChange={(e) => setEditedProfile({ ...editedProfile, experience_level: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., 5 years, Senior, Expert"
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn Profile</Label>
              <Input
                value={editedProfile.linkedin_url}
                onChange={(e) => setEditedProfile({ ...editedProfile, linkedin_url: e.target.value })}
                disabled={!isEditing}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>

          {isEditing && (
            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Courses Teaching ({courses.length})
          </CardTitle>
          <CardDescription>Courses you are currently offering</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{course.title}</h3>
                  <div className="flex items-center gap-2">
                    {course.is_premium && (
                      <Badge>Premium</Badge>
                    )}
                    {course.price > 0 && (
                      <span className="text-sm text-muted-foreground">
                        ₹{course.price}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {courses.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">
              No courses created yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

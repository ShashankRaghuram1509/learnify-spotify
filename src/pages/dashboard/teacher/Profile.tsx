import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const teacherProfile = {
  fullName: "Dr. Evelyn Reed",
  email: "e.reed@learnify.edu",
  phone: "+1 987-654-3210",
  expertise: ["Machine Learning", "Data Structures", "Algorithms"],
  experience: "12 years",
  bio: "A passionate educator and researcher with over a decade of experience in computer science. Dr. Reed is dedicated to making complex topics accessible and engaging for all students.",
};

export default function ProfilePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input defaultValue={teacherProfile.fullName} readOnly />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input defaultValue={teacherProfile.email} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input defaultValue={teacherProfile.phone} readOnly />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Years of Experience</Label>
            <Input defaultValue={teacherProfile.experience} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Subject Matter Expertise</Label>
            <Input defaultValue={teacherProfile.expertise.join(", ")} readOnly />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Biography</Label>
          <Textarea
            defaultValue={teacherProfile.bio}
            readOnly
            rows={5}
            className="resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}
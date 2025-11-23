import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Upload } from "lucide-react";

const studentProfile = {
  fullName: "Alex Doe",
  college: "University of Technology",
  address: "123 Tech Street, Silicon Valley, CA",
  phone: "+1 234-567-8901",
  email: "alex.doe@university.edu",
  interests: ["React", "Node.js", "AI/ML", "UI/UX Design"],
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
          <Input defaultValue={studentProfile.fullName} readOnly />
        </div>
        <div className="space-y-2">
          <Label>College/University</Label>
          <Input defaultValue={studentProfile.college} readOnly />
        </div>
        <div className="space-y-2">
          <Label>Address</Label>
          <Input defaultValue={studentProfile.address} readOnly />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input defaultValue={studentProfile.phone} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input defaultValue={studentProfile.email} readOnly />
          </div>
        </div>
        <Separator />
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Interests & Skills</h3>
          <div className="flex flex-wrap gap-2">
            {studentProfile.interests.map((interest) => (
              <div key={interest} className="bg-spotify-gray/30 text-spotify-text/90 px-3 py-1 rounded-full text-sm">
                {interest}
              </div>
            ))}
          </div>
        </div>
        <Separator />
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Resume</h3>
          <div className="flex items-center gap-4 p-4 border border-dashed rounded-lg">
            <Upload className="text-spotify" />
            <div>
              <p className="font-semibold">Upload your resume</p>
              <p className="text-sm text-spotify-text/70">PDF, DOC, DOCX up to 5MB</p>
            </div>
            <Button variant="outline" className="ml-auto">
              Choose File
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
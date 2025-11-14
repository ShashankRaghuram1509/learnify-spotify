import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CertificateView from "@/components/dashboard/CertificateView";

const sampleCertificates = [
  {
    courseName: "Advanced React & TypeScript",
    completionDate: "2023-10-15",
    instructor: "Jane Doe",
  },
  {
    courseName: "UI/UX Design Masterclass",
    completionDate: "2023-08-22",
    instructor: "Emily White",
  },
  {
    courseName: "Data Science with Python",
    completionDate: "2023-05-30",
    instructor: "Michael Brown",
  },
];

export default function CertificatesPage() {
  const { user } = useAuth();
  const [selectedCert, setSelectedCert] = useState<{ courseName: string; completionDate: string } | null>(null);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Award className="text-spotify" />
          My Certificates
        </h1>
        <p className="text-spotify-text/70 mt-1">
          View and download your earned certificates.
        </p>
      </div>

      <Dialog>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sampleCertificates.map((cert) => (
            <Card key={cert.courseName} className="flex flex-col">
              <CardHeader>
                <div className="w-12 h-12 bg-spotify/10 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-spotify" />
                </div>
                <CardTitle>{cert.courseName}</CardTitle>
                <CardDescription>
                  Awarded on {cert.completionDate}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  Instructor: {cert.instructor}
                </p>
              </CardContent>
              <CardFooter>
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    onClick={() => setSelectedCert(cert)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View & Download
                  </Button>
                </DialogTrigger>
              </CardFooter>
            </Card>
          ))}
        </div>

        {selectedCert && (
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Certificate of Completion</DialogTitle>
            </DialogHeader>
            <CertificateView
              studentName={user?.email || "Student Name"}
              courseName={selectedCert.courseName}
              completionDate={selectedCert.completionDate}
            />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
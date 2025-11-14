import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CertificateView from "@/components/dashboard/CertificateView";

interface Certificate {
  id: string;
  course_title: string;
  issued_at: string;
  teacher_name: string;
}

export default function CertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from("certificates")
        .select(`
          id,
          issued_at,
          courses (
            title,
            teacher:profiles!courses_teacher_id_fkey (
              full_name,
              email
            )
          )
        `)
        .eq("student_id", user?.id)
        .order("issued_at", { ascending: false });

      if (error) throw error;

      const formattedCerts = data?.map((cert: any) => ({
        id: cert.id,
        course_title: cert.courses.title,
        issued_at: new Date(cert.issued_at).toLocaleDateString(),
        teacher_name: cert.courses.teacher?.full_name || cert.courses.teacher?.email || "Instructor",
      })) || [];

      setCertificates(formattedCerts);
    } catch (error: any) {
      toast.error("Failed to load certificates");
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-8">
          <Award className="text-primary" />
          My Certificates
        </h1>
        <div className="text-center py-8">Loading certificates...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Award className="text-primary" />
          My Certificates
        </h1>
        <p className="text-muted-foreground mt-1">
          View and download your earned certificates.
        </p>
      </div>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                You haven't earned any certificates yet. Complete courses to earn certificates!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Dialog>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <Card key={cert.id} className="flex flex-col">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{cert.course_title}</CardTitle>
                  <CardDescription>
                    Awarded on {cert.issued_at}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">
                    Instructor: {cert.teacher_name}
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
                studentName={user?.email || "Student"}
                courseName={selectedCert.course_title}
                completionDate={selectedCert.issued_at}
              />
            </DialogContent>
          )}
        </Dialog>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

interface Certificate {
  id: string;
  course_title: string;
  issued_at: string;
}

export default function CertificateManager() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

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
            title
          )
        `)
        .eq("student_id", user?.id)
        .order("issued_at", { ascending: false })
        .limit(3);

      if (error) throw error;

      const formattedCerts = data?.map((cert: any) => ({
        id: cert.id,
        course_title: cert.courses.title,
        issued_at: new Date(cert.issued_at).toLocaleDateString(),
      })) || [];

      setCertificates(formattedCerts);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="text-primary" />
            My Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="text-primary" />
          My Certificates
        </CardTitle>
      </CardHeader>
      <CardContent>
        {certificates.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              Complete courses to earn certificates!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{cert.course_title}</p>
                  <p className="text-sm text-muted-foreground">
                    Issued: {cert.issued_at}
                  </p>
                </div>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {certificates.length > 0 && (
              <Link to="/dashboard/student/certificates">
                <Button variant="outline" className="w-full mt-2">
                  View All Certificates
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

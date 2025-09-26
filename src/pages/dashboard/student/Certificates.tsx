import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";

export default function CertificatesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="text-spotify" />
          My Certificates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Your earned certificates will be displayed here. Complete courses to earn them!</p>
      </CardContent>
    </Card>
  );
}
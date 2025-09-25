import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CertificateManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Certificate Manager</CardTitle>
        <CardDescription>
          View and download your earned certificates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>A list of earned certificates will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
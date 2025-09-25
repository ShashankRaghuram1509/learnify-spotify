import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VideoCallManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Call Management</CardTitle>
        <CardDescription>
          Schedule and manage your 1:1 video call sessions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>A calendar and scheduling tool will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
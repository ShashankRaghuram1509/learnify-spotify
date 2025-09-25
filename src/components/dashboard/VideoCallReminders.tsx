import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VideoCallReminders() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Call Reminders</CardTitle>
        <CardDescription>
          Your upcoming 1:1 video call sessions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>A list of upcoming video calls will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
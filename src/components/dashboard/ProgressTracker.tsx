import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProgressTracker() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Tracker</CardTitle>
        <CardDescription>
          Your learning progress at a glance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Progress bars and charts will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
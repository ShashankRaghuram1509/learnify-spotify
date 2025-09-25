import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StudentAnalytics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Analytics</CardTitle>
        <CardDescription>
          Analytics and progress of your students.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Charts and tables for student analytics will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
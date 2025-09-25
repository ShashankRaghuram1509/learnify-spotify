import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EnrolledCoursesList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrolled Courses</CardTitle>
        <CardDescription>
          Your currently enrolled courses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>A list of enrolled courses will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
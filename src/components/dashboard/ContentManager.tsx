import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ContentManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Manager</CardTitle>
        <CardDescription>
          Manage your course content, including videos and articles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Tools for uploading and organizing course materials will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
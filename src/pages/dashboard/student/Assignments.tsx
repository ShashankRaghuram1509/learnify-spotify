import AssignmentsList from "@/components/dashboard/student/AssignmentsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function Assignments() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="text-primary" />
            My Assignments & Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AssignmentsList />
        </CardContent>
      </Card>
    </div>
  );
}

import AdminFeedback from "@/components/teacher/AdminFeedback";

export default function AdminFeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Feedback</h1>
        <p className="text-muted-foreground">Review feedback and suggestions from administrators</p>
      </div>
      <AdminFeedback />
    </div>
  );
}

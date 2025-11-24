import PlacementReview from "@/components/teacher/PlacementReview";

export default function PlacementReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Placement Review</h1>
        <p className="text-muted-foreground">Provide feedback for students' placement applications</p>
      </div>
      <PlacementReview />
    </div>
  );
}

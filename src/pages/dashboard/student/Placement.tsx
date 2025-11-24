import PlacementAssistance from "@/components/student/PlacementAssistance";

export default function PlacementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Placement Assistance</h1>
        <p className="text-muted-foreground">Explore job opportunities and apply for positions</p>
      </div>
      <PlacementAssistance />
    </div>
  );
}

import EnrolledCoursesList from "@/components/dashboard/EnrolledCoursesList";

export default function MyCoursesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Courses</h1>
      <EnrolledCoursesList />
    </div>
  );
}
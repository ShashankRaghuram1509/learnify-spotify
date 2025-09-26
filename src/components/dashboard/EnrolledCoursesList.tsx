import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const enrolledCourses = [
  {
    id: "react-basics",
    title: "React Basics",
    description: "Get started with the fundamentals of React.",
    instructor: "John Doe",
    progress: 75,
    link: "/courses/react-basics",
  },
  {
    id: "advanced-css",
    title: "Advanced CSS & Sass",
    description: "Master modern CSS techniques and Sass.",
    instructor: "Jane Smith",
    progress: 40,
    link: "/courses/advanced-css",
  },
  {
    id: "typescript-intro",
    title: "Introduction to TypeScript",
    description: "Learn how to use TypeScript to build robust web apps.",
    instructor: "Emily White",
    progress: 90,
    link: "/courses/typescript-intro",
  },
];

export default function EnrolledCoursesList() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>My Courses</CardTitle>
        <CardDescription>
          Continue your learning journey and manage your enrolled courses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {enrolledCourses.map((course) => (
            <Link to={course.link} key={course.id}>
              <div className="p-4 bg-spotify-gray/20 rounded-lg flex items-center justify-between hover:bg-spotify-gray/30 transition-colors duration-300">
                <div>
                  <h4 className="font-semibold">{course.title}</h4>
                  <p className="text-sm text-spotify-text/70">
                    by {course.instructor}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24">
                    <div className="h-2 bg-spotify-gray/40 rounded-full">
                      <div
                        className="h-2 bg-spotify rounded-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-center mt-1 text-spotify-text/60">
                      {course.progress}% complete
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-spotify-text/80 hover:text-spotify">
                    <ArrowRight size={18} />
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
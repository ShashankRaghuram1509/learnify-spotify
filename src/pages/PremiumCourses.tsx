import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

const premiumCourses = [
  {
    title: "Advanced React & TypeScript",
    instructor: "Jane Doe",
    isExclusive: true,
    hasCertification: true,
  },
  {
    title: "Full-Stack Web Development Bootcamp",
    instructor: "John Smith",
    isExclusive: true,
    hasCertification: true,
  },
  {
    title: "UI/UX Design Masterclass",
    instructor: "Emily White",
    isExclusive: true,
    hasCertification: true,
  },
  {
    title: "Data Science with Python",
    instructor: "Michael Brown",
    isExclusive: true,
    hasCertification: true,
  },
];

export default function PremiumCourses() {
  const { user, isPremium } = useAuth();

  if (!user || !isPremium) {
    return <Navigate to="/dashboard/student/upgrade" replace />;
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Premium Courses</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Unlock your potential with our exclusive, in-depth courses.
        </p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {premiumCourses.map((course) => (
          <Card key={course.title} className="flex flex-col">
            <CardHeader>
              {course.isExclusive && (
                <Badge variant="destructive" className="w-fit">
                  Exclusive
                </Badge>
              )}
              <CardTitle className="mt-2">{course.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                By {course.instructor}
              </p>
              {course.hasCertification && (
                <div className="mt-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <p className="text-sm font-medium">Certification Included</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full">Upgrade to Premium</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
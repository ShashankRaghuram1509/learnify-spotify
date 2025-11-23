import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CourseCard from "./CourseCard";
import { toast } from "sonner";

interface FeaturedCoursesProps {
  filterType?: "all" | "free" | "premium";
}

const FeaturedCourses = ({ filterType = "all" }: FeaturedCoursesProps) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let query = supabase.from("courses").select("*");

        if (filterType === "free") {
          query = query.or("is_premium.is.null,is_premium.eq.false");
        } else if (filterType === "premium") {
          query = query.eq("is_premium", true);
        }

        const { data, error } = await query.limit(8);

        if (error) throw error;

        setCourses(data || []);
      } catch (error) {
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [filterType]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-muted rounded-xl animate-pulse h-64"></div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No courses found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {courses.map((course: any) => (
        <CourseCard
          key={course.id}
          id={course.id}
          title={course.title}
          instructor="Expert Instructor"
          rating={4.5}
          students={0}
          duration="8 weeks"
          level="All Levels"
          price={course.price || 0}
          discountPrice={course.price ? course.price * 0.8 : 0}
          image={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600"}
          featured={true}
          premium={course.is_premium || false}
        />
      ))}
    </div>
  );
};

export default FeaturedCourses;


import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CourseCard from "./CourseCard";
import { useToast } from "@/hooks/use-toast";

// In a real app, this would be fetched from your backend
const categories = [
  { id: "all", name: "All Categories" },
  { id: "programming", name: "Programming" },
  { id: "data-structures", name: "Data Structures" },
  { id: "algorithms", name: "Algorithms" },
  { id: "web-development", name: "Web Development" },
  { id: "database", name: "Database" },
  { id: "system-design", name: "System Design" },
  { id: "data-science", name: "Data Science" },
  { id: "cloud", name: "Cloud Computing" },
  { id: "tools", name: "Developer Tools" }
];

const FeaturedCourses = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeType, setActiveType] = useState("all"); // "all", "free", or "premium"
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // In a real implementation, you would use your API client to fetch from your backend
        const response = await fetch('http://localhost:8080/api/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast({
          title: "Error",
          description: "Could not load courses. Please try again later.",
          variant: "destructive",
        });
        // Use the mock data as fallback if API fails
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [toast]);
  
  const filteredCourses = courses.filter(course => {
    // Filter by category
    const categoryMatch = activeCategory === "all" || course.category === activeCategory;
    
    // Filter by type (free/premium)
    const typeMatch = 
      activeType === "all" || 
      (activeType === "free" && !course.premium) ||
      (activeType === "premium" && course.premium);
    
    return categoryMatch && typeMatch;
  });
  
  // Filter to just featured courses for the homepage section
  const featuredFilteredCourses = filteredCourses.filter(course => course.featured);
  
  return (
    <section className="py-20 bg-spotify-dark">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 space-y-4 md:space-y-0">
          <div>
            <span className="text-spotify font-medium">Learn From The Best</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Featured Courses</h2>
          </div>
          
          <Link to="/courses" className="flex items-center text-spotify hover:text-spotify-light transition-colors duration-200">
            <span className="font-medium">View all courses</span>
            <ArrowRight size={18} className="ml-1" />
          </Link>
        </div>
        
        <div className="mb-6">
          <div className="flex overflow-x-auto scrollbar-none space-x-2 mb-4 pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-spotify text-white"
                    : "bg-spotify-gray/30 text-spotify-text/70 hover:bg-spotify-gray/50"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveType("all")}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                activeType === "all"
                  ? "bg-spotify text-white"
                  : "bg-spotify-gray/30 text-spotify-text/70 hover:bg-spotify-gray/50"
              }`}
            >
              All Courses
            </button>
            <button
              onClick={() => setActiveType("free")}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                activeType === "free"
                  ? "bg-green-500 text-white"
                  : "bg-spotify-gray/30 text-spotify-text/70 hover:bg-spotify-gray/50"
              }`}
            >
              Free Courses
            </button>
            <button
              onClick={() => setActiveType("premium")}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                activeType === "premium"
                  ? "bg-amber-500 text-white"
                  : "bg-spotify-gray/30 text-spotify-text/70 hover:bg-spotify-gray/50"
              }`}
            >
              Premium Courses
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <div key={index} className="bg-spotify-gray/20 rounded-xl animate-pulse h-[400px]"></div>
            ))}
          </div>
        ) : featuredFilteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredFilteredCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                id={course.courseId}
                title={course.title}
                instructor={course.instructor}
                rating={course.rating}
                students={course.students}
                duration={course.duration}
                level={course.level}
                price={course.price}
                discountPrice={course.discountPrice}
                image={course.image}
                featured={course.featured}
                premium={course.premium}
                externalLink={course.externalLink}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold mb-2">No Courses Found</h3>
            <p className="text-spotify-text/70 mb-6">
              We couldn't find any courses matching your search criteria.
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setActiveType("all");
              }}
              className="bg-spotify text-white px-6 py-3 rounded-full font-medium hover:bg-spotify-hover transition-colors duration-300"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCourses;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseCard from "./CourseCard";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, TrendingUp, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TabbedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('courses')
          .select(`
            *,
            enrollments(count),
            course_categories(
              categories(name)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(12);
        
        if (error) throw error;
        
        const transformedCourses = data?.map(course => {
          const categoryName = course.course_categories?.[0]?.categories?.name || null;
          
          const categoryMap = {
            'Programming': 'programming',
            'Data Structures': 'data-structures',
            'Algorithms': 'algorithms',
            'Web Development': 'web-development',
            'Databases': 'databases',
            'System Design': 'system-design',
            'Data Science': 'data-science',
            'Cloud Computing': 'cloud-computing',
            'Developer Tools': 'developer-tools'
          };
          
          const category = categoryMap[categoryName] || 'programming';
          
          return {
            id: course.id,
            courseId: course.id,
            title: course.title,
            instructor: "Expert Instructor",
            rating: 4.5,
            students: course.enrollments?.[0]?.count || 0,
            duration: "8 weeks",
            level: "All Levels",
            price: course.price || 0,
            discountPrice: course.price ? course.price * 0.8 : 0,
            image: course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600",
            featured: true,
            premium: course.is_premium || false,
            category: category,
            externalLink: null,
            created_at: course.created_at
          };
        }) || [];
        
        setCourses(transformedCourses);
      } catch (error) {
        console.error('Failed to load courses:', error);
        toast({
          title: "Error",
          description: "Failed to load courses",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [toast]);

  const freeCourses = courses.filter(c => !c.premium).slice(0, 6);
  const premiumCourses = courses.filter(c => c.premium).slice(0, 6);
  const recentCourses = [...courses].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 6);

  const tabs = [
    { value: "all", label: "All Courses", icon: TrendingUp, courses: courses.slice(0, 6) },
    { value: "free", label: "Free", icon: null, courses: freeCourses },
    { value: "premium", label: "Premium", icon: Sparkles, courses: premiumCourses },
    { value: "recent", label: "Recently Added", icon: Clock, courses: recentCourses },
  ];

  if (loading) {
    return (
      <section className="py-20 bg-spotify-dark">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <div key={index} className="bg-spotify-gray/20 rounded-xl animate-pulse h-[400px]"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-spotify-dark">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Explore Courses</h2>
          <p className="text-spotify-text/70">Choose from our wide range of courses and start learning today</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-8 bg-spotify-gray/30 p-1">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="data-[state=active]:bg-spotify data-[state=active]:text-white flex items-center gap-2"
              >
                {tab.icon && <tab.icon className="h-4 w-4" />}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
              {tab.courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {tab.courses.map((course) => (
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
                  <p className="text-spotify-text/70">No courses available in this category yet.</p>
                </div>
              )}
              
              <div className="text-center mt-12">
                <Link 
                  to="/courses" 
                  className="spotify-button inline-flex items-center"
                >
                  View All Courses
                </Link>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default TabbedCourses;

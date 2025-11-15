import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Users, Clock, BookOpen, Play, ShoppingCart, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        
        // Fetch course with enrollment count
        const { data, error } = await supabase
          .from("courses")
          .select(`
            *,
            modules:modules(count),
            enrollments:enrollments(count)
          `)
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        // Calculate student count from enrollments
        const studentCount = data?.enrollments?.[0]?.count || 0;
        const moduleCount = data?.modules?.[0]?.count || 0;

        setCourse({
          ...data,
          students: studentCount,
          rating: 4.5, // Default rating
          instructor: "Expert Instructor",
          duration: `${moduleCount} modules`,
          level: "All Levels",
          image: data?.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600"
        });
      } catch (error) {
        console.error("Course fetch error:", error);
        toast.error("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  const handleEnroll = async () => {
    if (course?.externalLink) {
      window.open(course.externalLink, '_blank');
      return;
    }

    if (!user || !course) {
      toast.error("You must be logged in to enroll.");
      return;
    }

    setIsEnrolling(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-enrollment', {
        body: { course_id: course.id }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setIsEnrolled(true);
      toast.success("Enrolled successfully! Course content is now available.");
    } catch (error: any) {
      if (error.message === 'Payment required for premium course') {
        toast.error("This is a premium course. Please complete payment first.");
      } else {
        toast.error("Failed to enroll in the course. Please try again.");
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20">
          <section className="py-20 bg-spotify-dark">
            <div className="container mx-auto px-4 md:px-6">
              <div className="animate-pulse">
                <div className="h-8 bg-spotify-gray/30 rounded-lg max-w-md mb-6"></div>
                <div className="h-6 bg-spotify-gray/30 rounded max-w-sm mb-4"></div>
                <div className="h-6 bg-spotify-gray/30 rounded max-w-xs mb-8"></div>
                <div className="h-64 bg-spotify-gray/30 rounded-xl mb-8"></div>
                <div className="h-12 bg-spotify-gray/30 rounded-lg max-w-xs"></div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20">
          <section className="py-20 bg-spotify-dark text-center">
            <div className="container mx-auto px-4 md:px-6">
              <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
              <p className="text-spotify-text/70 mb-8">
                The course you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/courses" className="spotify-button">
                Browse All Courses
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        {/* Breadcrumb */}
        <section className="py-6 bg-spotify-dark border-b border-spotify-gray/20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center space-x-2 text-sm text-spotify-text/70">
              <Link to="/" className="hover:text-spotify transition-colors">Home</Link>
              <span>/</span>
              <Link to="/courses" className="hover:text-spotify transition-colors">Courses</Link>
              <span>/</span>
              <span className="text-spotify-text">{course.title}</span>
            </div>
          </div>
        </section>

        {/* Course Hero */}
        <section className="py-16 bg-spotify-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#1DB95420,_transparent_50%)]"></div>
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
                  {course.title}
                </h1>
                <p className="text-xl text-spotify-text/80 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  {course.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-6 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-1" />
                    <span className="font-medium">{course?.rating ?? 4.5}</span>
                    <span className="text-spotify-text/70 ml-1">({(course?.students ?? 0).toLocaleString()} students)</span>
                  </div>
                  
                  <div className="flex items-center text-spotify-text/70">
                    <Clock className="h-5 w-5 mr-1" />
                    <span>{course?.duration ?? "Self-paced"}</span>
                  </div>
                  
                  <div className="flex items-center text-spotify-text/70">
                    <BookOpen className="h-5 w-5 mr-1" />
                    <span>{course?.level ?? "All Levels"}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                  {(course?.discountPrice ?? 0) > 0 ? (
                    <>
                      <span className="text-3xl font-bold text-spotify">${(course?.discountPrice ?? 0).toFixed(2)}</span>
                      <span className="text-xl text-spotify-text/50 line-through">${(course?.price ?? 0).toFixed(2)}</span>
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Save ${((course?.price ?? 0) - (course?.discountPrice ?? 0)).toFixed(2)}
                      </span>
                    </>
                  ) : (course?.price ?? 0) > 0 ? (
                    <span className="text-3xl font-bold text-spotify">${(course?.price ?? 0).toFixed(2)}</span>
                  ) : (
                    <span className="text-3xl font-bold text-green-500">Free</span>
                  )}
                </div>
                
                <Button 
                  onClick={handleEnroll}
                  className="spotify-button text-lg px-8 py-3 animate-fade-in"
                  style={{ animationDelay: "0.4s" }}
                  disabled={isEnrolled || isEnrolling}
                >
                  {isEnrolling ? "Enrolling..." : isEnrolled ? "Enrolled" : course.externalLink ? "Visit Course" : "Enroll Now"}
                  <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                </Button>
              </div>
              
              <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <img 
                  src={course?.image ?? course?.thumbnail_url ?? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600"}
                  alt={course?.title ?? "Course"}
                  className="rounded-2xl shadow-2xl w-full aspect-video object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Course Info */}
        <section className="py-16 bg-spotify-gray/10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-spotify-gray/20 rounded-xl p-6 text-center">
                <Users className="h-12 w-12 text-spotify mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Students</h3>
                <p className="text-spotify-text/70">{(course?.students ?? 0).toLocaleString()}</p>
              </div>
              
              <div className="bg-spotify-gray/20 rounded-xl p-6 text-center">
                <Clock className="h-12 w-12 text-spotify mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Duration</h3>
                <p className="text-spotify-text/70">{course?.duration ?? "Self-paced"}</p>
              </div>
              
              <div className="bg-spotify-gray/20 rounded-xl p-6 text-center">
                <BookOpen className="h-12 w-12 text-spotify mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Level</h3>
                <p className="text-spotify-text/70">{course?.level ?? "All Levels"}</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Course Modules */}
        {course.modules && course.modules.length > 0 && (
          <section className="py-16 bg-spotify-dark">
            <div className="container mx-auto px-4 md:px-6">
              <h2 className="text-3xl font-bold mb-8">What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {course.modules.map((module, index) => (
                  <div 
                    key={index}
                    className="bg-spotify-gray/20 rounded-xl p-6 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-spotify rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
                        <p className="text-spotify-text/70">{module.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* Instructor */}
        <section className="py-16 bg-spotify-gray/10">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold mb-8">Meet Your Instructor</h2>
            <div className="bg-spotify-gray/20 rounded-xl p-8">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-spotify rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {(course?.instructor ?? "Expert Instructor").split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">{course?.instructor ?? "Expert Instructor"}</h3>
                  <p className="text-spotify-text/70">
                    Experienced instructor with years of industry experience in web development and software engineering.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseDetail;
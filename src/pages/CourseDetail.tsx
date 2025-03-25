import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Star, Clock, Award, Users, Check, Lock } from "lucide-react";
import { toast } from "sonner";

// Mock data for fallback
const mockCourseDetails = {
  id: "default-course",
  courseId: "default-course",
  title: "Course Not Available",
  instructor: "Instructor",
  rating: 0,
  students: 0,
  duration: "Unknown",
  level: "All Levels",
  price: 0,
  discountPrice: 0,
  image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2340&h=1560&auto=format&fit=crop",
  description: "This course data couldn't be loaded from the server. Please try again later.",
  premium: false,
  modules: []
};

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast: uiToast } = useToast();
  
  // Define the backend API base URL with fallback
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      
      console.info(`Fetching course details for: ${id}`);
      try {
        setLoading(true);
        const response = await fetch(`${apiBaseUrl}/courses/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Course data fetched:", data);
        setCourse(data);
      } catch (error) {
        console.error("Error fetching course:", error);
        // Use sonner toast instead of useToast
        toast.error("Failed to load course data. Using fallback data.");
        
        // Set fallback mock data if we can't get the actual course
        setCourse(mockCourseDetails);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, apiBaseUrl]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20">
          <div className="container mx-auto px-4 py-16">
            <div className="animate-pulse">
              <div className="h-12 bg-spotify-gray/20 rounded-lg max-w-md mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                  <div className="h-6 bg-spotify-gray/20 rounded max-w-sm"></div>
                  <div className="h-6 bg-spotify-gray/20 rounded max-w-xs"></div>
                  <div className="h-32 bg-spotify-gray/20 rounded"></div>
                  <div className="h-64 bg-spotify-gray/20 rounded"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-60 bg-spotify-gray/20 rounded-xl"></div>
                  <div className="h-12 bg-spotify-gray/20 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If course not found even after loading
  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
            <p className="text-spotify-text/70 mb-8">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Link 
              to="/courses" 
              className="spotify-button px-6 py-3"
            >
              Browse All Courses
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Course found and loaded
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <section className="relative py-20 bg-spotify-dark">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Course Image */}
              <div className="md:order-2">
                <img 
                  src={course.image || mockCourseDetails.image}
                  alt={course.title || mockCourseDetails.title}
                  className="rounded-2xl shadow-xl aspect-video object-cover"
                />
              </div>
              
              {/* Course Details */}
              <div className="md:order-1">
                <h1 className="text-4xl font-bold mb-4">{course.title || mockCourseDetails.title}</h1>
                <p className="text-spotify-text/80 mb-6">{course.description || mockCourseDetails.description}</p>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center text-sm text-spotify-text/70">
                    <Star className="h-5 w-5 mr-1 text-yellow-500" />
                    <span>{course.rating || mockCourseDetails.rating} ({course.students || mockCourseDetails.students} students)</span>
                  </div>
                  <div className="flex items-center text-sm text-spotify-text/70">
                    <Clock className="h-5 w-5 mr-1" />
                    <span>{course.duration || mockCourseDetails.duration}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-6">
                  <div>
                    <span className="text-2xl font-bold">${course.discountPrice !== undefined ? course.discountPrice : course.price || mockCourseDetails.price}</span>
                    {course.discountPrice !== undefined && course.discountPrice !== course.price && (
                      <span className="text-lg line-through ml-2 text-spotify-text/70">${course.price || mockCourseDetails.price}</span>
                    )}
                  </div>
                </div>
                
                {course.premium ? (
                  <button className="spotify-button">Enroll Now (Premium)</button>
                ) : (
                  course.externalLink ? (
                    <a href={course.externalLink} target="_blank" rel="noopener noreferrer" className="spotify-button">
                      Enroll Now (External)
                    </a>
                  ) : (
                    <button className="spotify-button">Enroll Now (Free)</button>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Course Features */}
        <section className="py-16 bg-spotify-gray/10">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold mb-8 text-center">Course Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Level */}
              <div className="flex flex-col items-center">
                <Award className="h-10 w-10 mb-2 text-spotify" />
                <h3 className="font-semibold text-lg">Level</h3>
                <p className="text-spotify-text/70">{course.level || mockCourseDetails.level}</p>
              </div>
              
              {/* Duration */}
              <div className="flex flex-col items-center">
                <Clock className="h-10 w-10 mb-2 text-spotify" />
                <h3 className="font-semibold text-lg">Duration</h3>
                <p className="text-spotify-text/70">{course.duration || mockCourseDetails.duration}</p>
              </div>
              
              {/* Access */}
              <div className="flex flex-col items-center">
                <Lock className="h-10 w-10 mb-2 text-spotify" />
                <h3 className="font-semibold text-lg">Access</h3>
                <p className="text-spotify-text/70">Lifetime Access</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Course Modules */}
        <section className="py-16 bg-spotify-dark">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold mb-8">Course Modules</h2>
            
            {course.modules && course.modules.length > 0 ? (
              <ul className="space-y-4">
                {course.modules.map((module, index) => (
                  <li key={index} className="bg-spotify-gray/20 rounded-xl p-6">
                    <div className="flex items-center space-x-4">
                      <Check className="h-6 w-6 text-green-500" />
                      <span className="text-lg font-medium">{module.title}</span>
                    </div>
                    <p className="mt-2 text-spotify-text/70">{module.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-2xl font-semibold mb-2">No Modules Found</h3>
                <p className="text-spotify-text/70">
                  This course currently has no modules listed.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseDetail;

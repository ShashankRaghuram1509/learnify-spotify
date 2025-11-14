import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Users, Clock, BookOpen, Play, ShoppingCart, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Mock course data for different course IDs
const mockCourses = {
  "web-dev-101": {
    id: "web-dev-101",
    title: "Web Development Fundamentals",
    instructor: "Sarah Johnson",
    rating: 4.8,
    students: 1543,
    duration: "8 weeks",
    level: "Beginner",
    price: 89.99,
    discountPrice: 49.99,
    image: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    description: "Learn the fundamentals of web development including HTML, CSS, and JavaScript. Perfect for beginners who want to start their journey in web development.",
    externalLink: "https://www.geeksforgeeks.org/web-development/",
    modules: [
      { title: "HTML Basics", content: "Learn the structure of web pages with HTML" },
      { title: "CSS Styling", content: "Style your web pages with CSS" },
      { title: "JavaScript Fundamentals", content: "Add interactivity to your web pages" },
      { title: "Responsive Design", content: "Make your websites work on all devices" }
    ]
  },
  "react-masterclass": {
    id: "react-masterclass",
    title: "React.js Masterclass",
    instructor: "Amanda Lee",
    rating: 4.8,
    students: 1876,
    duration: "10 weeks",
    level: "Intermediate",
    price: 89.99,
    discountPrice: 59.99,
    image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    description: "Master React.js with this comprehensive course covering hooks, context, state management, and modern React patterns.",
    externalLink: null,
    modules: [
      { title: "React Fundamentals", content: "Components, JSX, and props" },
      { title: "Hooks & State Management", content: "useState, useEffect, and custom hooks" },
      { title: "Context API", content: "Global state management with Context" },
      { title: "Advanced Patterns", content: "Higher-order components and render props" }
    ]
  },
  "default": {
    id: "default-course",
    title: "Course Not Found",
    instructor: "Instructor",
    rating: 0,
    students: 0,
    duration: "Unknown",
    level: "All Levels",
    price: 0,
    discountPrice: 0,
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2340&h=1560&auto=format&fit=crop",
    description: "This course could not be found. Please check the course ID or browse our available courses.",
    externalLink: null,
    modules: []
  }
};

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    // Mock course data - replace with actual API call
    const mockCourse = mockCourses[id] || mockCourses.default;

    // Simulate API delay
    setTimeout(() => {
      setCourse(mockCourse);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleEnroll = () => {
    if (course?.externalLink) {
      window.open(course.externalLink, '_blank');
    } else {
      setIsEnrolled(true);
      toast.success("Enrolled successfully! Course content is now available.");
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
                    <span className="font-medium">{course.rating}</span>
                    <span className="text-spotify-text/70 ml-1">({course.students} students)</span>
                  </div>
                  
                  <div className="flex items-center text-spotify-text/70">
                    <Clock className="h-5 w-5 mr-1" />
                    <span>{course.duration}</span>
                  </div>
                  
                  <div className="flex items-center text-spotify-text/70">
                    <BookOpen className="h-5 w-5 mr-1" />
                    <span>{course.level}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                  {course.discountPrice > 0 ? (
                    <>
                      <span className="text-3xl font-bold text-spotify">${course.discountPrice}</span>
                      <span className="text-xl text-spotify-text/50 line-through">${course.price}</span>
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Save ${(course.price - course.discountPrice).toFixed(2)}
                      </span>
                    </>
                  ) : course.price > 0 ? (
                    <span className="text-3xl font-bold text-spotify">${course.price}</span>
                  ) : (
                    <span className="text-3xl font-bold text-green-500">Free</span>
                  )}
                </div>
                
                <Button 
                  onClick={handleEnroll}
                  className="spotify-button text-lg px-8 py-3 animate-fade-in"
                  style={{ animationDelay: "0.4s" }}
                  disabled={isEnrolled}
                >
                  {isEnrolled ? "Enrolled" : course.externalLink ? "Visit Course" : "Enroll Now"}
                  <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                </Button>
              </div>
              
              <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <img 
                  src={course.image}
                  alt={course.title}
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
                <p className="text-spotify-text/70">{course.students.toLocaleString()}</p>
              </div>
              
              <div className="bg-spotify-gray/20 rounded-xl p-6 text-center">
                <Clock className="h-12 w-12 text-spotify mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Duration</h3>
                <p className="text-spotify-text/70">{course.duration}</p>
              </div>
              
              <div className="bg-spotify-gray/20 rounded-xl p-6 text-center">
                <BookOpen className="h-12 w-12 text-spotify mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Level</h3>
                <p className="text-spotify-text/70">{course.level}</p>
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
                    {course.instructor.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">{course.instructor}</h3>
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
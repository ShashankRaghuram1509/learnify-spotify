
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Users, 
  BarChart, 
  Award, 
  Calendar, 
  CheckCircle, 
  Play, 
  BookOpen, 
  Globe, 
  MessageCircle,
  Star,
  AlertCircle, 
  Share2, 
  Heart, 
  HeartOff, 
  ChevronDown,
  ChevronUp
} from "lucide-react";

// Mock data - in a real app, this would come from an API
const coursesData = [
  {
    id: "web-dev-101",
    title: "Web Development Fundamentals",
    instructor: "Sarah Johnson",
    instructorTitle: "Senior Web Developer & Instructor",
    instructorImage: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 4.8,
    reviews: 342,
    students: 1543,
    lastUpdated: "November 2023",
    duration: "8 weeks",
    level: "Beginner",
    language: "English",
    price: 89.99,
    discountPrice: 49.99,
    image: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    featured: true,
    category: "development",
    description: "This comprehensive course will take you from beginner to confident web developer. You'll learn HTML, CSS, JavaScript, and modern web development tools and frameworks to build responsive, interactive websites from scratch.",
    whatYouWillLearn: [
      "Build responsive websites using HTML5 and CSS3",
      "Implement interactive features with JavaScript",
      "Work with web development tools and workflows",
      "Deploy and host your websites online",
      "Optimize your sites for performance and SEO",
      "Create mobile-friendly layouts and designs"
    ],
    curriculum: [
      {
        title: "Introduction to Web Development",
        lessons: [
          { title: "Course Overview", duration: "5:30", preview: true },
          { title: "Setting Up Your Development Environment", duration: "12:45", preview: false },
          { title: "Understanding How the Web Works", duration: "10:15", preview: false }
        ]
      },
      {
        title: "HTML Fundamentals",
        lessons: [
          { title: "HTML Document Structure", duration: "8:20", preview: true },
          { title: "Working with Text Elements", duration: "14:10", preview: false },
          { title: "Links, Images, and Multimedia", duration: "15:35", preview: false },
          { title: "Forms and Input Elements", duration: "18:42", preview: false }
        ]
      },
      {
        title: "CSS Styling",
        lessons: [
          { title: "CSS Selectors and Properties", duration: "13:25", preview: false },
          { title: "Box Model and Layout", duration: "16:18", preview: false },
          { title: "Flexbox and Grid Systems", duration: "22:30", preview: false },
          { title: "Responsive Design Principles", duration: "19:45", preview: false }
        ]
      },
      {
        title: "JavaScript Basics",
        lessons: [
          { title: "Variables, Data Types, and Operators", duration: "17:15", preview: false },
          { title: "Control Flow and Functions", duration: "21:05", preview: false },
          { title: "DOM Manipulation", duration: "24:30", preview: false },
          { title: "Event Handling", duration: "18:50", preview: false }
        ]
      },
      {
        title: "Putting It All Together",
        lessons: [
          { title: "Building a Complete Project", duration: "32:15", preview: false },
          { title: "Debugging and Testing", duration: "15:45", preview: false },
          { title: "Deployment and Publishing", duration: "14:20", preview: false },
          { title: "Course Wrap-Up and Next Steps", duration: "8:35", preview: false }
        ]
      }
    ]
  },
  // Add more course details as needed
];

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // In a real app, you would fetch the course details from an API
    // Here we're just simulating that with a timeout
    const timer = setTimeout(() => {
      const foundCourse = coursesData.find(c => c.id === id);
      setCourse(foundCourse || null);
      setLoading(false);
      
      // Expand the first section by default
      if (foundCourse && foundCourse.curriculum && foundCourse.curriculum.length > 0) {
        setExpanded([foundCourse.curriculum[0].title]);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [id]);
  
  const toggleSection = (title: string) => {
    if (expanded.includes(title)) {
      setExpanded(expanded.filter(t => t !== title));
    } else {
      setExpanded([...expanded, title]);
    }
  };
  
  const handleEnroll = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in or sign up to enroll in this course.",
        variant: "default",
      });
      return;
    }
    
    toast({
      title: "Successfully Enrolled!",
      description: `You are now enrolled in "${course.title}". Check your dashboard to start learning.`,
      variant: "default",
    });
  };
  
  const toggleWishlist = () => {
    setWishlist(!wishlist);
    toast({
      title: wishlist ? "Removed from Wishlist" : "Added to Wishlist",
      description: wishlist 
        ? `"${course.title}" has been removed from your wishlist.` 
        : `"${course.title}" has been added to your wishlist.`,
      variant: "default",
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-pulse-soft">
            <div className="h-6 w-32 bg-spotify-gray/30 rounded-full mb-4 mx-auto"></div>
            <div className="h-10 w-64 bg-spotify-gray/30 rounded-full mb-8 mx-auto"></div>
            <div className="h-4 w-96 bg-spotify-gray/30 rounded-full mx-auto"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-spotify-text/50 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Course Not Found</h1>
            <p className="text-spotify-text/70 mb-6">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/courses" className="spotify-button">
              Browse Courses
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  const totalLessons = course.curriculum.reduce(
    (total: number, section: any) => total + section.lessons.length, 
    0
  );
  
  const totalDuration = course.curriculum.reduce(
    (total: number, section: any) => 
      total + section.lessons.reduce(
        (sectionTotal: number, lesson: any) => {
          const [minutes, seconds] = lesson.duration.split(':').map(Number);
          return sectionTotal + minutes + (seconds / 60);
        }, 
        0
      ), 
    0
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 bg-spotify-dark">
        {/* Course Header */}
        <section className="py-16 bg-spotify-dark relative">
          <div className="absolute inset-0 bg-gradient-to-r from-spotify-dark/90 to-spotify-dark/90 z-0"></div>
          <div className="absolute inset-0 overflow-hidden">
            <img 
              src={course.image} 
              alt={course.title}
              className="w-full h-full object-cover opacity-20 blur-sm"
            />
          </div>
          
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Course Image */}
                <div className="w-full md:w-2/5 flex-shrink-0">
                  <div className="relative rounded-xl overflow-hidden shadow-2xl animate-fade-in">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-spotify text-white rounded-full w-16 h-16 flex items-center justify-center hover:bg-spotify-hover transition-colors duration-300">
                      <Play size={28} fill="currentColor" />
                    </button>
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded">
                      {course.level}
                    </div>
                  </div>
                </div>
                
                {/* Course Details */}
                <div className="w-full md:w-3/5 animate-fade-up">
                  <div className="inline-block mb-3 bg-spotify/20 backdrop-blur-sm border border-spotify/20 rounded-full px-4 py-1 text-sm text-spotify">
                    {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                  
                  <p className="text-spotify-text/80 text-lg mb-6">{course.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6">
                    <div className="flex items-center">
                      <div className="flex items-center text-yellow-400 mr-1">
                        <Star size={18} fill="currentColor" stroke="none" />
                      </div>
                      <span className="font-medium">{course.rating.toFixed(1)}</span>
                      <span className="text-spotify-text/60 ml-1">({course.reviews} reviews)</span>
                    </div>
                    
                    <div className="flex items-center text-spotify-text/80">
                      <Users size={16} className="mr-1" />
                      <span>{course.students.toLocaleString()} students</span>
                    </div>
                    
                    <div className="flex items-center text-spotify-text/80">
                      <Calendar size={16} className="mr-1" />
                      <span>Last updated {course.lastUpdated}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-6">
                    <img 
                      src={course.instructorImage} 
                      alt={course.instructor} 
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium">{course.instructor}</p>
                      <p className="text-sm text-spotify-text/70">{course.instructorTitle}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Course Details */}
        <section className="py-12 bg-spotify-dark">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-10">
                {/* Main Content */}
                <div className="w-full lg:w-2/3 order-2 lg:order-1">
                  {/* What You'll Learn */}
                  <div className="bg-spotify-gray/20 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/10 animate-fade-in">
                    <h2 className="text-2xl font-semibold mb-6">What You'll Learn</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.whatYouWillLearn.map((item: string, index: number) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-spotify mr-2 mt-1 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Course Content */}
                  <div className="bg-spotify-gray/20 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/10 animate-fade-in">
                    <h2 className="text-2xl font-semibold mb-2">Course Content</h2>
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-spotify-text/80">
                        {course.curriculum.length} sections • {totalLessons} lessons • {Math.floor(totalDuration)} hours total
                      </p>
                      <button 
                        onClick={() => expanded.length === course.curriculum.length 
                          ? setExpanded([])
                          : setExpanded(course.curriculum.map((section: any) => section.title))
                        }
                        className="text-spotify hover:text-spotify-light transition-colors duration-200 text-sm font-medium"
                      >
                        {expanded.length === course.curriculum.length ? "Collapse All" : "Expand All"}
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {course.curriculum.map((section: any, sectionIndex: number) => (
                        <div key={sectionIndex} className="border border-white/10 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleSection(section.title)}
                            className="w-full flex items-center justify-between bg-spotify-gray/30 px-5 py-4 hover:bg-spotify-gray/40 transition-colors duration-200"
                          >
                            <div className="flex items-center">
                              {expanded.includes(section.title) ? (
                                <ChevronUp size={18} className="mr-2 text-spotify" />
                              ) : (
                                <ChevronDown size={18} className="mr-2 text-spotify" />
                              )}
                              <h3 className="font-medium">{section.title}</h3>
                            </div>
                            <span className="text-sm text-spotify-text/70">
                              {section.lessons.length} lessons
                            </span>
                          </button>
                          
                          {expanded.includes(section.title) && (
                            <div className="bg-spotify-gray/20 divide-y divide-white/5">
                              {section.lessons.map((lesson: any, lessonIndex: number) => (
                                <div 
                                  key={lessonIndex} 
                                  className="flex items-center justify-between px-5 py-3 hover:bg-spotify-gray/30 transition-colors duration-200"
                                >
                                  <div className="flex items-center">
                                    <Play size={15} className="mr-3 text-spotify-text/50" />
                                    <span className={lesson.preview ? "text-spotify-text" : "text-spotify-text/70"}>
                                      {lesson.title}
                                    </span>
                                    {lesson.preview && (
                                      <span className="ml-2 text-xs bg-spotify/20 text-spotify px-2 py-0.5 rounded-full">
                                        Preview
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-sm text-spotify-text/60">{lesson.duration}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Instructor */}
                  <div className="bg-spotify-gray/20 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/10 animate-fade-in">
                    <h2 className="text-2xl font-semibold mb-6">Instructor</h2>
                    <div className="flex items-start space-x-4">
                      <img 
                        src={course.instructorImage} 
                        alt={course.instructor} 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-xl font-semibold">{course.instructor}</h3>
                        <p className="text-spotify-text/70 mb-3">{course.instructorTitle}</p>
                        <p className="text-spotify-text/80">
                          Sarah is a senior web developer with over 10 years of experience in building websites and applications. She has worked with companies like Google, Amazon, and Microsoft, and has a passion for teaching and sharing her knowledge with aspiring developers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Sidebar */}
                <div className="w-full lg:w-1/3 order-1 lg:order-2">
                  <div className="sticky top-28">
                    <div className="bg-spotify-gray/20 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 animate-fade-in shadow-xl">
                      {/* Price */}
                      <div className="p-6 border-b border-white/10">
                        <div className="flex items-center mb-4">
                          <span className="text-3xl font-bold">${course.discountPrice.toFixed(2)}</span>
                          <span className="text-xl text-spotify-text/50 line-through ml-3">
                            ${course.price.toFixed(2)}
                          </span>
                          <span className="ml-3 bg-spotify/10 text-spotify px-2 py-1 rounded-md text-sm font-medium">
                            {Math.round((1 - course.discountPrice / course.price) * 100)}% off
                          </span>
                        </div>
                        
                        <button 
                          onClick={handleEnroll}
                          className="spotify-button w-full mb-3"
                        >
                          Enroll Now
                        </button>
                        
                        <button 
                          onClick={toggleWishlist}
                          className="w-full bg-transparent text-spotify-text border border-white/20 rounded-full py-3 font-semibold flex items-center justify-center hover:bg-spotify-gray/30 transition-colors duration-300"
                        >
                          {wishlist ? (
                            <>
                              <HeartOff size={18} className="mr-2" />
                              Remove from Wishlist
                            </>
                          ) : (
                            <>
                              <Heart size={18} className="mr-2" />
                              Add to Wishlist
                            </>
                          )}
                        </button>
                        
                        <p className="text-center text-sm text-spotify-text/60 mt-4">
                          30-Day Money-Back Guarantee
                        </p>
                      </div>
                      
                      {/* Course Includes */}
                      <div className="p-6">
                        <h3 className="font-semibold mb-4">This Course Includes:</h3>
                        
                        <ul className="space-y-3">
                          <li className="flex items-center text-spotify-text/80">
                            <BookOpen size={16} className="mr-3 text-spotify" />
                            <span>{totalLessons} on-demand video lessons</span>
                          </li>
                          <li className="flex items-center text-spotify-text/80">
                            <Clock size={16} className="mr-3 text-spotify" />
                            <span>{Math.floor(totalDuration)} hours of content</span>
                          </li>
                          <li className="flex items-center text-spotify-text/80">
                            <Globe size={16} className="mr-3 text-spotify" />
                            <span>Full lifetime access</span>
                          </li>
                          <li className="flex items-center text-spotify-text/80">
                            <MessageCircle size={16} className="mr-3 text-spotify" />
                            <span>Community support</span>
                          </li>
                          <li className="flex items-center text-spotify-text/80">
                            <Award size={16} className="mr-3 text-spotify" />
                            <span>Certificate of completion</span>
                          </li>
                        </ul>
                        
                        <div className="mt-6 pt-6 border-t border-white/10 flex justify-center">
                          <button className="flex items-center text-spotify-text/70 hover:text-spotify-text transition-colors duration-200">
                            <Share2 size={16} className="mr-2" />
                            <span>Share this course</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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

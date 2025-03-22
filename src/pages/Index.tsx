
import React from "react";
import HeroSection from "@/components/HeroSection";
import FeaturedCourses from "@/components/FeaturedCourses";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, BookOpen, Users, Award, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  // Stats data
  const stats = [
    { label: "Courses", value: "200+", icon: BookOpen },
    { label: "Students", value: "15k+", icon: Users },
    { label: "Instructors", value: "50+", icon: Award },
    { label: "Course Hours", value: "1,200+", icon: Clock },
  ];

  // Benefits data
  const benefits = [
    {
      title: "Learn at Your Own Pace",
      description: "Access course materials anytime, anywhere. Study when it's convenient for you.",
    },
    {
      title: "Expert Instructors",
      description: "Learn from industry professionals with real-world experience and insights.",
    },
    {
      title: "Interactive Learning",
      description: "Engage with hands-on projects, quizzes, and assignments to reinforce your learning.",
    },
    {
      title: "Community Support",
      description: "Connect with fellow students and instructors in our vibrant learning community.",
    },
  ];

  // Categories data
  const categories = [
    {
      name: "Web Development",
      courses: 42,
      icon: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80",
      link: "/courses/development",
    },
    {
      name: "UI/UX Design",
      courses: 28,
      icon: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80",
      link: "/courses/design",
    },
    {
      name: "Data Science",
      courses: 36,
      icon: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3474&q=80",
      link: "/courses/data-science",
    },
    {
      name: "Digital Marketing",
      courses: 24,
      icon: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80",
      link: "/courses/marketing",
    },
    {
      name: "Mobile Development",
      courses: 19,
      icon: "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80",
      link: "/courses/mobile",
    },
    {
      name: "AI & Machine Learning",
      courses: 15,
      icon: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80",
      link: "/courses/ai",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Stats Section */}
        <section className="py-16 bg-spotify-dark">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="bg-spotify-gray/30 backdrop-blur-md rounded-xl p-6 text-center border border-white/10 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 mx-auto bg-spotify/10 rounded-full flex items-center justify-center mb-4">
                    <stat.icon className="h-6 w-6 text-spotify" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-spotify-text mb-1">{stat.value}</h3>
                  <p className="text-spotify-text/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Categories Section */}
        <section className="py-20 bg-spotify-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#1DB95420,_transparent_50%)]"></div>
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-spotify font-medium">Diverse Learning Paths</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Explore Our Course Categories</h2>
              <p className="text-spotify-text/70 text-lg">
                Discover a wide range of courses across different domains to help you achieve your learning goals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {categories.map((category, index) => (
                <Link 
                  key={index} 
                  to={category.link}
                  className="group rounded-xl overflow-hidden bg-spotify-gray/20 border border-white/10 relative h-56 card-hover"
                >
                  <div className="absolute inset-0">
                    <img 
                      src={category.icon} 
                      alt={category.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-spotify-dark via-spotify-dark/70 to-transparent"></div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <h3 className="text-xl font-semibold mb-1 group-hover:text-spotify transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-spotify-text/70 flex items-center">
                      <span>{category.courses} courses</span>
                      <ArrowRight size={16} className="ml-2 transition-transform duration-300 transform group-hover:translate-x-1" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link 
                to="/courses" 
                className="spotify-button inline-flex items-center"
              >
                Browse All Categories
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>
          </div>
        </section>
        
        {/* Featured Courses Section */}
        <FeaturedCourses />
        
        {/* Benefits Section */}
        <section className="py-20 bg-spotify-dark">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-spotify font-medium">Why Choose Learnify</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Benefits of Learning with Us</h2>
              <p className="text-spotify-text/70 text-lg">
                We provide a comprehensive learning experience designed to help you succeed in your career.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="bg-spotify-gray/20 backdrop-blur-md rounded-xl p-6 border border-white/10 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-spotify/10 rounded-full flex items-center justify-center mb-5">
                    <CheckCircle className="h-6 w-6 text-spotify" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-spotify-text/70">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-spotify-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1DB95430,_transparent_70%)]"></div>
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center animate-fade-in">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Ready to Start Your Learning Journey?
              </h2>
              <p className="text-xl text-spotify-text/80 mb-8 max-w-2xl mx-auto">
                Join thousands of students who are already expanding their knowledge and skills with our platform.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                <Link 
                  to="/courses" 
                  className="spotify-button text-lg"
                >
                  Explore Courses
                </Link>
                <Link 
                  to="/register" 
                  className="bg-transparent text-spotify-text border border-spotify-text/30 hover:border-spotify hover:text-spotify rounded-full py-3 px-8 font-semibold transition-colors duration-300 text-lg"
                >
                  Sign Up for Free
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;

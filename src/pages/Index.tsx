
import React from "react";
import HeroSection from "@/components/HeroSection";
import FeaturedCourses from "@/components/FeaturedCourses";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, BookOpen, Users, Award, Clock, CheckCircle, Sparkles, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const StudentDashboardPreview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrolledCount, setEnrolledCount] = React.useState(0);

  React.useEffect(() => {
    const fetchEnrolledCount = async () => {
      if (!user) return;
      try {
        const { count } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq("student_id", user.id);
        setEnrolledCount(count || 0);
      } catch (error) {
        // Silent fail - count remains 0
      }
    };
    fetchEnrolledCount();
  }, [user]);

  return (
    <Card className="border-border shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <LayoutDashboard className="text-primary" />
          Student Dashboard
        </CardTitle>
        <CardDescription>A preview of your learning activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-foreground">Enrolled Courses</span>
            <span className="font-bold text-primary">{enrolledCount}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-foreground">Recent Notifications</span>
            <span className="font-bold text-primary">3</span>
          </div>
          <Button onClick={() => navigate("/dashboard/student")} className="w-full gfg-button mt-4">
            Go to Dashboard
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
};

const TeacherDashboardPreview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [studentCount, setStudentCount] = React.useState(0);

  React.useEffect(() => {
    const fetchStudentCount = async () => {
      if (!user) return;
      try {
        // This is a simplified count. A more complex query would be needed for a real app.
        const { count } = await supabase
          .from("enrollments")
          .select("student_id", { count: "exact", head: true });
        setStudentCount(count || 0);
      } catch (error) {
        // Silent fail - count remains 0
      }
    };
    fetchStudentCount();
  }, [user]);

  return (
    <Card className="border-border shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <LayoutDashboard className="text-primary" />
          Teacher Dashboard
        </CardTitle>
        <CardDescription>A summary of your teaching activities.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-foreground">Active Students</span>
            <span className="font-bold text-primary">{studentCount}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-foreground">Upcoming Sessions</span>
            <span className="font-bold text-primary">2</span>
          </div>
          <Button onClick={() => navigate("/dashboard/teacher")} className="w-full gfg-button mt-4">
            Go to Dashboard
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
};

const DashboardPreview = () => {
  const { user, userRole } = useAuth();

  if (!user) return null;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          {userRole === "teacher" ? <TeacherDashboardPreview /> : <StudentDashboardPreview />}
        </div>
      </div>
    </section>
  );
};

import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user } = useAuth();
  const [stats, setStats] = React.useState([
    { label: "Courses", value: "...", icon: BookOpen },
    { label: "Students", value: "...", icon: Users },
    { label: "Instructors", value: "...", icon: Award },
    { label: "Course Hours", value: "1,200+", icon: Clock },
  ]);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: courseCount } = await supabase
          .from("courses")
          .select("*", { count: "exact", head: true });

        const { count: studentCount } = await supabase
          .from("user_roles")
          .select("*", { count: "exact", head: true })
          .eq("role", "student");

        const { count: teacherCount } = await supabase
          .from("user_roles")
          .select("*", { count: "exact", head: true })
          .eq("role", "teacher");

        // Formatting numbers for display
        const formatCount = (count) => {
          if (count > 1000) return `${(count / 1000).toFixed(1)}k+`;
          return `${count}+`;
        };

        setStats([
          { label: "Courses", value: formatCount(courseCount), icon: BookOpen },
          { label: "Students", value: formatCount(studentCount), icon: Users },
          { label: "Instructors", value: formatCount(teacherCount), icon: Award },
          { label: "Course Hours", value: "1,200+", icon: Clock }, // Stays hardcoded for now
        ]);
      } catch (error) {
        // Set fallback stats on error
        setStats([
          { label: "Courses", value: "200+", icon: BookOpen },
          { label: "Students", value: "15k+", icon: Users },
          { label: "Instructors", value: "50+", icon: Award },
          { label: "Course Hours", value: "1,200+", icon: Clock },
        ]);
      }
    };

    fetchStats();
  }, []);

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

        {/* Dynamic Section: Auth or Dashboard Preview */}
        {user ? <DashboardPreview /> : <FeaturedCourses />}
        
        {/* Stats Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="bg-card border border-border rounded-lg p-6 text-center shadow-sm animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Categories Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-primary font-medium">Diverse Learning Paths</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-foreground">Explore Course Categories</h2>
              <p className="text-muted-foreground text-lg">
                Discover a wide range of courses across different domains to help you achieve your learning goals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {categories.map((category, index) => (
                <Link 
                  key={index} 
                  to={category.link}
                  className="group rounded-lg overflow-hidden bg-card border border-border relative h-56 card-hover shadow-sm"
                >
                  <div className="absolute inset-0">
                    <img 
                      src={category.icon} 
                      alt={category.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <h3 className="text-xl font-semibold mb-1 text-foreground group-hover:text-primary transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground flex items-center">
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
                className="gfg-button inline-flex items-center"
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
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-primary font-medium">Why Choose LearnHub</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-foreground">Benefits of Learning with Us</h2>
              <p className="text-muted-foreground text-lg">
                We provide a comprehensive learning experience designed to help you succeed in your career.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="bg-card border border-border rounded-lg p-6 shadow-sm animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Premium Features Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-primary font-medium inline-flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                Premium Experience
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-foreground">Unlock Advanced Features</h2>
              <p className="text-muted-foreground text-lg">
                Take your learning journey to the next level with our premium features.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm animate-fade-in">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    <path d="M14.5 8a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5z"></path>
                    <path d="M7.5 12H9"></path>
                    <path d="M16.5 10H18"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">AI Assistant</h3>
                <p className="text-muted-foreground mb-4">
                  Get personalized help from our AI assistant available 24/7 to answer questions and guide your learning.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                    <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">1-on-1 Video Sessions</h3>
                <p className="text-muted-foreground mb-4">
                  Schedule video calls with expert instructors for direct guidance and personalized feedback.
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/premium-courses"
                className="gfg-button inline-flex items-center"
              >
                Explore Premium Features
                <ArrowRight size={18} className="ml-2" />
              </Link>
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
                  to="/premium-courses" 
                  className="bg-spotify/20 hover:bg-spotify/30 text-spotify border border-spotify/30 rounded-full py-3 px-8 font-semibold transition-colors duration-300 text-lg flex items-center justify-center"
                >
                  <Sparkles size={16} className="mr-2" />
                  Get Premium
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

import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeaturedCourses from "@/components/FeaturedCourses";
import { BookOpen, Users, Award, ArrowRight, Code, Palette, TrendingUp, Brain, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [activeTab, setActiveTab] = useState("all");

  const categories = [
    {
      title: "Development",
      description: "Learn programming, web, and app development",
      icon: Code,
      courses: "150+ Courses",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Design",
      description: "Master UI/UX, graphic design, and more",
      icon: Palette,
      courses: "80+ Courses",
      color: "from-pink-500 to-purple-500",
    },
    {
      title: "Business",
      description: "Entrepreneurship, marketing, and management",
      icon: TrendingUp,
      courses: "100+ Courses",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Data Science",
      description: "Analytics, ML, and AI fundamentals",
      icon: Brain,
      courses: "60+ Courses",
      color: "from-orange-500 to-red-500",
    },
  ];

  const stats = [
    { icon: BookOpen, value: "200+", label: "Expert Courses" },
    { icon: Users, value: "15,000+", label: "Active Students" },
    { icon: Award, value: "10,000+", label: "Certificates Issued" },
    { icon: Clock, value: "1,200+", label: "Course Hours" },
  ];

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

  return (
    <div className="min-h-screen">
      <Navbar />

      <HeroSection />

      {/* Featured Courses with Tabs */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Courses
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our most popular courses, handpicked by experts
            </p>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="free">Free</TabsTrigger>
              <TabsTrigger value="premium">Premium</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <FeaturedCourses />
            </TabsContent>
            
            <TabsContent value="free" className="mt-0">
              <FeaturedCourses filterType="free" />
            </TabsContent>
            
            <TabsContent value="premium" className="mt-0">
              <FeaturedCourses filterType="premium" />
            </TabsContent>
          </Tabs>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link to="/courses">
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-card border border-border rounded-xl p-6 text-center shadow-sm"
              >
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explore by Category
            </h2>
            <p className="text-lg text-muted-foreground">
              Find the perfect course for your interests
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.title}
                to="/courses"
                className="group relative overflow-hidden p-6 bg-card border border-border rounded-xl hover:shadow-xl transition-all duration-300 card-hover"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <category.icon className="w-12 h-12 mb-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors relative z-10">
                  {category.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 relative z-10">
                  {category.description}
                </p>
                <p className="text-sm font-medium text-primary relative z-10">
                  {category.courses}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose LEARNIFY</h2>
            <p className="text-muted-foreground text-lg">
              We provide a comprehensive learning experience designed to help you succeed
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="bg-card border border-border rounded-xl p-6 shadow-sm"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

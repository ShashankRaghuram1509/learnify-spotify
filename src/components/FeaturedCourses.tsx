
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CourseCard from "./CourseCard";

// Mock data for featured courses
const featuredCourses = [
  {
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
    featured: true,
    category: "development"
  },
  {
    id: "ui-ux-design",
    title: "UI/UX Design Mastery",
    instructor: "Michael Chang",
    rating: 4.7,
    students: 982,
    duration: "10 weeks",
    level: "Intermediate",
    price: 99.99,
    discountPrice: 69.99,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    featured: true,
    category: "design"
  },
  {
    id: "data-science-python",
    title: "Data Science with Python",
    instructor: "Emily Rodriguez",
    rating: 4.9,
    students: 2102,
    duration: "12 weeks",
    level: "Intermediate",
    price: 119.99,
    discountPrice: 79.99,
    image: "https://images.unsplash.com/photo-1551033406-611cf9a28f67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    featured: true,
    category: "data-science"
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing Strategies",
    instructor: "Alex Thompson",
    rating: 4.6,
    students: 1287,
    duration: "6 weeks",
    level: "All Levels",
    price: 79.99,
    discountPrice: 39.99,
    image: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2326&q=80",
    featured: true,
    category: "marketing"
  },
  {
    id: "ai-machine-learning",
    title: "AI & Machine Learning Fundamentals",
    instructor: "David Chen",
    rating: 4.8,
    students: 1843,
    duration: "14 weeks",
    level: "Advanced",
    price: 129.99,
    discountPrice: 89.99,
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2301&q=80",
    featured: true,
    category: "ai"
  },
  {
    id: "mobile-app-dev",
    title: "Mobile App Development",
    instructor: "Jessica Lee",
    rating: 4.7,
    students: 1204,
    duration: "10 weeks",
    level: "Intermediate",
    price: 99.99,
    discountPrice: 59.99,
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    featured: true,
    category: "development"
  }
];

const categories = [
  { id: "all", name: "All Categories" },
  { id: "development", name: "Development" },
  { id: "design", name: "Design" },
  { id: "marketing", name: "Marketing" },
  { id: "data-science", name: "Data Science" },
  { id: "ai", name: "AI & ML" }
];

const FeaturedCourses = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  
  const filteredCourses = activeCategory === "all" 
    ? featuredCourses 
    : featuredCourses.filter(course => course.category === activeCategory);
  
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
        
        <div className="flex overflow-x-auto scrollbar-none space-x-2 mb-8 pb-2">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;

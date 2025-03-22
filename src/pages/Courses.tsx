
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { Search, Filter, SlidersHorizontal, SortAsc, SortDesc, X } from "lucide-react";

// Mock data - in a real app, this would come from an API
const allCourses = [
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
  },
  {
    id: "js-advanced",
    title: "Advanced JavaScript Concepts",
    instructor: "Ryan Miller",
    rating: 4.9,
    students: 2341,
    duration: "8 weeks",
    level: "Advanced",
    price: 94.99,
    discountPrice: 64.99,
    image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    category: "development"
  },
  {
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
    category: "development"
  },
  {
    id: "digital-illustration",
    title: "Digital Illustration for Beginners",
    instructor: "Carlos Mendez",
    rating: 4.6,
    students: 1032,
    duration: "6 weeks",
    level: "Beginner",
    price: 69.99,
    discountPrice: 39.99,
    image: "https://images.unsplash.com/photo-1618788372246-79faff0c3742?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2342&q=80",
    category: "design"
  },
  {
    id: "adobe-photoshop",
    title: "Adobe Photoshop Essential Training",
    instructor: "Maria Garcia",
    rating: 4.7,
    students: 1543,
    duration: "8 weeks",
    level: "Beginner",
    price: 74.99,
    discountPrice: 49.99,
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2342&q=80",
    category: "design"
  },
  {
    id: "python-data-analysis",
    title: "Python for Data Analysis",
    instructor: "Andrew Wilson",
    rating: 4.9,
    students: 2103,
    duration: "10 weeks",
    level: "Intermediate",
    price: 99.99,
    discountPrice: 69.99,
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    category: "data-science"
  },
  {
    id: "seo-fundamentals",
    title: "SEO Fundamentals",
    instructor: "Laura Martinez",
    rating: 4.6,
    students: 987,
    duration: "4 weeks",
    level: "Beginner",
    price: 59.99,
    discountPrice: 29.99,
    image: "https://images.unsplash.com/photo-1571156425562-4a49b0d409c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    category: "marketing"
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

const levels = [
  { id: "all", name: "All Levels" },
  { id: "beginner", name: "Beginner" },
  { id: "intermediate", name: "Intermediate" },
  { id: "advanced", name: "Advanced" }
];

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [sortBy, setSortBy] = useState("popular"); // 'popular', 'price-low', 'price-high', 'rating'
  const [showFilters, setShowFilters] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState(allCourses);
  
  // Function to apply filters and sorting
  useEffect(() => {
    let result = [...allCourses];
    
    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(course => course.category === selectedCategory);
    }
    
    // Apply level filter
    if (selectedLevel !== "all") {
      result = result.filter(course => 
        course.level.toLowerCase() === selectedLevel
      );
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        course => 
          course.title.toLowerCase().includes(query) || 
          course.instructor.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.students - a.students);
        break;
      case "price-low":
        result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case "price-high":
        result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    
    setFilteredCourses(result);
  }, [selectedCategory, selectedLevel, searchQuery, sortBy]);
  
  // Function to reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSortBy("popular");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        {/* Header */}
        <section className="bg-spotify-dark py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#1DB95420,_transparent_50%)]"></div>
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
                Discover Our Courses
              </h1>
              <p className="text-xl text-spotify-text/80 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                Explore our comprehensive catalog of courses designed to help you master new skills and advance your career.
              </p>
              
              <div className="relative max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Search className="h-5 w-5 text-spotify-text/50" />
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 rounded-full bg-spotify-gray/40 backdrop-blur-sm 
                            border border-white/10 pl-12 pr-4 text-spotify-text placeholder:text-spotify-text/50
                            focus:outline-none focus:ring-2 focus:ring-spotify/50 focus:border-transparent
                            transition-all duration-300"
                  placeholder="Search for courses or instructors..."
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Courses Section */}
        <section className="py-16 bg-spotify-dark">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              {/* Category tabs (desktop) */}
              <div className="hidden md:flex overflow-x-auto scrollbar-none space-x-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                      selectedCategory === category.id
                        ? "bg-spotify text-white"
                        : "bg-spotify-gray/30 text-spotify-text/70 hover:bg-spotify-gray/50"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              
              {/* Sort and filter (desktop) */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-spotify-gray/30 text-spotify-text rounded-lg border border-white/10 px-4 py-2 pl-10 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-spotify/50"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-spotify-text/50" />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 bg-spotify-gray/30 text-spotify-text rounded-lg border border-white/10 px-4 py-2 hover:bg-spotify-gray/50 transition-colors duration-300"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </button>
                
                {(selectedCategory !== "all" || selectedLevel !== "all" || searchQuery) && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center space-x-2 text-spotify-text/70 hover:text-spotify-text transition-colors duration-300"
                  >
                    <X className="h-4 w-4" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
              
              {/* Mobile filters button */}
              <div className="md:hidden flex justify-between w-full">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 bg-spotify-gray/30 text-spotify-text rounded-lg border border-white/10 px-4 py-2 hover:bg-spotify-gray/50 transition-colors duration-300"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filters & Sort</span>
                </button>
                
                {(selectedCategory !== "all" || selectedLevel !== "all" || searchQuery) && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center space-x-2 text-spotify-text/70 hover:text-spotify-text transition-colors duration-300"
                  >
                    <X className="h-4 w-4" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Filters panel */}
            {showFilters && (
              <div className="bg-spotify-gray/20 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/10 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Categories (mobile only) */}
                  <div className="md:hidden">
                    <h3 className="text-sm font-medium mb-3">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(category => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${
                            selectedCategory === category.id
                              ? "bg-spotify text-white"
                              : "bg-spotify-gray/30 text-spotify-text/70 hover:bg-spotify-gray/50"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Levels */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Level</h3>
                    <div className="flex flex-wrap gap-2">
                      {levels.map(level => (
                        <button
                          key={level.id}
                          onClick={() => setSelectedLevel(level.id)}
                          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${
                            selectedLevel === level.id
                              ? "bg-spotify text-white"
                              : "bg-spotify-gray/30 text-spotify-text/70 hover:bg-spotify-gray/50"
                          }`}
                        >
                          {level.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Sort by (mobile only) */}
                  <div className="md:hidden">
                    <h3 className="text-sm font-medium mb-3">Sort By</h3>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-spotify-gray/30 text-spotify-text rounded-lg border border-white/10 px-4 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-spotify/50"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {/* Course Grid */}
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} {...course} className="animate-fade-in" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-2xl font-semibold mb-2">No Courses Found</h3>
                <p className="text-spotify-text/70 mb-6">
                  We couldn't find any courses matching your search criteria.
                </p>
                <button
                  onClick={resetFilters}
                  className="spotify-button"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Courses;

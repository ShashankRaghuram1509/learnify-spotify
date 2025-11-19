import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { Search, Filter, SlidersHorizontal, SortAsc, SortDesc, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  { id: "all", name: "All Categories" },
  { id: "free", name: "Free Courses" },
  { id: "premium", name: "Premium Courses" },
  { id: "programming", name: "Programming" },
  { id: "data-structures", name: "Data Structures" },
  { id: "algorithms", name: "Algorithms" },
  { id: "web-development", name: "Web Development" },
  { id: "databases", name: "Databases" },
  { id: "system-design", name: "System Design" },
  { id: "data-science", name: "Data Science" },
  { id: "cloud-computing", name: "Cloud Computing" },
  { id: "developer-tools", name: "Developer Tools" }
];

const levels = [
  { id: "all", name: "All Levels" },
  { id: "beginner", name: "Beginner" },
  { id: "intermediate", name: "Intermediate" },
  { id: "advanced", name: "Advanced" }
];

const Courses = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [sortBy, setSortBy] = useState("popular"); // 'popular', 'price-low', 'price-high', 'rating'
  const [showFilters, setShowFilters] = useState(false);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Extract search query from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search');
    if (query) {
      setSearchQuery(query);
    }
    
    // Get category from URL if present
    const category = params.get('category');
    if (category && categories.some(cat => cat.id === category)) {
      setSelectedCategory(category);
    }
    
    // Get level from URL if present
    const level = params.get('level');
    if (level && levels.some(lvl => lvl.id === level)) {
      setSelectedLevel(level);
    }
    
    // Get sort from URL if present
    const sort = params.get('sort');
    if (sort && ['popular', 'price-low', 'price-high', 'rating'].includes(sort)) {
      setSortBy(sort);
    }
  }, [location.search]);
  
  // Fetch courses from Supabase with categories
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("courses")
          .select(`
            *,
            course_categories(
              categories(name)
            )
          `);

        if (error) {
          throw error;
        }

        // Map category names to courses
        const coursesWithCategories = data?.map(course => {
          const categoryName = course.course_categories?.[0]?.categories?.name || null;
          
          // Map database category names to our filter category IDs
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
          
          return {
            ...course,
            category: categoryMap[categoryName] || 'programming'
          };
        }) || [];

        setCourses(coursesWithCategories);
      } catch (error) {
        toast.error("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);
  
  // Apply filters and search
  useEffect(() => {
    let filtered = [...courses];
    
    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory === "free") {
      filtered = filtered.filter(course => !course.is_premium);
    } else if (selectedCategory === "premium") {
      filtered = filtered.filter(course => course.is_premium);
    } else if (selectedCategory !== "all") {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }
    
    // Apply level filter (if needed in future)
    if (selectedLevel !== "all") {
      // Add level filtering logic when level data is available
    }
    
    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default:
        // Keep default order
        break;
    }
    
    setFilteredCourses(filtered);
  }, [courses, selectedCategory, selectedLevel, searchQuery, sortBy]);
  
  // Update URL with search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    
    if (selectedLevel !== 'all') {
      params.set('level', selectedLevel);
    }
    
    if (sortBy !== 'popular') {
      params.set('sort', sortBy);
    }
    
    const newSearch = params.toString();
    if (location.search !== `?${newSearch}` && !loading) {
      // Only update URL if the parameters have changed and we're not in initial loading
      navigate({
        pathname: location.pathname,
        search: newSearch ? `?${newSearch}` : ''
      }, { replace: true });
    }
  }, [selectedCategory, selectedLevel, searchQuery, sortBy, loading, location.pathname, navigate]);
  
  // Function to reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSortBy("popular");
    
    // Clear URL parameters
    navigate('/courses', { replace: true });
  };
  
  // Enhanced search handler with debounce
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle direct search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // URL will be updated by the effect that watches searchQuery
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
                <form onSubmit={handleSearchSubmit}>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Search className="h-5 w-5 text-spotify-text/50" />
                  </div>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full h-14 rounded-full bg-spotify-gray/40 backdrop-blur-sm 
                              border border-white/10 pl-12 pr-4 text-spotify-text placeholder:text-spotify-text/50
                              focus:outline-none focus:ring-2 focus:ring-spotify/50 focus:border-transparent
                              transition-all duration-300"
                    placeholder="Search for courses or instructors..."
                  />
                </form>
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
                        ? category.id === "free"
                          ? "bg-green-500 text-white"
                          : category.id === "premium"
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
                          : "bg-spotify text-white"
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
            
            {/* Mobile filters panel */}
            {showFilters && (
              <div className="md:hidden bg-spotify-gray/20 rounded-xl p-4 mb-6 space-y-4 animate-fade-in">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold mb-2">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                          selectedCategory === category.id
                            ? category.id === "free"
                              ? "bg-green-500 text-white"
                              : category.id === "premium"
                              ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
                              : "bg-spotify text-white"
                            : "bg-spotify-gray/30 text-spotify-text/70"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Levels */}
                <div>
                  <h3 className="font-semibold mb-2">Level</h3>
                  <div className="flex flex-wrap gap-2">
                    {levels.map(level => (
                      <button
                        key={level.id}
                        onClick={() => setSelectedLevel(level.id)}
                        className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                          selectedLevel === level.id
                            ? "bg-spotify text-white"
                            : "bg-spotify-gray/30 text-spotify-text/70"
                        }`}
                      >
                        {level.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Sort */}
                <div>
                  <h3 className="font-semibold mb-2">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-spotify-gray/30 text-spotify-text rounded-lg border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-spotify/50"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            )}
            
            {/* Filters display (desktop) */}
            {showFilters && (
              <div className="hidden md:block bg-spotify-gray/20 rounded-xl p-6 mb-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Level filter */}
                  <div>
                    <h3 className="font-semibold mb-3">Level</h3>
                    <div className="flex flex-wrap gap-2">
                      {levels.map(level => (
                        <button
                          key={level.id}
                          onClick={() => setSelectedLevel(level.id)}
                          className={`px-4 py-2 rounded-full transition-all duration-300 ${
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
                </div>
              </div>
            )}
            
            {/* Results count */}
            <div className="mb-6">
              <p className="text-spotify-text/70">
                Showing {filteredCourses.length} of {courses.length} courses
                {searchQuery && (
                  <span> for "{searchQuery}"</span>
                )}
              </p>
            </div>
            
            {/* Course Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-spotify-gray/20 rounded-xl animate-pulse">
                    <div className="h-48 bg-spotify-gray/30 rounded-t-xl mb-4"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-spotify-gray/30 rounded w-3/4"></div>
                      <div className="h-4 bg-spotify-gray/30 rounded w-1/2"></div>
                      <div className="h-4 bg-spotify-gray/30 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
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
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-2xl font-semibold mb-4">No Courses Found</h3>
                <p className="text-spotify-text/70 mb-8 max-w-md mx-auto">
                  We couldn't find any courses matching your search criteria. 
                  Try adjusting your filters or search query.
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
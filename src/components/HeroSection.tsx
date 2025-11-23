
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, Code, Database, Cloud } from "lucide-react";
import { Button } from "./ui/button";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quickFilters = [
    { label: "Web Development", icon: Code, filter: "web-development" },
    { label: "Data Science", icon: TrendingUp, filter: "data-science" },
    { label: "Databases", icon: Database, filter: "databases" },
    { label: "Cloud Computing", icon: Cloud, filter: "cloud-computing" },
  ];

  const handleQuickFilter = (filter: string) => {
    navigate(`/courses?category=${filter}`);
  };

  return (
    <section className="relative bg-spotify-dark pt-32 pb-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1DB95440,_transparent_50%)]"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
            Learn, Practice, and Excel in
            <span className="block text-spotify mt-2">Programming & Technology</span>
          </h1>
          
          <p className="text-lg md:text-xl text-spotify-text/80 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Master coding skills with interactive courses, tutorials, and real-world projects
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-spotify-text/50" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for courses, tutorials, or topics..."
                  className="w-full pl-12 pr-4 py-4 bg-spotify-gray/30 border border-white/10 rounded-xl text-spotify-text placeholder:text-spotify-text/50 focus:outline-none focus:ring-2 focus:ring-spotify focus:border-transparent transition-all"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-6 spotify-button"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <span className="text-spotify-text/60 text-sm self-center">Quick access:</span>
            {quickFilters.map((filter) => (
              <button
                key={filter.filter}
                onClick={() => handleQuickFilter(filter.filter)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-spotify-gray/20 border border-white/10 rounded-full text-sm text-spotify-text hover:bg-spotify/10 hover:border-spotify/30 transition-all duration-300"
              >
                <filter.icon className="h-4 w-4" />
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

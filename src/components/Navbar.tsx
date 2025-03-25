
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, User, ChevronDown, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsOpen(false);
    
    // Extract search query from URL if present
    if (location.pathname === '/courses' && location.search) {
      const params = new URLSearchParams(location.search);
      const query = params.get('search');
      if (query) {
        setSearchQuery(query);
      }
    } else {
      // Reset search query when not on courses page
      setSearchQuery("");
    }
  }, [location]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        scrolled 
          ? "bg-spotify-dark/90 backdrop-blur-lg shadow-lg py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 animate-fade-in"
          >
            <div className="w-10 h-10 rounded-full bg-spotify flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-xl font-bold">Learnify</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-6">
              <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
                Home
              </Link>
              <Link to="/courses" className={`nav-link ${isActive("/courses") ? "active" : ""}`}>
                Courses
              </Link>
              <Link to="/about" className={`nav-link ${isActive("/about") ? "active" : ""}`}>
                About
              </Link>
              <Link to="/contact" className={`nav-link ${isActive("/contact") ? "active" : ""}`}>
                Contact
              </Link>
            </div>

            <form onSubmit={handleSearch} className="relative h-10 w-64 transition-all">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-full bg-spotify-gray/50 
                          border-none focus:ring-0 focus:outline-none
                          pl-10 pr-4 text-sm text-spotify-text placeholder:text-muted-foreground
                          transition-all duration-300"
                placeholder="Search courses..."
              />
            </form>

            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-spotify-text/80 hover:text-spotify-text transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-spotify-gray flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <span>{user?.name}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-spotify-gray shadow-lg py-1 z-10 animate-fade-in">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-spotify-text hover:bg-spotify-dark transition-colors duration-200"
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/my-courses" 
                      className="block px-4 py-2 text-sm text-spotify-text hover:bg-spotify-dark transition-colors duration-200"
                    >
                      My Courses
                    </Link>
                    <Link 
                      to="/settings" 
                      className="block px-4 py-2 text-sm text-spotify-text hover:bg-spotify-dark transition-colors duration-200"
                    >
                      Settings
                    </Link>
                    <button 
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-spotify-text hover:bg-spotify-dark transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="flex items-center space-x-1 text-spotify-text/70 hover:text-spotify-text transition-colors duration-200"
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
                <Link 
                  to="/register" 
                  className="spotify-button py-2 px-4 text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-spotify-text focus:outline-none"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-spotify-dark border-t border-spotify-gray/30 animate-slide-from-left">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col space-y-4 py-4">
              <Link 
                to="/" 
                className={`text-lg ${isActive("/") ? "text-spotify" : "text-spotify-text/70"}`}
              >
                Home
              </Link>
              <Link 
                to="/courses" 
                className={`text-lg ${isActive("/courses") ? "text-spotify" : "text-spotify-text/70"}`}
              >
                Courses
              </Link>
              <Link 
                to="/about" 
                className={`text-lg ${isActive("/about") ? "text-spotify" : "text-spotify-text/70"}`}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className={`text-lg ${isActive("/contact") ? "text-spotify" : "text-spotify-text/70"}`}
              >
                Contact
              </Link>

              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 rounded-full bg-spotify-gray/50 
                            border-none focus:ring-0 focus:outline-none
                            pl-10 pr-4 text-sm text-spotify-text"
                  placeholder="Search courses..."
                />
              </form>

              {isAuthenticated ? (
                <div className="space-y-3 pt-2 border-t border-spotify-gray/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-spotify-gray flex items-center justify-center">
                      <User size={16} />
                    </div>
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  <Link 
                    to="/profile" 
                    className="block text-spotify-text/70 hover:text-spotify-text transition-colors duration-200"
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/my-courses" 
                    className="block text-spotify-text/70 hover:text-spotify-text transition-colors duration-200"
                  >
                    My Courses
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block text-spotify-text/70 hover:text-spotify-text transition-colors duration-200"
                  >
                    Settings
                  </Link>
                  <button 
                    onClick={logout}
                    className="block w-full text-left text-spotify-text/70 hover:text-spotify-text transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3 pt-3 border-t border-spotify-gray/30">
                  <Link 
                    to="/login" 
                    className="flex items-center space-x-2 text-spotify-text/70 hover:text-spotify-text transition-colors duration-200"
                  >
                    <LogIn size={18} />
                    <span>Login</span>
                  </Link>
                  <Link 
                    to="/register" 
                    className="spotify-button text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

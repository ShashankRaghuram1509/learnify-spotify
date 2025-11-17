
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";

const Navbar = () => {
  const { user, userRole, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

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
    if (path === "/courses") {
      return location.pathname.startsWith(path);
    }
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

            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate(userRole === 'admin' ? '/admin' : `/dashboard/${userRole}`)}
                    className="flex items-center gap-2"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Button>
                  <Button onClick={signOut} variant="outline" size="sm">Logout</Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/auth">Login</Link>
                  </Button>
                  <Button asChild size="sm" className="spotify-button">
                    <Link to="/auth">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
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

              <div className="flex items-center gap-4 pt-4 border-t border-spotify-gray/30">
                {user ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(userRole === 'admin' ? '/admin' : `/dashboard/${userRole}`)}
                    >
                      Dashboard
                    </Button>
                    <Button onClick={signOut} size="sm" className="w-full spotify-button">Logout</Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to="/auth">Login</Link>
                    </Button>
                    <Button asChild size="sm" className="w-full spotify-button">
                      <Link to="/auth">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

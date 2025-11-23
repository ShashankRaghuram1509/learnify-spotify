import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, LayoutDashboard, BookOpen } from "lucide-react";
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
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    
    if (location.pathname === '/courses' && location.search) {
      const params = new URLSearchParams(location.search);
      const query = params.get('search');
      if (query) setSearchQuery(query);
    } else {
      setSearchQuery("");
    }
  }, [location]);

  const isActive = (path: string) => {
    if (path === "/courses") return location.pathname.startsWith(path);
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
        "fixed top-0 left-0 w-full z-50 transition-all duration-200 border-b",
        scrolled 
          ? "bg-background/95 backdrop-blur-md shadow-sm border-border"
          : "bg-background border-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
          >
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">LearnHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
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

          <div className="hidden md:flex items-center gap-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-64 rounded-md bg-muted/50 border border-border
                          pl-9 pr-4 text-sm focus:outline-none focus:ring-2 
                          focus:ring-primary focus:border-transparent"
                placeholder="Search courses..."
              />
            </form>

            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(userRole === 'admin' ? '/admin' : `/dashboard/${userRole}`)}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button onClick={signOut} variant="outline" size="sm">Logout</Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">Login</Link>
                </Button>
                <Button asChild size="sm" className="gfg-button">
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground focus:outline-none"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-background border-t border-border animate-slide-from-left">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link to="/" className={`block py-2 ${isActive("/") ? "text-primary font-medium" : "text-muted-foreground"}`}>
              Home
            </Link>
            <Link to="/courses" className={`block py-2 ${isActive("/courses") ? "text-primary font-medium" : "text-muted-foreground"}`}>
              Courses
            </Link>
            <Link to="/about" className={`block py-2 ${isActive("/about") ? "text-primary font-medium" : "text-muted-foreground"}`}>
              About
            </Link>
            <Link to="/contact" className={`block py-2 ${isActive("/contact") ? "text-primary font-medium" : "text-muted-foreground"}`}>
              Contact
            </Link>

            <form onSubmit={handleSearch} className="relative pt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 rounded-md bg-muted/50 border border-border
                          pl-10 pr-4 text-sm"
                placeholder="Search courses..."
              />
            </form>

            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              {user ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate(userRole === 'admin' ? '/admin' : `/dashboard/${userRole}`)}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button onClick={signOut} size="sm" className="w-full gfg-button">Logout</Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/auth">Login</Link>
                  </Button>
                  <Button asChild size="sm" className="w-full gfg-button">
                    <Link to="/auth">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

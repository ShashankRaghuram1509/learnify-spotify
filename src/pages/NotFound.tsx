
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-spotify-dark">
      <div className="text-center px-4">
        <h1 className="text-8xl font-bold text-spotify mb-4">404</h1>
        <p className="text-2xl text-spotify-text mb-6">Oops! Page not found</p>
        <p className="text-spotify-text/70 max-w-md mx-auto mb-8">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link 
            to="/" 
            className="spotify-button py-3 px-6 flex items-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="bg-transparent border border-spotify-text/30 text-spotify-text hover:bg-spotify-gray/30 
                     transition-colors duration-300 rounded-full py-3 px-6 flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

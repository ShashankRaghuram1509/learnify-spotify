
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  type: "login" | "register";
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (type === "login") {
        await login(email, password);
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      } else {
        await register(name, email, password);
        toast({
          title: "Account created!",
          description: "Your account has been successfully created.",
        });
      }
      
      navigate("/");
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "Error",
        description: "An error occurred during authentication. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="max-w-md w-full mx-auto p-6 bg-spotify-gray/20 backdrop-blur-md rounded-xl border border-white/10 shadow-xl animate-scale-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">
          {type === "login" ? "Welcome Back!" : "Create Your Account"}
        </h2>
        <p className="mt-2 text-spotify-text/70">
          {type === "login" 
            ? "Sign in to continue your learning journey" 
            : "Start your learning journey today"}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {type === "register" && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-spotify-dark border border-spotify-gray/50 text-spotify-text focus:outline-none focus:ring-2 focus:ring-spotify/50 focus:border-transparent transition-all duration-200"
              placeholder="Enter your full name"
              required
            />
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-spotify-dark border border-spotify-gray/50 text-spotify-text focus:outline-none focus:ring-2 focus:ring-spotify/50 focus:border-transparent transition-all duration-200"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-spotify-dark border border-spotify-gray/50 text-spotify-text focus:outline-none focus:ring-2 focus:ring-spotify/50 focus:border-transparent transition-all duration-200"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-spotify-text/50 hover:text-spotify-text transition-colors duration-200"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          {type === "login" && (
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="text-sm text-spotify hover:underline">
                Forgot password?
              </Link>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="spotify-button w-full flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              {type === "login" ? "Signing in..." : "Creating account..."}
            </>
          ) : (
            <>{type === "login" ? "Sign In" : "Create Account"}</>
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        {type === "login" ? (
          <p className="text-spotify-text/70">
            Don't have an account?{" "}
            <Link to="/register" className="text-spotify hover:underline">
              Sign up
            </Link>
          </p>
        ) : (
          <p className="text-spotify-text/70">
            Already have an account?{" "}
            <Link to="/login" className="text-spotify hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
      
      <div className="mt-8 pt-6 border-t border-spotify-gray/30">
        <div className="flex flex-col space-y-3">
          <button className="w-full px-4 py-3 flex items-center justify-center space-x-2 bg-white text-spotify-dark rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
          
          <button className="w-full px-4 py-3 flex items-center justify-center space-x-2 bg-[#3b5998] text-white rounded-lg hover:bg-[#324b81] transition-colors duration-200">
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path fill="currentColor" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/>
            </svg>
            <span>Continue with Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;

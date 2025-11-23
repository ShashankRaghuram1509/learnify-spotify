
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, ChevronRight } from "lucide-react";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "Master New Skills",
      subtitle: "With Our Interactive Courses",
      description: "Join thousands of students learning the latest technologies with our expertly crafted courses.",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      cta: "View Courses",
      link: "/courses"
    },
    {
      title: "Learn Anywhere, Anytime",
      subtitle: "Education Without Boundaries",
      description: "Study at your own pace with our flexible learning platform that adapts to your schedule.",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      cta: "Start Learning",
      link: "/register"
    },
    {
      title: "Taught By Industry Experts",
      subtitle: "Learn From The Best",
      description: "Our instructors are active professionals sharing their real-world experience and knowledge.",
      image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2274&q=80",
      cta: "Meet Our Team",
      link: "/about"
    }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [slides.length]);
  
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background slider */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-spotify-dark via-spotify-dark/80 to-transparent z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 pt-20">
        <div className="max-w-3xl">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`transition-all duration-1000 ${
                index === currentSlide 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-8 absolute"
              }`}
            >
              {index === currentSlide && (
                <>
                  <div className="inline-block mb-3 bg-spotify/20 backdrop-blur-sm border border-spotify/20 rounded-full px-4 py-1 text-sm text-spotify animate-fade-in">
                    {slide.subtitle}
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                    {slide.title}
                  </h1>
                  <p className="text-spotify-text/80 text-lg md:text-xl mb-8 max-w-2xl animate-fade-up" style={{ animationDelay: "0.3s" }}>
                    {slide.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
                    <Link
                      to={slide.link}
                      className="spotify-button flex items-center"
                    >
                      {slide.cta}
                      <ChevronRight size={18} className="ml-1" />
                    </Link>
                    <button className="flex items-center space-x-2 text-spotify-text/80 hover:text-spotify-text transition-colors duration-300 bg-spotify-dark/40 backdrop-blur-sm rounded-full px-4 py-3 border border-white/10">
                      <Play size={18} fill="currentColor" className="text-spotify" />
                      <span>Watch Demo</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Dots navigation */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "bg-spotify w-8" 
                  : "bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

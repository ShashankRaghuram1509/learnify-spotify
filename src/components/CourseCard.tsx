
import React from "react";
import { Link } from "react-router-dom";
import { Clock, Users, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  students: number;
  duration: string;
  level: string;
  price: number;
  discountPrice?: number;
  image: string;
  featured?: boolean;
  className?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  instructor,
  rating,
  students,
  duration,
  level,
  price,
  discountPrice,
  image,
  featured = false,
  className,
}) => {
  const hasDiscount = discountPrice !== undefined;
  
  return (
    <Link 
      to={`/courses/${id}`} 
      className={cn(
        "block rounded-xl overflow-hidden bg-spotify-gray/20 border border-spotify-gray/30 card-hover",
        featured ? "transform shadow-xl" : "",
        className
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        
        {featured && (
          <div className="absolute top-4 left-4 bg-spotify text-white text-xs font-semibold px-2 py-1 rounded">
            Featured
          </div>
        )}
        
        {level && (
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded">
            {level}
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
        
        <p className="text-spotify-text/70 text-sm mb-3">{instructor}</p>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center text-yellow-400">
            <Star size={16} fill="currentColor" stroke="none" />
            <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
          </div>
          <span className="mx-2 text-spotify-text/40">•</span>
          <div className="flex items-center text-spotify-text/70 text-sm">
            <Users size={14} className="mr-1" />
            {students} students
          </div>
        </div>
        
        <div className="flex items-center text-sm text-spotify-text/70 mb-4">
          <Clock size={14} className="mr-1" />
          {duration}
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            {hasDiscount ? (
              <>
                <span className="text-spotify font-bold">${discountPrice.toFixed(2)}</span>
                <span className="text-spotify-text/50 line-through text-sm ml-2">
                  ${price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-spotify font-bold">${price.toFixed(2)}</span>
            )}
          </div>
          
          <div className="bg-spotify/10 hover:bg-spotify/20 text-spotify px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200">
            View Course
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;

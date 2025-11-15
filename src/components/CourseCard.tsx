
import React from "react";
import { Link } from "react-router-dom";
import { Clock, Users, Star, ExternalLink } from "lucide-react";
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
  premium?: boolean;
  externalLink?: string;
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
  premium = false,
  externalLink,
  className,
}) => {
  const safeRating = rating ?? 0;
  const safePrice = price ?? 0;
  const safeDiscountPrice = discountPrice ?? 0;
  
  const hasDiscount = discountPrice !== undefined && discountPrice > 0;
  const isFree = safePrice === 0 || (discountPrice !== undefined && safeDiscountPrice === 0);
  
  const CardContent = () => (
    <>
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
        
        {premium && (
          <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Premium
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
            <span className="ml-1 text-sm font-medium">{safeRating.toFixed(1)}</span>
          </div>
          <span className="mx-2 text-spotify-text/40">•</span>
          <div className="flex items-center text-spotify-text/70 text-sm">
            <Users size={14} className="mr-1" />
            {students ?? 0} students
          </div>
        </div>
        
        <div className="flex items-center text-sm text-spotify-text/70 mb-4">
          <Clock size={14} className="mr-1" />
          {duration}
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            {isFree ? (
              <span className="text-green-500 font-bold">Free</span>
            ) : hasDiscount ? (
              <>
                <span className="text-spotify font-bold">${safeDiscountPrice.toFixed(2)}</span>
                <span className="text-spotify-text/50 line-through text-sm ml-2">
                  ${safePrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-spotify font-bold">${safePrice.toFixed(2)}</span>
            )}
          </div>
          
          <div className={`${externalLink ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-500" : "bg-spotify/10 hover:bg-spotify/20 text-spotify"} px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 flex items-center`}>
            {externalLink && <ExternalLink size={12} className="mr-1" />}
            {externalLink ? "View Tutorial" : "View Course"}
          </div>
        </div>
      </div>
    </>
  );
  
  return externalLink ? (
    <a 
      href={externalLink}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block rounded-xl overflow-hidden bg-spotify-gray/20 border border-spotify-gray/30 card-hover",
        featured ? "transform shadow-xl" : "",
        className
      )}
    >
      <CardContent />
    </a>
  ) : (
    <Link 
      to={`/courses/${id}`} 
      className={cn(
        "block rounded-xl overflow-hidden bg-spotify-gray/20 border border-spotify-gray/30 card-hover",
        featured ? "transform shadow-xl" : "",
        className
      )}
    >
      <CardContent />
    </Link>
  );
};

export default CourseCard;

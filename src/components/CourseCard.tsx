import React from "react";
import { Link } from "react-router-dom";
import { Clock, Users, Star, ExternalLink, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

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
  
  const CardContentComponent = () => (
    <Card className={cn(
      "group overflow-hidden transition-all duration-200 h-full flex flex-col",
      premium ? "border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20" : "border border-border hover:border-primary/50",
      "card-hover",
      className
    )}>
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        <div className="absolute top-2 left-2 flex gap-1">
          {featured && (
            <Badge className="bg-primary text-primary-foreground text-xs py-0">Featured</Badge>
          )}
          {premium && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 text-xs py-0">Premium</Badge>
          )}
        </div>
        
        {level && (
          <Badge variant="outline" className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm text-xs py-0">
            {level}
          </Badge>
        )}
      </div>
      
      <CardHeader className="space-y-1 flex-grow p-3 pb-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <BookOpen className="w-3 h-3" />
          <span className="truncate">{instructor}</span>
        </div>
        <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 pt-0 p-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-primary text-primary" />
            <span className="font-medium text-foreground">{safeRating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{students ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            {isFree ? (
              <span className="text-base font-bold text-primary">Free</span>
            ) : hasDiscount ? (
              <div className="flex items-center gap-1">
                <span className="text-base font-bold text-foreground">₹{safeDiscountPrice.toFixed(0)}</span>
                <span className="text-xs text-muted-foreground line-through">
                  ₹{safePrice.toFixed(0)}
                </span>
              </div>
            ) : (
              <span className="text-base font-bold text-foreground">₹{safePrice.toFixed(0)}</span>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
            {externalLink && <ExternalLink className="w-3 h-3" />}
            <span>{externalLink ? "View" : "View"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  return externalLink ? (
    <a 
      href={externalLink}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <CardContentComponent />
    </a>
  ) : (
    <Link to={`/courses/${id}`} className="block">
      <CardContentComponent />
    </Link>
  );
};

export default CourseCard;

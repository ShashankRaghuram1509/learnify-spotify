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
    <Card className={cn("group overflow-hidden border border-border hover:border-primary/50 transition-all duration-200 card-hover h-full flex flex-col", className)}>
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        <div className="absolute top-3 left-3 flex gap-2">
          {featured && (
            <Badge className="bg-primary text-primary-foreground">Featured</Badge>
          )}
          {premium && (
            <Badge variant="secondary" className="bg-card border border-border">Premium</Badge>
          )}
        </div>
        
        {level && (
          <Badge variant="outline" className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm">
            {level}
          </Badge>
        )}
      </div>
      
      <CardHeader className="space-y-2 flex-grow pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span>{instructor}</span>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="font-medium text-foreground">{safeRating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{students ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            {isFree ? (
              <span className="text-lg font-bold text-primary">Free</span>
            ) : hasDiscount ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">₹{safeDiscountPrice.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground line-through">
                  ₹{safePrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-foreground">₹{safePrice.toFixed(2)}</span>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
            {externalLink && <ExternalLink className="w-4 h-4" />}
            <span>{externalLink ? "Tutorial" : "View"}</span>
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

import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  className?: string;
}

export default function StarRating({ rating, reviewCount, className }: StarRatingProps) {
  // Create an array of 5 stars
  const stars = Array.from({ length: 5 }, (_, i) => {
    const value = i + 1;
    
    // Full star
    if (value <= rating) {
      return <Star key={i} className="fill-yellow-400 text-yellow-400" size={16} />;
    }
    
    // Half star
    if (value - 0.5 <= rating) {
      return <StarHalf key={i} className="fill-yellow-400 text-yellow-400" size={16} />;
    }
    
    // Empty star
    return <Star key={i} className="text-gray-300" size={16} />;
  });

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex">{stars}</div>
      {reviewCount !== undefined && (
        <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
      )}
    </div>
  );
}

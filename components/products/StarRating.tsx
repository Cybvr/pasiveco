import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating?: number;
  count?: number;
  className?: string;
}

export default function StarRating({ rating = 0, count = 0, className = "" }: StarRatingProps) {
  if (rating === 0 && count === 0) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= Math.round(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
      {count > 0 && <span className="text-[10px] text-muted-foreground font-medium">({count})</span>}
    </div>
  );
}

import React from 'react';
import { Check } from 'lucide-react';

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function VerifiedBadge({ className = "", size = "md" }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "w-3 h-3 p-0.5",
    md: "w-4 h-4 p-0.5",
    lg: "w-5 h-5 p-1"
  };

  const iconSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5"
  };

  return (
    <div className={`flex items-center justify-center rounded-full bg-blue-500 border-2 border-background shadow-sm ${sizeClasses[size]} ${className}`}>
      <Check className={`${iconSizes[size]} text-white stroke-[4px]`} />
    </div>
  );
}

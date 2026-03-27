import React from 'react';

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
}

export default function VerifiedBadge({ className = "", size = "md", title }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6"
  };

  return (
    <svg 
      className={`${sizeClasses[size]} ${className} drop-shadow-sm`} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title || "Verified"}
    >
      <title>{title || "Verified"}</title>
      <path 
        d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.95-.81-4.1-.73-.83-1.78-1.27-2.87-1.27-.37 0-.74.05-1.1.15-.67-1.31-2.02-2.19-3.53-2.19s-2.86.88-3.53 2.19c-.36-.1-.73-.15-1.1-.15-1.09 0-2.14.44-2.87 1.27-1.01 1.15-1.27 2.71-.81 4.1-1.31.67-2.19 1.91-2.19 3.34s.88 2.67 2.19 3.34c-.46 1.39-.2 2.95.81 4.1.73.83 1.78 1.27 2.87 1.27.37 0 .74-.05 1.1-.15.67 1.31 2.02 2.19 3.53 2.19s2.86-.88 3.53-2.19c.36.1.73.15 1.1.15 1.09 0 2.14-.44 2.87-1.27 1.01-1.15 1.27-2.71.81-4.1 1.31-.67 2.19-1.91 2.19-3.34z" 
        fill="#0095f6"
      />
      <path 
        d="M9.7 17.16l-3.37-3.37L7.75 12.4l1.95 1.95 5.56-5.56 1.42 1.42-6.98 6.95z" 
        fill="white"
      />
    </svg>
  );
}

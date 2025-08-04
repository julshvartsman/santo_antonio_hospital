import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center">
        {/* Blue square with white symbol */}
        <div
          className={`${sizeClasses[size]} w-12 bg-[#225384] rounded flex items-center justify-center mr-3`}
        >
          <div className="w-6 h-6 relative">
            {/* Stylized "8" symbol - two connected circles */}
            <div className="absolute left-0 top-1 w-4 h-4 bg-white rounded-full"></div>
            <div className="absolute right-0 top-1 w-3 h-3 bg-white rounded-full"></div>
            <div className="absolute left-2 top-2 w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col">
          <span className="text-[#225384] font-serif text-lg leading-none">
            santo antónio
          </span>
          <span className="text-[#225384] text-xs uppercase tracking-wide leading-none mt-1">
            centro hospitalar universitário de santo antónio
          </span>
        </div>
      </div>
    </div>
  );
}

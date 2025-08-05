import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const imageSizes = {
    sm: { width: 64, height: 64 }, // Increased from 48x48
    md: { width: 100, height: 100 }, // Increased from 80x80
    lg: { width: 150, height: 150 }, // Increased from 120x120
    xl: { width: 200, height: 200 }, // Increased from 160x160
    "2xl": { width: 300, height: 300 }, // New extra large size for login
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/images/santo-antonio logo.png"
        alt="Santo António Hospital Logo"
        width={imageSizes[size].width}
        height={imageSizes[size].height}
        className="object-contain"
        priority
      />
    </div>
  );
}

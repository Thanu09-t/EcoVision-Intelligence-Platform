"use client";
import { useEffect, useState, ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number; // Delay in milliseconds before fade starts
  duration?: number; // Duration in milliseconds for transition
  className?: string;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 1000,
  className = "",
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

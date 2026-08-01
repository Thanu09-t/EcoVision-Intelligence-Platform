"use client";
import { useEffect, useState } from "react";

interface AnimatedHeadingProps {
  text: string;
  className?: string;
  initialDelay?: number; // Initial delay in ms (default 200)
  charDelay?: number; // Delay per character in ms (default 30)
  duration?: number; // Transition duration per character in ms (default 500)
}

export function AnimatedHeading({
  text,
  className = "",
  initialDelay = 200,
  charDelay = 30,
  duration = 500,
}: AnimatedHeadingProps) {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, initialDelay);
    return () => clearTimeout(timer);
  }, [initialDelay]);

  const lines = text.split("\n");

  return (
    <h1
      className={className}
      style={{ letterSpacing: "-0.04em" }}
    >
      {lines.map((line, lineIndex) => {
        const lineLength = line.length;

        return (
          <div key={lineIndex} className="block overflow-hidden">
            {line.split("").map((char, charIndex) => {
              const staggerDelay =
                lineIndex * lineLength * charDelay + charIndex * charDelay;

              return (
                <span
                  key={charIndex}
                  className="inline-block transition-all ease-out"
                  style={{
                    opacity: isAnimated ? 1 : 0,
                    transform: isAnimated
                      ? "translateX(0px)"
                      : "translateX(-18px)",
                    transitionDuration: `${duration}ms`,
                    transitionDelay: `${staggerDelay}ms`,
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              );
            })}
          </div>
        );
      })}
    </h1>
  );
}

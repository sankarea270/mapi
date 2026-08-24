"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({ children, className = "", delay = 0 }: ScrollRevealProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: "translateY(30px)",
        animation: `text-reveal 0.7s ease-out ${delay}s forwards`,
      }}
    >
      {children}
    </div>
  );
}

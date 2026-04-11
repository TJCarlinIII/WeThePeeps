"use client";
import { useEffect, useState } from "react";

export default function MouseGlow() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Use requestAnimationFrame for high-performance positioning
      requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    
    // Initial position in center
    setMousePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{
        background: `radial-gradient(
          600px circle at ${mousePos.x}px ${mousePos.y}px,
          rgba(74, 144, 226, 0.15),
          transparent 80%
        )`,
      }}
      aria-hidden="true"
    />
  );
}
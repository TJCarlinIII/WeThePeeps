// src/components/Logo.tsx (Updated for the "Bleeding" Newspaper effect)

import { cn } from "@/lib/utils";

export default function Logo({ 
  className, 
  size = "text-5xl md:text-7xl" 
}: { 
  className?: string; 
  size?: string 
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <h1 
        className={cn(
          size,
          "font-black uppercase leading-none text-transparent bg-clip-text tracking-tighter whitespace-nowrap select-none relative",
          // Adding a subtle "pulse" to make the blood look fresh
          "animate-pulse-slow" 
        )}
        style={{ 
          // Swap the flag for a blood-texture or a deep red gradient
          backgroundImage: 'linear-gradient(to bottom, #800000 0%, #4a0000 100%)', 
          WebkitBackgroundClip: 'text',
          // Applying a drop-shadow to give the "drips" depth
          filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.8))'
        }}
      >
        We The Peeps
        
        {/* CSS Drip Overlay (Conceptual - can be expanded with SVG masks) */}
        <span className="absolute inset-0 bg-clip-text text-transparent pointer-events-none opacity-40"
              style={{ 
                backgroundImage: 'url(/blood-drip-overlay.png)', // You can add a PNG with transparency
                WebkitBackgroundClip: 'text',
              }}>
          We The Peeps
        </span>
      </h1>
    </div>
  );
}
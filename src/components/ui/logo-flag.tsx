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
          // font-black matches the weight of your gold text
          // tracking-tighter creates that "Preamble" look
          // whitespace-nowrap prevents the text from breaking into two lines
          "font-black uppercase leading-none text-transparent bg-clip-text bg-cover bg-center tracking-tighter whitespace-nowrap transition-all duration-300 select-none will-change-transform",
        )}
        style={{ 
          backgroundImage: 'url(/american-flag.avif)', // Optimized AVIF file
          WebkitBackgroundClip: 'text',
        }}
      >
        We The Peeps
      </h1>
      
      {/* The small line was removed as requested, 
          allowing the gold version in page.tsx to take center stage.
      */}
    </div>
  );
}
// File: src/components/ui/logo-main.tsx
import { cn } from "@/lib/utils";

export default function LogoMain({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center w-full max-w-2xl mx-auto", className)}>
      
      {/* 1. MAIN LOGO - Slight increase in leading to prevent overlap */}
      <h1 
        className="text-6xl md:text-8xl font-black uppercase leading-[0.7] text-transparent bg-clip-text bg-cover bg-center tracking-tighter whitespace-nowrap select-none relative z-10"
        style={{ 
          backgroundImage: 'url(/bloodywall.avif)', 
          WebkitBackgroundClip: 'text',
          filter: 'drop-shadow(0px 8px 6px rgba(0, 0, 0, 0.9))'
        }}
      >
        We The Peeps
      </h1>

      {/* 2. PHILOSOPHICAL SEAL - Adjusted negative margin to stop the "bleeding" */}
      <div className="w-full flex items-center gap-3 mt-[2px] md:mt-[-2px] relative z-20">
        <div className="flex-1 h-[1px] bg-[#C5B358]/40" /> 
        <span 
          className="text-[9px] md:text-xs font-black uppercase tracking-[0.2em] italic whitespace-nowrap"
          style={{ color: '#C5B358' }}
        >
          Life, Liberty, &amp; The Pursuit of Happiness
        </span>
        <div className="flex-1 h-[1px] bg-[#C5B358]/40" />
      </div>

      {/* 3. LEGAL TAGLINE - Small gap to maintain hierarchy */}
      <span className="mt-1 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.35em] text-white/40">
        These Rights Shall Not Be Infringed
      </span>
    </div>
  );
}
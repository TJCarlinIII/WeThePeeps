// File: src/components/ui/logo-main.tsx
import { cn } from "@/lib/utils";

export default function LogoMain({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center w-full max-w-2xl mx-auto", className)}>
      {/* The Main Flag Logo */}
      <h1 
        className="text-6xl md:text-8xl font-black uppercase leading-none text-transparent bg-clip-text bg-cover bg-center tracking-tighter whitespace-nowrap select-none"
        style={{ 
          backgroundImage: 'url(/american-flag.jpg)',
          WebkitBackgroundClip: 'text',
        }}
      >
        We The Peeps
      </h1>

      {/* The Philosophical Seal */}
      <div className="w-full flex items-center gap-4 mt-6">
        <div className="flex-1 h-[1px] bg-[#C5B358]/30" /> 
        <span 
          className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] italic whitespace-nowrap"
          style={{ color: '#C5B358' }}
        >
          Life, Liberty, & The Pursuit of Happiness
        </span>
        <div className="flex-1 h-[1px] bg-[#C5B358]/30" />
      </div>

      {/* The Legal Tagline */}
      <span className="mt-3 text-[10px] md:text-xs font-bold uppercase tracking-[0.6em] text-white/40">
        Shall Not Be Infringed
      </span>
    </div>
  );
}
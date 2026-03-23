import { cn } from "@/lib/utils"

export default function Logo({ className, size = "text-2xl" }: { className?: string; size?: string }) {
  return (
    <div className={cn("flex flex-col tracking-tighter", className)}>
      <h1 
        className={cn(
          size,
          "font-black uppercase leading-none bg-clip-text text-transparent bg-cover bg-center",
        )}
        style={{ backgroundImage: 'url(/american-flag.jpg)' }}
      >
        We The Peeps
      </h1>
      <div className="flex items-center gap-2 mt-1">
        <span className="h-px w-4 bg-[#C4A77D]/50" />
        <span className="text-[9px] tracking-[0.3em] text-[#C4A77D] italic uppercase font-medium">
          Shall not be infringed
        </span>
      </div>
    </div>
  );
}
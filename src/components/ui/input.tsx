import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full border border-slate-800 bg-black px-3 py-2 text-sm text-white font-mono uppercase tracking-widest file:border-0 file:bg-transparent file:text-sm file:font-bold placeholder:text-slate-700 focus-visible:outline-none focus-visible:border-[#4A90E2] focus-visible:ring-1 focus-visible:ring-[#4A90E2]/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all rounded-none",
        className
      )}
      {...props}
    />
  )
}

export { Input }
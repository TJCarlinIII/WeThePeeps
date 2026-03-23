import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center border border-transparent text-xs font-black uppercase tracking-[0.2em] italic transition-all outline-none select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#4A90E2] text-black hover:bg-[#4A90E2]/90",
        outline: "border-slate-800 bg-transparent text-slate-400 hover:border-[#4A90E2] hover:text-[#4A90E2]",
        secondary: "bg-slate-900 text-white hover:bg-slate-800",
        ghost: "hover:bg-slate-900 hover:text-[#4A90E2]",
        destructive: "border-red-900/50 bg-red-950/20 text-red-500 hover:bg-red-900/40",
        link: "text-[#4A90E2] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6",
        xs: "h-7 px-3 text-[9px]",
        sm: "h-8 px-4 text-[10px]",
        lg: "h-12 px-8 text-sm",
        icon: "size-10",
        // ADD THIS LINE TO FIX THE TS ERROR:
        "icon-sm": "size-8", 
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
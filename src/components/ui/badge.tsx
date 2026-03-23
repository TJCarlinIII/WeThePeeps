import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] transition-colors rounded-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#4A90E2]/10 text-[#4A90E2]",
        secondary: "border-transparent bg-slate-800 text-slate-300",
        destructive: "border-red-900/50 bg-red-950/20 text-red-500",
        outline: "border-slate-800 text-slate-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
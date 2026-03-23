import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse bg-slate-900 rounded-none", className)}
      {...props}
    />
  )
}

export { Skeleton }
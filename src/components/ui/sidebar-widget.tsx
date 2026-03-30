import { cn } from "@/lib/utils";

interface SidebarWidgetProps {
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'alert' | 'action';
  label?: string;
}

// ✅ Added 'default' keyword — this fixes the import error
export default function SidebarWidget({ 
  title, 
  children, 
  variant = 'default', 
  label 
}: SidebarWidgetProps) {
  return (
    <div className={cn(
      "p-6 relative overflow-hidden border",
      variant === 'alert' ? "bg-slate-950 border-red-900/30" : "bg-slate-950 border-slate-900",
      variant === 'action' ? "bg-[#4A90E2]/5 border-[#4A90E2]/20" : ""
    )}>
      {label && (
        <div className={cn(
          "absolute top-0 right-0 p-1.5 text-[7px] font-black uppercase tracking-tighter",
          variant === 'alert' ? "bg-red-900 text-white" : "bg-slate-800 text-slate-400"
        )}>
          {label}
        </div>
      )}
      <h4 className={cn(
        "font-black text-[10px] uppercase tracking-widest mb-4",
        variant === 'action' ? "text-[#4A90E2]" : "text-slate-500"
      )}>
        {title}
      </h4>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
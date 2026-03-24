import Link from "next/link";

interface SidebarItem {
  label: string;
  href: string;
  timestamp?: string;
  category?: string;
}

interface SidebarProps {
  title: string;
  items: SidebarItem[];
  accentColor?: string;
}

export default function SidebarWidget({ title, items, accentColor = "#4A90E2" }: SidebarProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-4 w-[2px]" style={{ backgroundColor: accentColor }}></div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
          {title}
        </h3>
      </div>
      
      <div className="space-y-5">
        {items.map((item, idx) => (
          <Link key={idx} href={item.href} className="group block border-b border-slate-900 pb-4 last:border-0">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">
                {item.timestamp || "LATEST_DATA"}
              </span>
              {item.category && (
                <span 
                  className="text-[8px] px-2 py-0.5 border border-slate-800 rounded-sm text-slate-500 group-hover:text-white transition-colors"
                >
                  {item.category}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 group-hover:text-white transition-colors leading-relaxed uppercase font-bold tracking-tight">
              {item.label}
            </p>
          </Link>
        ))}
        
        {items.length === 0 && (
          <p className="text-[10px] text-slate-700 italic uppercase">Waiting for incoming telemetry...</p>
        )}
      </div>
    </div>
  );
}
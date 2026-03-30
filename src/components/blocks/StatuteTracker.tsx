import Link from "next/link";
import { TopStatute } from "@/lib/database-types";

export default function StatuteTracker({ statutes }: { statutes: TopStatute[] }) {
  if (!statutes.length) return null;

  return (
    <aside className="border border-slate-800 bg-[#0B1021] p-6 h-fit sticky top-24 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <h3 className="text-[#D4AF37] font-mono text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2 border-b border-slate-800 pb-2">
        <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" /> High-Frequency Violations
      </h3>
      
      <div className="space-y-5">
        {statutes.map((statute) => (
          <div key={statute.id} className="group relative">
            <div className="flex justify-between items-start mb-1">
              <Link 
                href={`/statutes/${statute.citation.replace(/\s+/g, '-')}`}
                className="font-mono text-[10px] text-[#4A90E2] font-bold group-hover:underline tracking-widest"
              >
                {statute.citation}
              </Link>
              <span className="font-mono text-[9px] text-red-500 bg-red-950/30 px-1.5 py-0.5 border border-red-900/30 uppercase font-black">
                {statute.violation_count} Incidents
              </span>
            </div>
            <p className="font-serif-formal text-xs text-slate-300 leading-snug line-clamp-2">
              {statute.title}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
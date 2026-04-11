"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { Search, ChevronRight } from 'lucide-react';

const STATUS_STYLES: Record<string, any> = {
  active: { label: "ACTIVE_SUBJECT", textColor: "text-white", ringColor: "border-slate-700", bg: "bg-slate-900" },
  stonewalled: { label: "ACCESS_DENIED", textColor: "text-red-500", ringColor: "border-red-900/80", bg: "bg-red-950/30" },
  under_review: { label: "UNDER_REVIEW", textColor: "text-amber-400", ringColor: "border-amber-900/40", bg: "bg-amber-950/10" },
  former: { label: "FORMER_SUBJECT", textColor: "text-slate-400", ringColor: "border-slate-700/50", bg: "bg-slate-900/30" },
};

export default function ActorSearch({ initialActors, entities }: { initialActors: any[], entities: string[] }) {
  const [query, setQuery] = useState('');
  const [activeSector, setActiveSector] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return initialActors.filter(a => {
      const matchesQuery = a.name.toLowerCase().includes(query.toLowerCase()) || 
                           (a.sector && a.sector.toLowerCase().includes(query.toLowerCase()));
      const matchesSector = activeSector ? a.sector === activeSector : true;
      return matchesQuery && matchesSector;
    });
  }, [query, activeSector, initialActors]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6">
        <div className="relative max-w-2xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-[#4A90E2] transition-colors" />
          <input
            type="text"
            placeholder="FILTER_BY_NAME_OR_SECTOR..."
            className="w-full bg-slate-950/50 border border-slate-900 p-4 pl-12 text-[11px] font-mono outline-none focus:border-[#4A90E2] text-white uppercase tracking-widest transition-all placeholder:text-slate-800"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Sector Filtering Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSector(null)}
            className={cn(
              "px-4 py-2 font-mono text-[9px] uppercase tracking-widest border transition-all",
              activeSector === null ? "bg-[#4A90E2] text-black border-[#4A90E2]" : "bg-black text-slate-500 border-slate-900 hover:border-slate-700"
            )}
          >
            ALL_RECORDS
          </button>
          {entities.map(ent => (
            <button
              key={ent}
              onClick={() => setActiveSector(ent)}
              className={cn(
                "px-4 py-2 font-mono text-[9px] uppercase tracking-widest border transition-all",
                activeSector === ent ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "bg-black text-slate-500 border-slate-900 hover:border-slate-700"
              )}
            >
              {ent.replace(/\s+/g, '_')}
            </button>
          ))}
        </div>
      </div>

      {/* Laser-Cut Grid System */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-900 border border-slate-900">
        {filtered.map((actor) => {
          const style = STATUS_STYLES[actor.status] || { label: "UNKNOWN", textColor: "text-slate-500", ringColor: "border-slate-800", bg: "bg-slate-950" };
          
          return (
            <Link
              key={actor.id}
              href={`/actors/${actor.slug}`}
              className="group relative bg-[#050a18] p-6 hover:bg-[#4A90E2]/5 transition-all flex flex-col h-full overflow-hidden"
            >
              {actor.history_of_falsification === 1 && (
                <div className="absolute top-0 right-0 bg-red-600 text-black text-[7px] font-black px-2 py-0.5 uppercase tracking-tighter">
                  Falsification_History
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 border border-slate-800 flex flex-col items-center justify-center bg-black relative">
                   <span className="text-[6px] text-slate-700 font-mono uppercase">UID</span>
                   <span className="text-[10px] text-slate-400 font-mono font-bold">{actor.id.toString().padStart(3, '0')}</span>
                </div>
                <div className={cn("px-2 py-1 border font-mono text-[8px] font-black uppercase tracking-widest", style.textColor, style.ringColor, style.bg)}>
                  {style.label}
                </div>
              </div>

              <div className="flex-grow mb-6">
                <span className="text-[#D4AF37] font-mono text-[9px] font-bold uppercase tracking-widest block mb-1">
                  {actor.job_title || "Public_Official"}
                </span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic group-hover:text-[#4A90E2] transition-colors leading-none">
                  {actor.name}
                </h3>
                <span className="text-slate-600 font-mono text-[8px] uppercase mt-2 block">
                  ↳ {actor.sector || "Unclassified_Agency"}
                </span>
              </div>

              <div className="grid grid-cols-2 border-t border-slate-900/50 pt-4">
                <div className="border-r border-slate-900/50 text-center">
                  <div className="text-lg font-mono font-bold text-white leading-none">{actor.incident_count || 0}</div>
                  <div className="text-[7px] text-slate-600 uppercase font-black tracking-widest">Incidents</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-mono font-bold text-white leading-none">{actor.statute_count || 0}</div>
                  <div className="text-[7px] text-slate-600 uppercase font-black tracking-widest">Statutes</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-900/50 flex justify-between items-center group-hover:bg-[#4A90E2]/5">
                <span className="text-[8px] font-mono font-black text-[#4A90E2] uppercase">Access_Dossier</span>
                <ChevronRight className="w-3 h-3 text-[#4A90E2]" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
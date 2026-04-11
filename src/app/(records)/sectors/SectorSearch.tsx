"use client";
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Activity } from 'lucide-react';

export default function SectorSearch({ initialSectors }: { initialSectors: any[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return initialSectors.filter(s => 
      s.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, initialSectors]);

  return (
    <div className="space-y-10">
      <div className="relative max-w-2xl group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-[#4A90E2] transition-colors" />
        <input
          type="text"
          placeholder="SEARCH_SECTOR_DATABASE..."
          className="w-full bg-slate-950/50 border border-slate-900 p-4 pl-12 text-[11px] font-mono outline-none focus:border-[#4A90E2] text-white uppercase tracking-widest transition-all placeholder:text-slate-800"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-900 border border-slate-900">
        {filtered.map((sector) => (
          <Link
            key={sector.id}
            href={`/sectors/${sector.slug}`}
            className="group relative bg-[#050a18] p-8 hover:bg-[#4A90E2]/5 transition-all flex flex-col h-full overflow-hidden"
          >
            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(74,144,226,0.03),rgba(0,0,0,0),rgba(74,144,226,0.03))] z-0 bg-[length:100%_4px,100%_100%] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <Activity className="w-5 h-5 text-[#4A90E2] opacity-50" />
                <span className="text-[10px] font-mono text-slate-600">SID_{sector.id.toString().padStart(3, '0')}</span>
              </div>

              <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic group-hover:text-[#4A90E2] transition-colors mb-4">
                {sector.name}
              </h3>

              <div className="grid grid-cols-2 border-t border-slate-900 pt-4 mt-auto">
                <div>
                  <div className="text-lg font-mono font-bold text-white leading-none">{sector.entity_count || 0}</div>
                  <div className="text-[7px] text-slate-600 uppercase font-black tracking-widest">Entities</div>
                </div>
                <div>
                  <div className="text-lg font-mono font-bold text-white leading-none">{sector.incident_count || 0}</div>
                  <div className="text-[7px] text-slate-600 uppercase font-black tracking-widest">Reports</div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center text-[#4A90E2]">
                <span className="text-[8px] font-mono font-black uppercase">Initialize_Deep_Scan</span>
                <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
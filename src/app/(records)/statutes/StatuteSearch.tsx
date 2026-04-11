"use client";

export const dynamic = "force-dynamic";

import { useState } from 'react';
import Link from 'next/link';

// ✅ UPDATED: Statute interface with citation + slug + violation_count
interface Statute {
  id: number;
  citation: string;        // Legal code like "750.81"
  slug: string;            // URL-friendly slug for clean routing
  title: string;           // Full statute title/description
  violation_count?: number; // Optional: count of linked incidents
  description?: string;
}

export default function StatuteSearch({ initialStatutes }: { initialStatutes: Statute[] }) {  const [query, setQuery] = useState('');

  // ✅ Filter by citation (the legal code like "750.81")
  const filtered = initialStatutes.filter(s => 
    s.citation.toLowerCase().includes(query.toLowerCase()) ||
    s.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="mb-12 relative group">
        <div className="absolute -inset-0.5 bg-[#4A90E2]/10 rounded blur opacity-75 group-focus-within:opacity-100 transition duration-500"></div>
        <input 
          type="text"
          placeholder="Filter_By_Statute_Citation... (e.g. 750.81)"
          className="relative w-full bg-black border border-slate-800 p-4 text-sm outline-none focus:border-[#4A90E2] text-white font-mono uppercase tracking-widest transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute right-4 top-4 text-[#4A90E2] text-[10px] font-bold">
          {filtered.length}_CITATIONS_FOUND
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map((statute) => (
          <Link 
            key={statute.id} 
            href={`/statutes/${statute.slug}`} // Use the URL-friendly slug
            className="group border border-slate-900 bg-slate-900/5 p-6 hover:border-[#4A90E2] transition-all hover:bg-[#4A90E2]/10 flex flex-col justify-between min-h-[120px] relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="text-[10px] font-black text-[#4A90E2] mb-2 tracking-tighter">
                CODE_{statute.citation}
              </div>
              <div className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors uppercase leading-tight italic">
                {statute.title}
              </div>
            </div>
            
            <div className="relative z-10 mt-4 flex justify-between items-end">
              <div className="text-[10px] text-slate-600 font-mono">
                RECORDS: {statute.violation_count || 0}
              </div>
              <span className="text-[10px] text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity">
                VIEW_DATA →
              </span>
            </div>

            {/* Subtle geometric accent */}
            <div className="absolute -bottom-2 -right-2 w-12 h-12 border border-white/5 rotate-45 group-hover:border-[#4A90E2]/20 transition-colors"></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
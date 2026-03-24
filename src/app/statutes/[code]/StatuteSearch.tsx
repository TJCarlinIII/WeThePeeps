"use client";

export const dynamic = "force-dynamic";

import { useState } from 'react';
import Link from 'next/link';

interface Statute {
  id: number;
  code: string;
  description?: string;
}

export default function StatuteSearch({ initialStatutes }: { initialStatutes: Statute[] }) {
  const [query, setQuery] = useState('');

  const filtered = initialStatutes.filter(s => 
    s.code.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="mb-12 relative group">
        <div className="absolute -inset-0.5 bg-[#4A90E2]/10 rounded blur opacity-75 group-focus-within:opacity-100 transition duration-500"></div>
        <input 
          type="text"
          placeholder="Filter_By_Statute_Code... (e.g. 750.81)"
          className="relative w-full bg-black border border-slate-800 p-4 text-sm outline-none focus:border-[#4A90E2] text-white font-mono uppercase tracking-widest transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute right-4 top-4 text-[#4A90E2] text-[10px] font-bold">
          {filtered.length}_CODES_FOUND
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map((statute) => (
          <Link 
            key={statute.id} 
            href={`/statutes/${encodeURIComponent(statute.code)}`}
            className="group border border-slate-900 bg-slate-900/5 p-4 hover:border-[#4A90E2] transition-all hover:bg-[#4A90E2]/10 text-center"
          >
            <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-tighter">
              {statute.code}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
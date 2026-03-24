"use client";

export const dynamic = "force-dynamic";

import { useState } from 'react';
import Link from 'next/link';

interface Sector {
  id: number;
  name: string;
}

export default function SectorSearch({ initialSectors }: { initialSectors: Sector[] }) {
  const [query, setQuery] = useState('');

  const filteredSectors = initialSectors.filter(s => 
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="mb-12 relative group">
        <div className="absolute -inset-0.5 bg-[#4A90E2]/20 rounded blur opacity-75 group-focus-within:opacity-100 transition duration-500"></div>
        <input 
          type="text"
          placeholder="Search_Sectors..."
          className="relative w-full bg-black border border-slate-800 p-4 text-sm outline-none focus:border-[#4A90E2] text-white font-mono uppercase tracking-widest"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute right-4 top-4 text-slate-700 text-[10px] font-bold">
          {filteredSectors.length}_MATCHES
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSectors.map((sector) => (
          <Link 
            key={sector.id} 
            href={`/sectors/${encodeURIComponent(sector.name)}`}
            className="group border border-slate-900 bg-slate-900/10 p-6 hover:border-[#4A90E2] transition-all hover:bg-[#4A90E2]/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 bg-[#4A90E2] rounded-full animate-pulse" />
            </div>
            <h3 className="text-lg font-bold uppercase group-hover:text-[#4A90E2]">{sector.name}</h3>
            <p className="text-[10px] text-slate-500 mt-4 font-black uppercase tracking-widest">
              View_Reports &gt;&gt;
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
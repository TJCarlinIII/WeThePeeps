"use client";

export const dynamic = "force-dynamic";

import { useState } from 'react';
import Link from 'next/link';

interface Entity {
  id: number;
  name: string;
  sector: string;
}

export default function EntitySearch({ initialEntities }: { initialEntities: Entity[] }) {
  const [query, setQuery] = useState('');

  const filtered = initialEntities.filter(e => 
    e.name.toLowerCase().includes(query.toLowerCase()) ||
    e.sector.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="mb-12 relative group">
        <div className="absolute -inset-0.5 bg-[#4A90E2]/10 rounded blur opacity-75 group-focus-within:opacity-100 transition duration-500"></div>
        <input 
          type="text"
          placeholder="Filter_By_Entity_Or_Sector..."
          className="relative w-full bg-black border border-slate-800 p-4 text-sm outline-none focus:border-[#4A90E2] text-white font-mono uppercase tracking-widest"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute right-4 top-4 text-[#4A90E2] text-[10px] font-bold">
          {filtered.length}_IDENTIFIED_ENTITIES
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((entity) => (
          <Link 
            key={entity.id} 
            href={`/entities/${encodeURIComponent(entity.name)}`}
            className="group border border-slate-900 bg-slate-900/5 p-6 hover:border-[#4A90E2] transition-all hover:bg-[#4A90E2]/10"
          >
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">
              Sector: <span className="text-[#4A90E2]">{entity.sector}</span>
            </div>
            <h3 className="text-lg font-bold uppercase text-white group-hover:text-[#4A90E2] transition-colors leading-tight">
              {entity.name}
            </h3>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase text-slate-600 italic">
              View_Entity_File
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

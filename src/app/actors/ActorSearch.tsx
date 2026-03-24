"use client";

import { useState } from 'react';
import Link from 'next/link';

interface Actor {
  id: number;
  name: string;
  sector: string;
  slug: string;
}

export default function ActorSearch({ initialActors }: { initialActors: Actor[] }) {
  const [query, setQuery] = useState('');

  const filtered = initialActors.filter(a => 
    a.name.toLowerCase().includes(query.toLowerCase()) ||
    (a.sector && a.sector.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div>
      <div className="mb-12 relative group">
        <div className="absolute -inset-0.5 bg-[#4A90E2]/10 rounded blur opacity-75 group-focus-within:opacity-100 transition duration-500"></div>
        <input 
          type="text"
          placeholder="Filter_By_Name_Or_Department..."
          className="relative w-full bg-black border border-slate-800 p-4 text-sm outline-none focus:border-[#4A90E2] text-white font-mono uppercase tracking-widest"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute right-4 top-4 text-[#4A90E2] text-[10px] font-bold tracking-tighter">
          {filtered.length}_IDENTIFIED_SUBJECTS
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((actor) => (
          <Link 
            key={actor.id} 
            href={`/actors/${actor.slug}`}
            className="group border border-slate-900 bg-slate-900/5 p-6 hover:border-[#4A90E2] transition-all relative overflow-hidden"
          >
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">
              Primary_Sector
            </div>
            <div className="text-[#4A90E2] text-[10px] font-black uppercase mb-4 tracking-tighter">
              {actor.sector || "Unclassified"}
            </div>
            <h3 className="text-xl font-bold uppercase text-white group-hover:text-[#4A90E2] transition-colors leading-none italic">
              {actor.name}
            </h3>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest group-hover:text-white transition-colors">
                View_Subject_History
              </span>
              <span className="text-[#4A90E2] group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
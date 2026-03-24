"use client";

export const dynamic = "force-dynamic";

import { useState } from 'react';
import Link from 'next/link';

interface Evidence {
  id: number;
  title: string;
  official: string;
  sector: string;
  isCritical: number;
  created_at: string;
}

export default function EvidenceSearch({ initialEvidence }: { initialEvidence: Evidence[] }) {
  const [query, setQuery] = useState('');

  const filtered = initialEvidence.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.official.toLowerCase().includes(query.toLowerCase()) ||
    item.sector.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="mb-12 relative group">
        <div className="absolute -inset-0.5 bg-red-600/10 rounded blur opacity-75 group-focus-within:opacity-100 transition duration-500"></div>
        <input 
          type="text"
          placeholder="Search_Manifest... (Title, Actor, or Sector)"
          className="relative w-full bg-black border border-slate-800 p-4 text-sm outline-none focus:border-[#4A90E2] text-white font-mono uppercase tracking-widest"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute right-4 top-4 text-slate-500 text-[10px] font-bold">
          {filtered.length}_RECORDS_MATCHED
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((item) => (
          <Link 
            key={item.id} 
            href={`/evidence/${item.id}`}
            className="group flex flex-col md:flex-row md:items-center justify-between p-6 border border-slate-900 bg-slate-900/5 hover:border-[#4A90E2]/40 transition-all hover:bg-[#4A90E2]/5"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[#4A90E2] text-[9px] font-bold uppercase tracking-widest">
                  ID_{item.id.toString().padStart(4, '0')}
                </span>
                {item.isCritical === 1 && (
                  <span className="text-red-500 text-[8px] font-black border border-red-900/50 px-2 py-0.5 bg-red-900/10 animate-pulse">
                    CRITICAL_DATA
                  </span>
                )}
              </div>
              <h4 className="text-white text-lg font-bold group-hover:text-[#4A90E2] transition-colors uppercase tracking-tight">
                {item.title}
              </h4>
              <div className="mt-2 flex gap-4 text-[9px] text-slate-500 font-bold uppercase italic">
                <span>Actor: {item.official}</span>
                <span>Sector: {item.sector}</span>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 text-left md:text-right border-t md:border-t-0 border-slate-900 pt-4 md:pt-0">
              <div className="text-[10px] text-slate-600 font-mono mb-1">
                {new Date(item.created_at).toLocaleDateString()}
              </div>
              <span className="text-[#4A90E2] text-[10px] font-black uppercase italic group-hover:translate-x-1 transition-transform inline-block">
                Access_Record →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

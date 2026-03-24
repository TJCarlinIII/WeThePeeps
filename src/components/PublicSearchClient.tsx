"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface EvidenceRecord {
  id: number;
  title: string;
  official: string;
  statute: string;
  sector: string;
  entity?: string;
  content: string;
  isCritical: number;
}

export default function PublicSearchClient({ initialRecords }: { initialRecords: EvidenceRecord[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return initialRecords.filter(r => 
      (r.official?.toLowerCase().includes(query.toLowerCase())) ||
      (r.statute?.toLowerCase().includes(query.toLowerCase())) ||
      (r.title?.toLowerCase().includes(query.toLowerCase())) ||
      (r.sector?.toLowerCase().includes(query.toLowerCase())) || 
      (r.entity?.toLowerCase().includes(query.toLowerCase()))    
    );
  }, [query, initialRecords]);

  const handleCardClick = (id: number) => {
    router.push(`/evidence/${id}`);
  };

  const handleActorClick = (e: React.MouseEvent, official: string) => {
    e.stopPropagation();
    router.push(`/actors/${encodeURIComponent(official)}`);
  };

  const handleSectorClick = (e: React.MouseEvent, sector: string) => {
    e.stopPropagation();
    router.push(`/sectors/${encodeURIComponent(sector)}`);
  };

  return (
    <>
      <div className="mb-12 relative group">
        <div className="absolute -inset-0.5 bg-[#4A90E2]/20 rounded blur opacity-50 group-focus-within:opacity-100 transition duration-500"></div>
        <input 
          type="text"
          placeholder="GLOBAL_MANIFEST_SEARCH (NAME, SECTOR, STATUTE, OR TITLE)..."
          className="relative w-full bg-black border border-slate-800 p-6 text-sm tracking-[0.3em] outline-none focus:border-[#4A90E2] transition-all text-white uppercase font-black placeholder:text-slate-700"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute right-6 top-6 text-[#4A90E2] text-[10px] font-mono font-bold animate-pulse">
          {filtered.length}_RESULTS
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtered.map((record) => (
          <div
            key={record.id}
            onClick={() => handleCardClick(record.id)}
            className="group relative border border-slate-900 bg-slate-900/10 p-8 hover:border-[#4A90E2]/40 transition-all overflow-hidden cursor-pointer"
          >
            <div className={`absolute top-0 right-0 w-8 h-8 border-t border-r transition-colors ${record.isCritical ? 'border-red-600' : 'border-slate-800 group-hover:border-[#4A90E2]'}`} />

            <div className="relative z-10">
              <div className="flex gap-3 mb-4">
                <span 
                  onClick={(e) => handleSectorClick(e, record.sector)}
                  className="text-[#4A90E2] text-[9px] font-bold tracking-[0.2em] uppercase border border-[#4A90E2]/30 px-2 py-1 hover:bg-[#4A90E2]/10 transition-colors"
                >
                  {record.sector}
                </span>
                <span className="text-slate-600 text-[9px] font-bold tracking-[0.2em] uppercase py-1">
                  {record.statute}
                </span>
              </div>
              
              <h2 
                onClick={(e) => handleActorClick(e, record.official)}
                className="text-2xl font-black text-white group-hover:text-[#4A90E2] hover:underline cursor-pointer transition-colors uppercase italic tracking-tighter"
              >
                {record.official}
              </h2>
              
              <p className="text-slate-400 text-sm mt-3 font-sans leading-relaxed line-clamp-2 uppercase tracking-tight">
                {record.title}
              </p>
              
              <div className="mt-8 pt-6 border-t border-slate-900/50 flex justify-between items-center">
                <span className="text-[9px] text-slate-700 uppercase font-bold tracking-widest font-mono">
                  REF_ID: {record.id.toString().padStart(4, '0')}
                </span>
                <span className="text-[10px] text-[#4A90E2] font-black group-hover:translate-x-2 transition-transform uppercase italic">
                  VIEW_DETAILS →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
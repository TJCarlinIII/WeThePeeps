"use client";

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
    item.title?.toLowerCase().includes(query.toLowerCase()) ||
    item.official?.toLowerCase().includes(query.toLowerCase()) ||
    item.sector?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* --- ENHANCED SEARCH BAR --- */}
      <div className="mb-16 relative group">
        {/* Glow effect that matches your MouseGlow theme */}
        <div className="absolute -inset-1 bg-[#4A90E2]/20 rounded blur-xl opacity-0 group-focus-within:opacity-100 transition duration-700"></div>
        
        <div className="relative flex flex-col">
          <label className="text-[9px] font-black text-[#4A90E2] uppercase tracking-[0.5em] mb-3 ml-1">
            Search_Database_Index
          </label>
          <div className="relative">
            <input 
              type="text"
              placeholder="ENTER_CRITERIA (TITLE, ACTOR, SECTOR)..."
              className="w-full bg-black/40 backdrop-blur-md border border-slate-800 p-5 text-sm outline-none focus:border-[#4A90E2] text-white font-mono uppercase tracking-[0.2em] transition-all placeholder:text-slate-700 italic"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
              <span className="text-slate-500 text-[9px] font-bold border-r border-slate-800 pr-4 italic">
                {filtered.length}_MATCHES_FOUND
              </span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SEARCH RESULTS --- */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <Link 
            key={item.id} 
            href={`/evidence/${item.id}`}
            className="group block relative overflow-hidden transition-all"
          >
            <div className="relative flex flex-col md:flex-row md:items-center justify-between p-8 border border-slate-900 bg-slate-950/40 hover:border-[#4A90E2]/60 hover:bg-[#4A90E2]/5 transition-all z-10 backdrop-blur-sm">
              
              {/* Critical Record "Scanner" Overlay */}
              {item.isCritical === 1 && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500 to-transparent h-20 w-full -translate-y-full animate-scan"></div>
                </div>
              )}

              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-[#4A90E2] text-[10px] font-black font-mono tracking-tighter">
                    REF://{item.id.toString().padStart(6, '0')}
                  </span>
                  {item.isCritical === 1 && (
                    <span className="text-red-500 text-[8px] font-black border border-red-900 px-2 py-0.5 bg-red-950 uppercase tracking-widest">
                      [ PRIORITY_RECORD ]
                    </span>
                  )}
                </div>
                
                <h4 className="text-white text-xl md:text-2xl font-serif font-bold italic tracking-tight group-hover:text-[#4A90E2] transition-colors decoration-[#4A90E2]/30 underline-offset-8 group-hover:underline">
                  {item.title}
                </h4>
                
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  <div className="flex flex-col">
                    <span className="text-slate-600 text-[8px] uppercase tracking-widest">Involved_Party</span>
                    <span className="text-slate-300 text-[10px] font-bold uppercase">{item.official || "PENDING_IDENTIFICATION"}</span>
                  </div>
                  <div className="flex flex-col border-l border-slate-800 pl-8">
                    <span className="text-slate-600 text-[8px] uppercase tracking-widest">Department_Sector</span>
                    <span className="text-slate-300 text-[10px] font-bold uppercase">{item.sector}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 md:mt-0 flex flex-col items-end gap-2 shrink-0">
                <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                   TIMESTAMP: {new Date(item.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#4A90E2] text-[10px] font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    OPEN_FILE
                  </span>
                  <div className="w-8 h-8 border border-slate-800 flex items-center justify-center group-hover:border-[#4A90E2] transition-all">
                    <span className="text-[#4A90E2] font-black">→</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="p-20 text-center border border-dashed border-slate-900 bg-slate-900/5">
             <p className="text-slate-600 font-mono text-[10px] uppercase tracking-[0.4em]">
               No_Matching_Entries_Found_In_Manifest
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
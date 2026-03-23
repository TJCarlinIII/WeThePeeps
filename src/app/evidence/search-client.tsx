"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { EvidenceRecord } from '@/types';

export default function PublicSearchClient({ initialRecords }: { initialRecords: EvidenceRecord[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return initialRecords.filter(r => 
      r.official.toLowerCase().includes(query.toLowerCase()) ||
      r.statute.toLowerCase().includes(query.toLowerCase()) ||
      r.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, initialRecords]);

  return (
    <>
      <div className="mb-12">
        <input 
          type="text"
          placeholder="FILTER_BY_KEYWORDS..."
          className="w-full bg-black border border-slate-800 p-6 text-sm tracking-[0.3em] outline-none focus:border-[#4A90E2] transition-all text-white uppercase font-black"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtered.map((record) => (
          <Link 
            key={record.id} 
            href={`/evidence/${record.id}`}
            className="group relative border border-slate-900 bg-slate-900/10 p-8 hover:border-[#4A90E2]/40 transition-all overflow-hidden"
          >
            {/* Corner Accent Style from Accountability Page */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-slate-800 group-hover:border-[#4A90E2] transition-colors" />

            <div className="relative z-10">
              <span className="text-[#4A90E2] text-[10px] font-bold tracking-[0.4em] uppercase block mb-2">
                {record.statute}
              </span>
              <h2 className="text-2xl font-black text-white group-hover:text-[#4A90E2] transition-colors uppercase italic tracking-tighter">
                {record.official}
              </h2>
              <p className="text-slate-500 text-sm mt-3 font-sans leading-relaxed">
                {record.title}
              </p>
              
              <div className="mt-8 pt-6 border-t border-slate-900 flex justify-between items-center">
                <span className="text-[9px] text-slate-700 uppercase font-bold tracking-widest font-mono">
                  REF_ID: {record.id.toString().padStart(4, '0')}
                </span>
                <span className="text-[10px] text-[#4A90E2] font-black group-hover:translate-x-2 transition-transform uppercase italic">
                  ACCESS_FILE →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
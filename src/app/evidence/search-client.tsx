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
          placeholder="SEARCH_BY_OFFICIAL_OR_STATUTE..."
          className="w-full bg-slate-900/50 border border-slate-800 p-5 text-sm tracking-widest outline-none focus:border-[#4A90E2] transition-colors text-white uppercase"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="mt-2 text-[10px] text-slate-600 uppercase tracking-widest">
          Filtering {filtered.length} of {initialRecords.length} entries
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((record) => (
          <Link 
            key={record.id} 
            href={`/evidence/${record.id}`}
            className="group border border-slate-800 p-6 hover:border-[#4A90E2]/50 hover:bg-[#4A90E2]/5 transition-all relative overflow-hidden"
          >
            {/* Critical Indicator Accent */}
            {record.isCritical === 1 && (
              <div className="absolute top-0 right-0 w-16 h-16">
                <div className="absolute transform rotate-45 bg-red-600 text-[8px] font-bold text-white py-1 px-10 right-[-35px] top-[10px] uppercase shadow-lg">
                  Critical
                </div>
              </div>
            )}

            <div className="relative z-10">
              <span className="text-[#4A90E2] text-[10px] font-bold tracking-widest uppercase">
                {record.statute}
              </span>
              <h2 className="text-xl font-black text-white mt-1 group-hover:text-[#4A90E2] transition-colors uppercase">
                {record.official}
              </h2>
              <p className="text-slate-400 text-xs mt-2 italic">
                {record.title}
              </p>
              
              <div className="mt-6 flex justify-between items-center">
                <span className="text-[9px] text-slate-600 uppercase font-bold tracking-tighter">
                  Record_ID: {record.id.toString().padStart(4, '0')}
                </span>
                <span className="text-[9px] text-[#4A90E2] group-hover:translate-x-1 transition-transform">
                  VIEW_DETAILS →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 border border-dashed border-slate-800">
          <p className="text-slate-500 text-xs uppercase tracking-[0.3em]">No records matching current parameters.</p>
        </div>
      )}
    </>
  );
}
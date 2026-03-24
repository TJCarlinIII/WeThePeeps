"use client";

import React from 'react';
import { Calendar, ChevronRight, Lock, Unlock } from "lucide-react";

export interface EvidenceRecord {
  id: number | string;
  title: string;
  category: string;
  description: string;
  r2_key: string;
  is_public: number;
  created_at: string;
}

export function EvidenceCard({ record }: { record: EvidenceRecord }) {
  const date = new Date(record.created_at).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-black border border-slate-900 hover:border-[#4A90E2]/40 transition-all group overflow-hidden p-8 rounded-sm relative">
      <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-slate-900 group-hover:border-[#4A90E2] transition-colors" />

      <div className="flex justify-between items-start mb-6">
        <span className="px-2 py-1 bg-[#4A90E2]/5 border border-[#4A90E2]/20 text-[#4A90E2] text-[8px] font-mono font-black uppercase tracking-[0.2em]">
          {record.category}
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {record.is_public ? (
              <Unlock className="w-2.5 h-2.5 text-green-500" />
            ) : (
              <Lock className="w-2.5 h-2.5 text-red-500" />
            )}
            <span className="font-mono text-[8px] uppercase tracking-widest text-slate-600">
              {record.is_public ? "Public" : "Restricted"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[9px] uppercase font-bold">
            <Calendar className="w-3 h-3" />
            {date}
          </div>
        </div>
      </div>

      <h3 className="text-xl font-black text-white group-hover:text-[#4A90E2] transition-colors mb-3 uppercase italic tracking-tighter">
        {record.title}
      </h3>

      <p className="font-sans text-sm text-slate-500 leading-relaxed italic mb-8">
        &ldquo;{record.description}&rdquo;
      </p>

      <div className="flex items-center justify-between border-t border-slate-900 pt-6">
        <button className="flex items-center gap-2 text-[#4A90E2] font-mono text-[10px] uppercase font-black cursor-pointer group/link italic">
          Access_Full_Record
          <ChevronRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
        </button>
        <span className="font-mono text-[8px] text-slate-800 uppercase tracking-widest font-black">
          REF_KEY: {record.r2_key}
        </span>
      </div>
    </div>
  );
}

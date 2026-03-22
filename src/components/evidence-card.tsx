"use client";

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
    <div className="bg-[#0D1117] border border-white/5 hover:border-[#4A90E2]/30 transition-all group overflow-hidden p-6 rounded-sm">
      {/* Top row: category badge + date */}
      <div className="flex justify-between items-start mb-4">
        <span className="px-2 py-1 bg-[#4A90E2]/10 border border-[#4A90E2]/20 text-[#4A90E2] text-[9px] font-mono font-bold uppercase tracking-wider">
          {record.category}
        </span>
        <div className="flex items-center gap-4">
          {/* Public/Private indicator */}
          <div className="flex items-center gap-1.5 text-slate-600">
            {record.is_public ? (
              <Unlock className="w-2.5 h-2.5 text-green-500/70" />
            ) : (
              <Lock className="w-2.5 h-2.5 text-red-500/70" />
            )}
            <span className="font-mono text-[8px] uppercase tracking-widest">
              {record.is_public ? "Public" : "Restricted"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
            <Calendar className="w-3 h-3" />
            {date}
          </div>
        </div>
      </div>

      {/* Title: Libre Baskerville */}
      <h3 className="font-heading text-lg font-bold text-white group-hover:text-[#4A90E2] transition-colors mb-3 leading-snug">
        {record.title}
      </h3>

      {/* Description: Lora serif body text */}
      <p className="font-sans text-sm text-slate-400 leading-relaxed italic mb-5">
        &ldquo;{record.description}&rdquo;
      </p>

      {/* Bottom: Access Record link */}
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-2 text-[#4A90E2] font-mono text-[10px] uppercase font-bold cursor-pointer hover:underline underline-offset-4 transition-all group/link">
          Access Full Record{" "}
          <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
        </button>
        <span className="font-mono text-[8px] text-slate-700 uppercase tracking-widest">
          REF: {record.r2_key}
        </span>
      </div>
    </div>
  );
}

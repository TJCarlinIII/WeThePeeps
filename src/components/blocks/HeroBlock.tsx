"use client";

import { Search, Shield } from "lucide-react";
import React, { useState } from "react";

interface HeroStats {
  subjects: number;
  open_inv: number;
  stonewalled: number;
  incidents: number;
}

export default function HeroBlock({ stats }: { stats: HeroStats }) {
  const [query, setQuery] = useState("");

  return (
    <section className="flex flex-col items-center justify-center py-20 px-4 relative z-10 w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-[1px] w-12 bg-[#D4AF37]/50" />
        <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-[0.3em]">
          Investigative Database of Record
        </span>
        <div className="h-[1px] w-12 bg-[#D4AF37]/50" />
      </div>

      <Shield className="w-12 h-12 text-[#4A90E2] mb-6" strokeWidth={1} />

      <h1 className="text-5xl md:text-7xl font-serif-formal text-white mb-6 tracking-tight text-center">
        WE THE <span className="text-[#D4AF37]">PEEPS</span>
      </h1>

      <p className="text-slate-400 font-serif-formal italic text-lg md:text-xl text-center max-w-2xl mb-12">
        "A public ledger of institutional accountability — documenting misconduct, obstruction, and the officials who enable it."
      </p>

      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-8 space-x-4">
        <span>Sourced from Public Records</span>
        <span>•</span>
        <span>FOIA Requests</span>
        <span>•</span>
        <span>Sworn Testimony</span>
      </div>

      {/* Global Search Bar */}
      <div className="w-full relative group mb-12">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-slate-500 group-focus-within:text-[#4A90E2] transition-colors" />
        </div>
        <input 
          type="text"
          placeholder="Search subjects, incidents, statutes..."
          className="w-full bg-[#0B1021] border border-slate-800 py-4 pl-12 pr-12 text-sm text-white font-mono outline-none focus:border-[#4A90E2] transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
          <span className="border border-slate-700 px-1.5 py-0.5 text-[10px] text-slate-500 rounded-sm">⌘K</span>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-4 w-full border border-slate-800 bg-[#0B1021]">
        {[
          { label: "Subjects", value: stats.subjects, color: "text-white" },
          { label: "Open Inv.", value: stats.open_inv, color: "text-[#F59E0B]" },
          { label: "Stonewalled", value: stats.stonewalled, color: "text-red-500" },
          { label: "Incidents", value: stats.incidents, color: "text-[#4A90E2]" },
        ].map((stat, i) => (
          <div key={i} className={`flex flex-col items-center justify-center p-6 border-r border-slate-800 last:border-0`}>
            <span className={`text-3xl font-black font-sans mb-1 ${stat.color}`}>{stat.value}</span>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
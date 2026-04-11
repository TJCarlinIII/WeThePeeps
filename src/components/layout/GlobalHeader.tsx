"use client";

import Link from "next/link";
import { Fingerprint, Search } from "lucide-react";

export default function GlobalHeader() {
  return (
    <nav className="sticky top-0 z-50 bg-[#050A18]/90 backdrop-blur-md border-b border-slate-800 px-6 py-4">
      {/* Width set to max-w-7xl to match the body and footer alignment */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        
        {/* Brand Logo with Gold PEEPS — Symmetrical with Footer Style */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-8 h-8 border border-[#4A90E2]/50 bg-[#4A90E2]/10 flex items-center justify-center rounded-sm transition-all group-hover:border-[#4A90E2] group-hover:shadow-[0_0_12px_rgba(74,144,226,0.2)]">
            <Fingerprint className="text-[#4A90E2] w-5 h-5" />
          </div>
          <span className="font-libre text-xl font-bold tracking-tighter text-white uppercase italic">
            WE THE <span className="text-[#D4AF37]">PEEPS</span>
          </span>
        </Link>

        {/* Search Bar — Centered & Refined */}
        <div className="flex-grow max-w-md relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
          <input 
            type="text" 
            placeholder="SEARCH_DOSSIER_OR_OFFICER_ID..."
            className="w-full bg-slate-950/50 border border-slate-800/80 rounded-sm py-2 pl-10 pr-4 text-[10px] font-mono text-slate-400 focus:outline-none focus:border-[#4A90E2]/50 focus:text-slate-200 transition-all placeholder:text-slate-700 uppercase tracking-widest"
          />
        </div>

        {/* Mini Actions — Right Aligned */}
        <div className="flex items-center gap-6">
          <Link 
            href="/accountability" 
            className="font-mono text-[10px] text-slate-500 hover:text-[#4A90E2] uppercase tracking-widest transition-colors"
          >
            Registry
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-3 bg-red-950/10 border border-red-900/20 px-3 py-1 rounded-sm">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]" aria-hidden="true" />
            <span className="font-mono text-[9px] text-red-500 uppercase tracking-[0.2em] font-bold">Live Monitoring</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
"use client";
import React from 'react';

interface DashboardStats {
  critical: number;
  pending: number;
  total: number;
}

export default function AdminDashboardHeader({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 font-mono">
      {/* Critical Incidents Card - THE SIREN */}
      <div className="bg-slate-950 border border-red-900/50 p-6 shadow-[0_0_15px_rgba(153,27,27,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 text-[8px] text-red-500 font-black animate-pulse uppercase tracking-widest">
          LIVE_THREAT_LEVEL: HIGH
        </div>
        <h3 className="text-red-600 text-[10px] uppercase tracking-[0.3em] mb-2 font-bold">Critical_Incidents</h3>
        <p className="text-4xl font-black text-white leading-none">{stats.critical}</p>
        <p className="text-[9px] text-slate-500 mt-2 uppercase italic">Requires Immediate Manifestation</p>
      </div>

      {/* Dossier Queue Card - PENDING VERIFICATION */}
      <div className="bg-slate-950 border border-slate-800 p-6">
        <h3 className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mb-2 font-bold">Dossier_Queue</h3>
        <p className="text-4xl font-black text-white leading-none">{stats.pending}</p>
        <p className="text-[9px] text-slate-500 mt-2 uppercase italic">Awaiting Fact_Verification</p>
      </div>

      {/* Evidence Manifest Total - THE AGGREGATE */}
      <div className="bg-black border border-slate-900 p-6 shadow-inner">
        <h3 className="text-slate-600 text-[10px] uppercase tracking-[0.3em] mb-2 font-bold">Evidence_Manifest_Total</h3>
        <p className="text-4xl font-black text-white leading-none">{stats.total}</p>
        <p className="text-[9px] text-slate-700 mt-2 uppercase italic tracking-tighter">Recorded Systemic Failures</p>
      </div>
    </div>
  );
}
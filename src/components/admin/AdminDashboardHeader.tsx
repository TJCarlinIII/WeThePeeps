"use client";
import React from 'react';

interface DashboardStats {
  critical: number;
  pending: number;
  total: number;
}

export default function AdminDashboardHeader({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 font-mono">
      {/* CRITICAL ALERTS - The Red Alert for Urgent Action */}
      <div className="border border-red-900 bg-red-950/20 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 text-[8px] text-red-500 font-black animate-pulse">
          LIVE_THREAT_LEVEL: HIGH
        </div>
        <h3 className="text-red-500 text-[10px] uppercase font-bold tracking-widest mb-1">Critical_Incidents</h3>
        <p className="text-4xl font-black text-white leading-none">{stats.critical}</p>
        <p className="text-[9px] text-red-400/60 mt-2 uppercase italic">Requires Immediate Manifestation</p>
      </div>

      {/* PENDING REVIEW - The "To-Do" List */}
      <div className="border border-[#4A90E2]/30 bg-slate-900/20 p-6">
        <h3 className="text-[#4A90E2] text-[10px] uppercase font-bold tracking-widest mb-1">Dossier_Queue</h3>
        <p className="text-4xl font-black text-white leading-none">{stats.pending}</p>
        <p className="text-[9px] text-slate-500 mt-2 uppercase italic">Awaiting Fact_Verification</p>
      </div>

      {/* TOTAL RECORDS - The Weight of Evidence */}
      <div className="border border-slate-800 bg-black p-6">
        <h3 className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Evidence_Manifest_Total</h3>
        <p className="text-4xl font-black text-white leading-none">{stats.total}</p>
        <p className="text-[9px] text-slate-600 mt-2 uppercase italic">Recorded Systemic Failures</p>
      </div>
    </div>
  );
}
/**
 * FILE: src/components/blocks/DossierCard.tsx
 *
 * FIXES APPLIED:
 * 1. Status badge logic now matches STATUS_CONFIG from constants.ts:
 *    - pending      → amber  "OPEN_INVESTIGATION"
 *    - stonewalled  → red    "ACCESS_DENIED"
 *    - completed    → blue   "ARCHIVED_REPORT"
 *    - active       → white  "ACTIVE_SUBJECT"
 *    - under_review → amber  "UNDER_REVIEW"
 *    - former       → slate  "FORMER_SUBJECT"
 * 2. Label now uses the canonical STATUS_CONFIG label strings (not raw status value)
 * 3. All other display logic preserved exactly.
 */

import Link from "next/link";
import type { OfficialDossier } from "@/lib/database-types";

// ─── Status badge config ───────────────────────────────────────────────────────

interface StatusStyle {
  label: string;
  textColor: string;
  ringColor: string;
  bg: string;
}

const STATUS_STYLES: Record<string, StatusStyle> = {
  // incidents table / actor status values
  pending: {
    label: "OPEN_INVESTIGATION",
    textColor: "text-amber-500",
    ringColor: "border-amber-900/50",
    bg: "bg-amber-950/20",
  },
  stonewalled: {
    label: "ACCESS_DENIED",
    textColor: "text-red-500",
    ringColor: "border-red-900/80",
    bg: "bg-red-950/30",
  },
  completed: {
    label: "ARCHIVED_REPORT",
    textColor: "text-[#4A90E2]",
    ringColor: "border-blue-900/50",
    bg: "bg-blue-950/20",
  },
  active: {
    label: "ACTIVE_SUBJECT",
    textColor: "text-white",
    ringColor: "border-slate-700",
    bg: "bg-slate-900",
  },
  under_review: {
    label: "UNDER_REVIEW",
    textColor: "text-amber-400",
    ringColor: "border-amber-900/40",
    bg: "bg-amber-950/10",
  },
  former: {
    label: "FORMER_SUBJECT",
    textColor: "text-slate-400",
    ringColor: "border-slate-700/50",
    bg: "bg-slate-900/30",
  },
};

const DEFAULT_STATUS: StatusStyle = {
  label: "UNKNOWN",
  textColor: "text-slate-400",
  ringColor: "border-slate-700",
  bg: "bg-slate-900/20",
};

function getStatusStyle(status: string): StatusStyle {
  return STATUS_STYLES[status] ?? DEFAULT_STATUS;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function DossierCard({ dossier }: { dossier: OfficialDossier }) {
  const style = getStatusStyle(dossier.status ?? "active");

  return (
    <div className="border border-slate-800 bg-[#0B1021] flex flex-col p-5 relative group hover:border-[#4A90E2]/50 transition-colors h-full">

      {/* ⚠️ Falsification warning badge */}
      {dossier.history_of_falsification === 1 && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-950 border border-red-500 text-red-500 text-[8px] px-2 py-0.5 uppercase tracking-widest font-black whitespace-nowrap z-10 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
          ⚠️ Falsification History
        </div>
      )}

      {/* Top row: WTP-ID + Status badge */}
      <div className="flex justify-between items-center mb-6">
        <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest group-hover:text-[#4A90E2] transition-colors">
          {dossier.uid}
        </span>

        <span
          className={`font-mono text-[8px] uppercase font-black px-2 py-0.5 border flex items-center gap-1.5 tracking-widest ${style.textColor} ${style.ringColor} ${style.bg}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {style.label}
        </span>
      </div>

      {/* Profile section */}
      <div className="flex gap-4 mb-6 flex-grow">
        {/* Subject ID box */}
        <div className="w-16 h-16 shrink-0 border border-slate-800 flex flex-col items-center justify-center bg-[#050A18] relative overflow-hidden group-hover:border-[#4A90E2]/30 transition-colors">
          <div className="absolute inset-1 border border-slate-800/30" />
          <span className="text-[6px] text-slate-700 font-mono tracking-tighter opacity-50 uppercase">Subject ID</span>
          <span className="text-[10px] text-slate-600 font-mono font-black mt-1">WTP</span>
          <span className="text-[8px] text-slate-600 font-mono font-black">
            {dossier.id.toString().padStart(3, "0")}
          </span>
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-slate-600" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-slate-600" />
        </div>

        {/* Name / title / agency */}
        <div className="flex flex-col justify-center">
          <h3 className="font-serif text-xl font-bold text-white leading-tight mb-1">
            {dossier.full_name}
          </h3>
          <p className="font-mono text-[9px] text-[#D4AF37] uppercase tracking-widest mb-2 leading-relaxed">
            {dossier.job_title}
          </p>
          <Link
            href={`/jurisdiction/${dossier.agency_slug}`}
            className="font-mono text-[9px] text-slate-400 hover:text-[#4A90E2] transition-colors flex items-center gap-1"
          >
            ↳ {dossier.agency_name}
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 border-t border-slate-800/50 pt-4 mt-auto">
        <div className="text-center">
          <div className="text-xl font-bold text-white font-mono">{dossier.incident_count}</div>
          <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Incidents</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-white font-mono">{dossier.statute_count}</div>
          <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Statutes</div>
        </div>
      </div>

      {/* Footer link */}
      <Link
        href={`/accountability/${dossier.slug}`}
        className="mt-6 border-t border-slate-800/50 pt-4 text-center font-mono text-[9px] text-slate-500 uppercase tracking-widest group-hover:text-[#4A90E2] transition-colors flex justify-center items-center gap-2"
      >
        View Full Dossier ↗
      </Link>
    </div>
  );
}

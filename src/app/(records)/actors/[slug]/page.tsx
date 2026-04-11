"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { cn } from "@/lib/utils";

// ✅ Extended interface to support dossier-style display
interface Actor {
  id: number;
  name: string;
  sector: string;
  slug: string;
  // ✅ NEW: Dossier-style fields (optional - fallback if not provided)
  job_title?: string;
  status?: 'active' | 'under_review' | 'former' | 'pending' | 'stonewalled' | 'completed';
  agency_name?: string;
  bio?: string;
  incident_count?: number;
  statute_count?: number;
  history_of_falsification?: number;
}

interface ActorSearchProps {
  initialActors: Actor[];
  // ✅ Optional: Pre-fetched evidence previews for timeline display
  evidencePreviews?: Record<number, Array<{
    id: number;
    title: string;
    event_date: string;
    is_critical: number;
  }>>;
}

// ✅ Status badge config matching DossierCard.tsx
const STATUS_STYLES: Record<string, {
  label: string;
  textColor: string;
  ringColor: string;
  bg: string;
}> = {
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

const DEFAULT_STATUS = {
  label: "UNKNOWN",
  textColor: "text-slate-400",
  ringColor: "border-slate-700",
  bg: "bg-slate-900/20",
};

function getStatusStyle(status?: string | null) {
  if (!status) return DEFAULT_STATUS;
  return STATUS_STYLES[status] ?? DEFAULT_STATUS;
}

export default function ActorSearch({ initialActors, evidencePreviews = {} }: ActorSearchProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return initialActors.filter(a =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      (a.sector && a.sector.toLowerCase().includes(query.toLowerCase())) ||
      (a.agency_name && a.agency_name.toLowerCase().includes(query.toLowerCase())) ||
      (a.job_title && a.job_title.toLowerCase().includes(query.toLowerCase()))
    );
  }, [query, initialActors]);

  return (
    <div className="space-y-12">
      {/* Terminal Style Search */}
      <div className="relative max-w-2xl group">
        <div className="absolute -inset-0.5 bg-[#4A90E2]/10 rounded blur opacity-75 group-focus-within:opacity-100 transition duration-500" />
        <input
          type="text"
          placeholder="FILTER_BY_NAME_OR_SECTOR_OR_AGENCY..."
          className="relative w-full bg-slate-950/50 border border-slate-900 p-4 pl-12 text-[11px] font-mono outline-none focus:border-[#4A90E2] text-white uppercase tracking-widest transition-all placeholder:text-slate-800"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[#4A90E2] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[#4A90E2] opacity-50">
          {filtered.length}_RECORDS_MATCHED
        </div>
      </div>

      {/* Dossier-Style Subject Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((actor) => {
          const style = getStatusStyle(actor.status);
          const recentEvidence = evidencePreviews[actor.id] || [];
          
          return (
            <Link
              key={actor.id}
              href={`/actors/${actor.slug}`}
              className="group relative border border-slate-800 bg-[#0B1021] flex flex-col p-5 hover:border-[#4A90E2]/50 transition-colors h-full overflow-hidden"
            >
              {/* ⚠️ Falsification warning badge */}
              {actor.history_of_falsification === 1 && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-950 border border-red-500 text-red-500 text-[8px] px-2 py-0.5 uppercase tracking-widest font-black whitespace-nowrap z-10 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                  ⚠️ Falsification History
                </div>
              )}

              {/* Top row: WTP-ID + Status badge */}
              <div className="flex justify-between items-center mb-4">
                <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest group-hover:text-[#4A90E2] transition-colors">
                  WTP-{actor.id.toString().padStart(4, '0')}
                </span>
                <span
                  className={`font-mono text-[8px] uppercase font-black px-2 py-0.5 border flex items-center gap-1.5 tracking-widest ${style.textColor} ${style.ringColor} ${style.bg}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {style.label}
                </span>
              </div>

              {/* Profile section */}
              <div className="flex gap-4 mb-4 flex-grow">
                {/* Subject ID box */}
                <div className="w-14 h-14 shrink-0 border border-slate-800 flex flex-col items-center justify-center bg-[#050A18] relative overflow-hidden group-hover:border-[#4A90E2]/30 transition-colors">
                  <div className="absolute inset-1 border border-slate-800/30" />
                  <span className="text-[6px] text-slate-700 font-mono tracking-tighter opacity-50 uppercase">Subject</span>
                  <span className="text-[9px] text-slate-600 font-mono font-black mt-0.5">
                    {actor.id.toString().padStart(3, "0")}
                  </span>
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-slate-600" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-slate-600" />
                </div>

                {/* Name / title / agency */}
                <div className="flex flex-col justify-center min-w-0">
                  <h3 className="font-serif text-lg font-bold text-white leading-tight mb-0.5 truncate">
                    {actor.name}
                  </h3>
                  {actor.job_title && (
                    <p className="font-mono text-[9px] text-[#D4AF37] uppercase tracking-widest mb-1 leading-relaxed truncate">
                      {actor.job_title}
                    </p>
                  )}
                  {actor.agency_name && (
                    <p className="font-mono text-[8px] text-slate-400 hover:text-[#4A90E2] transition-colors truncate">
                      ↳ {actor.agency_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio preview (if available) */}
              {actor.bio && (
                <p className="font-serif text-[11px] text-slate-400 italic leading-relaxed mb-4 line-clamp-2 border-t border-slate-800/50 pt-3">
                  {actor.bio}
                </p>
              )}

              {/* Stats row */}
              {(actor.incident_count !== undefined || actor.statute_count !== undefined) && (
                <div className="grid grid-cols-2 gap-3 border-t border-slate-800/50 pt-3 mt-auto">
                  {actor.incident_count !== undefined && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-white font-mono">{actor.incident_count}</div>
                      <div className="text-[7px] font-mono text-slate-600 uppercase tracking-widest">Incidents</div>
                    </div>
                  )}
                  {actor.statute_count !== undefined && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-white font-mono">{actor.statute_count}</div>
                      <div className="text-[7px] font-mono text-slate-600 uppercase tracking-widest">Statutes</div>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Activity Preview (if evidencePreviews provided) */}
              {recentEvidence.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800/50">
                  <span className="font-mono text-[8px] text-slate-500 uppercase tracking-widest block mb-2">
                    Recent Activity
                  </span>
                  <div className="space-y-1.5">
                    {recentEvidence.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          item.is_critical ? "bg-red-600" : "bg-[#4A90E2]"
                        )} />
                        <span className="font-mono text-[9px] text-slate-400 truncate">
                          {item.title}
                        </span>
                      </div>
                    ))}
                    {recentEvidence.length > 2 && (
                      <span className="font-mono text-[8px] text-[#4A90E2] block mt-1">
                        +{recentEvidence.length - 2} more...
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Footer link */}
              <div className="mt-4 pt-4 border-t border-slate-800/50 text-center font-mono text-[9px] text-slate-500 uppercase tracking-widest group-hover:text-[#4A90E2] transition-colors flex justify-center items-center gap-2">
                View Full Dossier ↗
              </div>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full border border-dashed border-slate-800 p-12 text-center">
            <span className="font-mono text-[10px] text-slate-700 uppercase tracking-widest">
              No subjects match your search criteria
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
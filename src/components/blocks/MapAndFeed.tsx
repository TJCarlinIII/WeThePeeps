"use client";

/**
 * FILE: src/components/blocks/MapAndFeed.tsx
 *
 * CHANGE: ClosedLoopMap now fetches its own data from /api/network-map, so
 * MapAndFeed only needs to pass the two interaction callbacks (onEntitySelect +
 * selectedEntityId). The data props (entities, actors, relations) still come
 * from the server for filtering the IntelligenceFeed below the map.
 */

import React, { useState } from "react";
import Link from "next/link";
import IntelligenceFeed from "./IntelligenceFeed";
import ClosedLoopMap from "./ClosedLoopMap";
import type {
  EntityNode,
  IntelligenceIncident,
} from "@/lib/database-types";

interface MapAndFeedProps {
  /** Used only to resolve the entity name for the "View Jurisdiction" link */
  entities: EntityNode[];
  incidents: IntelligenceIncident[];
}

export default function MapAndFeed({ entities, incidents }: MapAndFeedProps) {
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);

  const filteredIncidents = selectedEntityId
    ? incidents.filter((i) => i.entity_id === selectedEntityId)
    : incidents;

  const selectedEntity = entities.find((e) => e.id === selectedEntityId) ?? null;

  return (
    <div className="space-y-16">

      {/* ── 1. INSTITUTIONAL NETWORK MAP ──────────────────────────────────── */}
      <section>
        <div className="flex justify-between items-end mb-6 border-b border-slate-800 pb-2">
          <div>
            <h2 className="text-[#D4AF37] font-mono text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="text-[8px]">▶</span> Institutional Network Map
            </h2>
            <p className="text-slate-400 font-serif italic text-sm mt-1">
              {selectedEntity
                ? `Isolated to: ${selectedEntity.name}`
                : "Select an institutional node to filter evidence. Click personnel to view accountability dossiers."}
            </p>
          </div>

          {selectedEntityId !== null && (
            <button
              onClick={() => setSelectedEntityId(null)}
              className="text-[#4A90E2] font-mono text-[9px] uppercase tracking-widest border border-[#4A90E2]/30 px-3 py-1 hover:bg-[#4A90E2]/10 transition-colors"
            >
              [X] Reset Filter
            </button>
          )}
        </div>

        {/* ClosedLoopMap fetches its own data from /api/network-map */}
        <ClosedLoopMap
          onEntitySelect={setSelectedEntityId}
          selectedEntityId={selectedEntityId}
        />
      </section>

      {/* ── 2. FILTERED INTELLIGENCE FEED ─────────────────────────────────── */}
      <section>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 border-b border-slate-800 pb-4 gap-4">
          <div>
            <h2 className="text-[#D4AF37] font-mono text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="text-[8px]">▶</span> Intelligence Feed
            </h2>
            <p className="text-slate-400 font-serif italic text-sm mt-1">
              {selectedEntity
                ? `Evidence isolated to ${selectedEntity.name}.`
                : "Global chronological manifest of documented evidence."}
            </p>
          </div>

          {selectedEntity && (
            <Link
              href={`/jurisdiction/${selectedEntity.slug}`}
              className="bg-[#4A90E2] text-[#050A18] font-mono text-[10px] font-black uppercase tracking-widest px-6 py-3 hover:bg-white transition-colors text-center shadow-[0_0_15px_rgba(74,144,226,0.3)] whitespace-nowrap"
            >
              View Jurisdiction Profile →
            </Link>
          )}
        </div>

        <IntelligenceFeed incidents={filteredIncidents} />
      </section>
    </div>
  );
}

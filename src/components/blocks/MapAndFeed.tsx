"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import IntelligenceFeed from './IntelligenceFeed';
import RelationalNetworkMap from './RelationalNetworkMap';
import { EntityNode, ActorNode, ActorEntityRelation, IntelligenceIncident } from '@/lib/database-types';

interface MapAndFeedProps {
  entities: EntityNode[];
  actors: ActorNode[];
  relations: ActorEntityRelation[];
  incidents: IntelligenceIncident[];
}

export default function MapAndFeed({ entities, actors, relations, incidents }: MapAndFeedProps) {
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);

  const filteredIncidents = selectedEntityId 
    ? incidents.filter(i => i.entity_id === selectedEntityId)
    : incidents;

  const selectedEntity = entities.find(e => e.id === selectedEntityId);

  return (
    <div className="space-y-16">
      
      {/* 1. RELATIONAL MAP */}
      <section>
        <div className="flex justify-between items-end mb-6 border-b border-slate-800 pb-2">
          <div>
            <h2 className="text-[#D4AF37] font-mono text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="text-[8px]">▶</span> Institutional Network Map
            </h2>
            <p className="text-slate-400 font-serif-formal italic text-sm mt-1">
              Select an institutional node to filter evidence. Click personnel to view accountability dossiers.
            </p>
          </div>
          {selectedEntityId && (
            <button 
              onClick={() => setSelectedEntityId(null)}
              className="text-[#4A90E2] font-mono text-[9px] uppercase tracking-widest border border-[#4A90E2]/30 px-3 py-1 hover:bg-[#4A90E2]/10 transition-colors"
            >
              [X] Reset Filter
            </button>
          )}
        </div>
        
        <RelationalNetworkMap 
          entities={entities}
          actors={actors}
          relations={relations}
          onEntitySelect={setSelectedEntityId}
          selectedEntityId={selectedEntityId}
        />
      </section>

      {/* 2. FILTERED INTELLIGENCE FEED */}
      <section>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 border-b border-slate-800 pb-4 gap-4">
          <div>
            <h2 className="text-[#D4AF37] font-mono text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="text-[8px]">▶</span> Intelligence Feed
            </h2>
            <p className="text-slate-400 font-serif-formal italic text-sm mt-1">
              {selectedEntity ? `Evidence isolated to ${selectedEntity.name}.` : `Global chronological manifest of documented evidence.`}
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
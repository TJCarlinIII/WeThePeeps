"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { EntityNode, ActorNode, ActorEntityRelation } from '@/lib/database-types';

interface MapProps {
  entities: EntityNode[];
  actors: ActorNode[];
  relations: ActorEntityRelation[];
  onEntitySelect: (id: number | null) => void;
  selectedEntityId: number | null;
}

export default function RelationalNetworkMap({ entities, actors, relations, onEntitySelect, selectedEntityId }: MapProps) {
  const router = useRouter();
  const [hoveredActor, setHoveredActor] = useState<number | null>(null);
  const [hoveredEntity, setHoveredEntity] = useState<number | null>(null);

  // SVG Dimensions & Layout Math
  const width = 800;
  const height = 600;
  const cx = width / 2;
  const cy = height / 2;
  const entityRadius = 220;
  const actorRadius = 90;

  // Map nodes to coordinates
  const entityPositions = useMemo(() => {
    const pos = new Map<number, { x: number, y: number }>();
    entities.forEach((e, idx) => {
      const angle = (idx / entities.length) * Math.PI * 2 - Math.PI / 2;
      pos.set(e.id, { x: cx + Math.cos(angle) * entityRadius, y: cy + Math.sin(angle) * entityRadius });
    });
    return pos;
  }, [entities]);

  const actorPositions = useMemo(() => {
    const pos = new Map<number, { x: number, y: number }>();
    actors.forEach((a, idx) => {
      const angle = (idx / actors.length) * Math.PI * 2 - Math.PI / 2;
      pos.set(a.id, { x: cx + Math.cos(angle) * actorRadius, y: cy + Math.sin(angle) * actorRadius });
    });
    return pos;
  }, [actors]);

  // Determine if a node/line should be highlighted
  const isLineActive = (actorId: number, entityId: number) => {
    return hoveredActor === actorId || hoveredEntity === entityId || selectedEntityId === entityId;
  };

  const isEntityFaded = (entityId: number) => {
    if (hoveredEntity) return hoveredEntity !== entityId;
    if (selectedEntityId) return selectedEntityId !== entityId;
    return false;
  };

  const isActorFaded = (actorId: number) => {
    if (hoveredActor) return hoveredActor !== actorId;
    // If an entity is selected, highlight actors connected to it
    if (selectedEntityId || hoveredEntity) {
      const targetEntityId = hoveredEntity || selectedEntityId;
      const isConnected = relations.some(r => r.actor_id === actorId && r.entity_id === targetEntityId);
      return !isConnected;
    }
    return false;
  };

  return (
    <div className="w-full aspect-[4/3] bg-[#0B1021] border border-slate-800 relative overflow-hidden flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 800 600" className="opacity-90">
        
        {/* Background Radar Grid */}
        <circle cx={cx} cy={cy} r={entityRadius} fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx={cx} cy={cy} r={actorRadius} fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />

        {/* Draw Connection Lines FIRST (so they render underneath) */}
        {relations.map((rel, idx) => {
          const aPos = actorPositions.get(rel.actor_id);
          const ePos = entityPositions.get(rel.entity_id);
          if (!aPos || !ePos) return null;

          const active = isLineActive(rel.actor_id, rel.entity_id);
          const faded = (hoveredActor || hoveredEntity || selectedEntityId) && !active;

          return (
            <path 
              key={`link-${idx}`} 
              d={`M${aPos.x},${aPos.y} Q${cx},${cy} ${ePos.x},${ePos.y}`} 
              fill="none" 
              stroke={active ? "#4A90E2" : "#1E293B"} 
              strokeWidth={active ? "2" : "1"} 
              className={`transition-all duration-300 ${faded ? 'opacity-10' : active ? 'opacity-80' : 'opacity-40'}`}
            />
          );
        })}

        {/* Draw Entities (Outer Orbit) */}
        {entities.map(ent => {
          const pos = entityPositions.get(ent.id);
          if (!pos) return null;
          
          const isSelected = selectedEntityId === ent.id;
          const isHighPriority = ent.is_high_priority === 1;
          const color = isHighPriority ? "#D4AF37" : "#4A90E2";
          const isFaded = isEntityFaded(ent.id);

          return (
            <g 
              key={`ent-${ent.id}`} 
              transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => onEntitySelect(isSelected ? null : ent.id)}
              onMouseEnter={() => setHoveredEntity(ent.id)}
              onMouseLeave={() => setHoveredEntity(null)}
              className={`cursor-pointer transition-all duration-500 ${isFaded ? 'opacity-20' : 'opacity-100'}`}
            >
              <circle r={isSelected ? "45" : "35"} fill={color} fillOpacity={isSelected ? "0.15" : "0.05"} stroke={color} strokeWidth="1" strokeDasharray={isHighPriority ? "" : "2 4"} className={isHighPriority ? "animate-[spin_15s_linear_infinite]" : ""} />
              <circle r="15" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" />
              
              <text y="35" fill={isSelected ? "white" : "#94A3B8"} fontSize="11" fontFamily="serif" fontStyle="italic" textAnchor="middle" className="pointer-events-none drop-shadow-md">
                {ent.name.length > 22 ? ent.name.substring(0, 22) + '...' : ent.name}
              </text>
            </g>
          );
        })}

        {/* Draw Actors (Inner Orbit) */}
        {actors.map(actor => {
          const pos = actorPositions.get(actor.id);
          if (!pos) return null;

          const isFaded = isActorFaded(actor.id);
          const isHovered = hoveredActor === actor.id;

          return (
            <g 
              key={`actor-${actor.id}`} 
              transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => router.push(`/accountability/${actor.slug}`)}
              onMouseEnter={() => setHoveredActor(actor.id)}
              onMouseLeave={() => setHoveredActor(null)}
              className={`cursor-pointer transition-all duration-300 ${isFaded ? 'opacity-10' : 'opacity-100'}`}
            >
              <circle r={isHovered ? "18" : "12"} fill="#0B1021" stroke={isHovered ? "white" : "#64748B"} strokeWidth={isHovered ? "2" : "1"} />
              <text y="4" fill={isHovered ? "white" : "#CBD5E1"} fontSize="10" fontFamily="monospace" textAnchor="middle" className="pointer-events-none">
                {actor.full_name.split(' ')[0].charAt(0)}{actor.full_name.split(' ').pop()?.charAt(0)}
              </text>
              <text y="-20" fill="white" fontSize="9" fontFamily="monospace" textAnchor="middle" className={`pointer-events-none transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                {actor.full_name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
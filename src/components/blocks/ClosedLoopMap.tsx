"use client";

import React, { useEffect, useState } from 'react';
import { Shield, Gavel, Badge, Cross } from 'lucide-react'; // Icons for the Mini-Icons

// 1. Define the Geographic Zones (The "Force-Directed" Anchor Points)
const CLUSTER_MAP: Record<string, { x: number; y: number; color: string }> = {
  "Lansing (State)": { x: 400, y: 80, color: "#D4AF37" },    // Top - Gold (Oversight)
  "Metro Detroit":   { x: 400, y: 250, color: "#4A90E2" },   // Center - Blue (Action)
  "Grand Rapids (Hub)": { x: 150, y: 200, color: "#10B981" }, // Side - Green (Corporate)
  "Ann Arbor (Mobile)": { x: 250, y: 320, color: "#8B5CF6" }, // Lower Side - Purple
};

interface MapNode {
  id: number;
  name: string;
  geographic_cluster: string;
  entity_type: string;
}

interface MapLink {
  source_id: number;
  target_id: number;
  connection_type: 'funding' | 'employment' | 'legal_representation' | 'contracted_vendor';
  strength: number;
}

export default function ClosedLoopMap() {
  const [data, setData] = useState<{ nodes: MapNode[]; links: MapLink[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

// Fetch real data from the API route
  useEffect(() => {
    const loadMapData = async () => {
      try {
        const res = await fetch('/api/network-map');
        const d = await res.json() as { nodes: MapNode[]; links: MapLink[] };
        setData(d);
      } catch (err) {
        console.error("Map Data Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, []);

  // Helper to get coordinates with slight "jitter" so nodes don't overlap perfectly
  const getNodePos = (cluster: string, index: number) => {
    const base = CLUSTER_MAP[cluster] || { x: 400, y: 200, color: "#64748b" };
    const offset = index * 45; // Spread nodes out within their cluster
    return {
      x: base.x + Math.cos(offset) * 50,
      y: base.y + Math.sin(offset) * 40,
      color: base.color
    };
  };

  const getLineStyle = (type: string) => {
    switch (type) {
      case 'funding': return { stroke: "#D4AF37", dash: "5,5" }; // Gold Dashed
      case 'employment': return { stroke: "#4A90E2", dash: "0" }; // Solid Blue
      case 'legal_representation': return { stroke: "#DC2626", dash: "0" }; // Solid Red
      default: return { stroke: "#334155", dash: "2,2" };
    }
  };

  if (loading) return <div className="w-full h-96 flex items-center justify-center font-mono text-slate-500">INITIALIZING NEURAL LINK...</div>;

  return (
    <div className="w-full aspect-[2/1] bg-[#0B1021] border border-slate-800 relative overflow-hidden flex items-center justify-center p-8">
      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 font-mono text-[8px] text-slate-500 uppercase tracking-widest bg-[#050A18]/80 p-3 border border-slate-800">
        <div className="flex items-center gap-2"><span className="w-3 h-[1px] bg-[#D4AF37] border-t border-dashed" /> Funding Loop</div>
        <div className="flex items-center gap-2"><span className="w-3 h-[1px] bg-[#4A90E2]" /> Employment</div>
        <div className="flex items-center gap-2"><span className="w-3 h-[1px] bg-[#DC2626]" /> Legal/Justice</div>
      </div>

      <svg width="100%" height="100%" viewBox="0 0 800 400" className="opacity-90">
        {/* Background Grid */}
        <path d="M0,200 L800,200 M400,0 L400,400" stroke="#1E293B" strokeWidth="0.5" strokeDasharray="10 10" />

        {/* 1. Draw Connection Lines FIRST (so they are under nodes) */}
        {data.links.map((link, i) => {
          const sourceNode = data.nodes.find(n => n.id === link.source_id);
          const targetNode = data.nodes.find(n => n.id === link.target_id);
          if (!sourceNode || !targetNode) return null;

          const start = getNodePos(sourceNode.geographic_cluster, data.nodes.indexOf(sourceNode));
          const end = getNodePos(targetNode.geographic_cluster, data.nodes.indexOf(targetNode));
          const style = getLineStyle(link.connection_type);

          return (
            <line
              key={`link-${i}`}
              x1={start.x} y1={start.y}
              x2={end.x} y2={end.y}
              stroke={style.stroke}
              strokeWidth={link.strength || 1}
              strokeDasharray={style.dash}
              className="opacity-40 hover:opacity-100 transition-opacity"
            />
          );
        })}

        {/* 2. Draw Nodes */}
        {data.nodes.map((node, i) => {
          const pos = getNodePos(node.geographic_cluster, i);
          
          return (
            <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`} className="cursor-pointer group">
              {/* Outer Glow */}
              <circle r="15" fill={pos.color} fillOpacity="0.05" className="group-hover:fill-opacity-20 transition-all" />
              
              {/* Main Node Point */}
              <circle r="4" fill={pos.color} className="blue-glow" />
              
              {/* Label */}
              <text 
                y="18" 
                fill="white" 
                fontSize="7" 
                fontFamily="monospace" 
                textAnchor="middle" 
                className="opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter"
              >
                {node.name}
              </text>

              {/* Symbol Overlay (Conceptual) */}
              {node.entity_type === 'government' && <circle r="2" cy="-8" fill="#D4AF37" />}
            </g>
          );
        })}

        {/* Regional Hub Labels */}
        {Object.entries(CLUSTER_MAP).map(([name, pos]) => (
          <text 
            key={name}
            x={pos.x} 
            y={pos.y - 60} 
            fill={pos.color} 
            fontSize="10" 
            fontFamily="monospace" 
            textAnchor="middle" 
            fontWeight="black"
            className="opacity-30 uppercase tracking-[0.3em]"
          >
            {name.split(' ')[0]}
          </text>
        ))}
      </svg>
    </div>
  );
}
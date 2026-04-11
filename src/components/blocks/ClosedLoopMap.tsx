"use client";

/**
 * FILE: src/components/blocks/ClosedLoopMap.tsx
 *
 * ARCHITECTURE DECISION:
 *   This component fetches directly from /api/network-map rather than receiving
 *   props. This is intentional — the API queries ALL entities and ALL actors,
 *   so the graph renders even when the connections table is empty. Passing props
 *   from the home page was broken because the home page SQL only returned
 *   entities that appeared in the connections table (empty = no nodes).
 *
 * FIXES:
 *   1. Restored internal fetch from /api/network-map
 *   2. ResizeObserver measures the container and passes exact px width/height
 *      to ForceGraph2D — required for the canvas to paint correctly
 *   3. Actors (gold) pinned to inner ring r=110, Entities (blue/gold) r=250
 *   4. Links filtered to only valid source+target pairs (no crash on stale IDs)
 *   5. onEntitySelect callback wired for two-way feed filtering
 */

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";

// ─── Shapes ───────────────────────────────────────────────────────────────────

interface GraphNode {
  id: string;
  label: string;
  nodeType: "entity" | "actor";
  color: string;
  fx: number;  // pinned x
  fy: number;  // pinned y
  x?: number;
  y?: number;
  dbId: number;
  slug: string;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface ApiEntity {
  id: number;
  name: string;
  slug: string;
  has_documented_crimes: number;
  is_high_priority: number;
}

interface ApiActor {
  id: number;
  full_name: string;
  slug: string;
  status: string | null;
}

interface ApiRelation {
  source_id: number;  // → actors.id
  target_id: number;  // → entities.id
  connection_type: string;
}

interface NetworkMapResponse {
  entities: ApiEntity[];
  actors: ApiActor[];
  relations: ApiRelation[];
}

// ─── Dynamic import (SSR must be off) ────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ForceGraph2D = dynamic<any>(
  () => import("react-force-graph-2d"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center font-mono text-[10px] text-slate-600 uppercase tracking-[0.3em]">
        Initializing Neural Overlay...
      </div>
    ),
  }
);

// ─── Graph builder ────────────────────────────────────────────────────────────

const OUTER_R = 250;  // entity ring radius
const INNER_R = 110;  // actor ring radius

function buildGraphData(data: NetworkMapResponse): GraphData {
  const { entities = [], actors = [], relations = [] } = data;

  const entityNodes: GraphNode[] = entities.map((e, i) => {
    const angle = (i / Math.max(entities.length, 1)) * 2 * Math.PI - Math.PI / 2;
    return {
      id: `entity-${e.id}`,
      label: e.name,
      nodeType: "entity",
      color: e.is_high_priority === 1 ? "#D4AF37" : "#4A90E2",
      fx: Math.cos(angle) * OUTER_R,
      fy: Math.sin(angle) * OUTER_R,
      dbId: e.id,
      slug: e.slug ?? "",
    };
  });

  const actorNodes: GraphNode[] = actors.map((a, i) => {
    const angle = (i / Math.max(actors.length, 1)) * 2 * Math.PI - Math.PI / 2;
    return {
      id: `actor-${a.id}`,
      label: a.full_name,
      nodeType: "actor",
      color: "#D4AF37",
      fx: Math.cos(angle) * INNER_R,
      fy: Math.sin(angle) * INNER_R,
      dbId: a.id,
      slug: a.slug ?? "",
    };
  });

  const nodeIds = new Set([
    ...entityNodes.map((n) => n.id),
    ...actorNodes.map((n) => n.id),
  ]);

  // source_id = actor, target_id = entity (connections table convention)
  const links: GraphLink[] = relations
    .map((r) => ({
      source: `actor-${r.source_id}`,
      target: `entity-${r.target_id}`,
      label: r.connection_type ?? "connected",
    }))
    .filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target));

  return { nodes: [...entityNodes, ...actorNodes], links };
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ClosedLoopMapProps {
  onEntitySelect: (id: number | null) => void;
  selectedEntityId: number | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClosedLoopMap({ onEntitySelect, selectedEntityId }: ClosedLoopMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [fetchStatus, setFetchStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  // Measure container with ResizeObserver — ForceGraph2D NEEDS exact pixel dims
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    });
    observer.observe(el);
    // Initial measurement
    const rect = el.getBoundingClientRect();
    if (rect.width > 0) setDimensions({ width: rect.width, height: rect.height });
    return () => observer.disconnect();
  }, []);

  // Fetch all entities + actors + connections from dedicated API route
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/network-map");
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

        const json = (await res.json()) as NetworkMapResponse;

        if (!Array.isArray(json.entities) || !Array.isArray(json.actors)) {
          throw new Error("API returned an invalid payload structure");
        }

        setGraphData(buildGraphData(json));
        setFetchStatus("ready");
      } catch (err) {
        console.error("[ClosedLoopMap] fetch failed:", err);
        setErrorMsg(err instanceof Error ? err.message : String(err));
        setFetchStatus("error");
      }
    };
    load();
  }, []);

  // ── Canvas painters ──────────────────────────────────────────────────────

  const paintNode = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (rawNode: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const node = rawNode as GraphNode & { x: number; y: number };
      const isEntity  = node.nodeType === "entity";
      const isSelected = isEntity && node.dbId === selectedEntityId;
      const r = isSelected ? (isEntity ? 16 : 10) : (isEntity ? 11 : 7);
      const fontSize = Math.max(10 / globalScale, 5);

      if (isSelected) {
        ctx.shadowColor = node.color;
        ctx.shadowBlur  = 18;
      }

      // Circle body
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
      ctx.fillStyle   = isSelected ? `${node.color}44` : `${node.color}1A`;
      ctx.fill();
      ctx.strokeStyle = node.color;
      ctx.lineWidth   = isSelected ? 2.5 : 1.2;
      ctx.stroke();
      ctx.shadowBlur  = 0;

      // Inner dot for actors
      if (!isEntity) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = node.color;
        ctx.fill();
      }

      // Label
      ctx.font = `${isEntity ? "italic " : ""}${fontSize}px ${
        isEntity ? "Georgia, serif" : '"Courier New", monospace'
      }`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle    = isSelected ? "#ffffff" : isEntity ? "#94A3B8" : "#CBD5E1";

      const maxChars = isEntity ? 20 : 12;
      const label    = node.label.length > maxChars
        ? node.label.slice(0, maxChars - 1) + "…"
        : node.label;

      const yOffset = r + fontSize + 2;
      ctx.fillText(label, node.x, node.y + (isEntity ? yOffset : -yOffset));
    },
    [selectedEntityId]
  );

  const paintPointer = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (rawNode: any, color: string, ctx: CanvasRenderingContext2D) => {
      const node = rawNode as GraphNode & { x: number; y: number };
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.nodeType === "entity" ? 18 : 13, 0, 2 * Math.PI);
      ctx.fill();
    },
    []
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeClick = useCallback((rawNode: any) => {
    const node = rawNode as GraphNode;
    if (node.nodeType === "entity") {
      onEntitySelect(node.dbId === selectedEntityId ? null : node.dbId);
    } else if (node.slug) {
      window.location.href = `/accountability/${node.slug}`;
    }
  }, [onEntitySelect, selectedEntityId]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getNodeLabel = useCallback((rawNode: any) => {
    const node = rawNode as GraphNode;
    return node.nodeType === "entity" ? `📍 ${node.label}` : `👤 ${node.label}`;
  }, []);

  // ── Status renders ───────────────────────────────────────────────────────

  if (fetchStatus === "loading") {
    return (
      <div className="h-[600px] border border-slate-800 bg-[#050A18] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border border-[#4A90E2] border-t-transparent rounded-full animate-spin mx-auto" />
          <span className="font-mono text-[10px] text-slate-600 uppercase tracking-[0.3em] block">
            Syncing Network Intelligence...
          </span>
        </div>
      </div>
    );
  }

  if (fetchStatus === "error") {
    return (
      <div className="h-[600px] border border-red-900/40 bg-red-950/10 flex items-center justify-center">
        <div className="text-center px-8 space-y-2">
          <span className="font-mono text-[10px] text-red-500 uppercase tracking-widest block">
            Network Sync Failure
          </span>
          <span className="font-mono text-[9px] text-slate-600 block">{errorMsg}</span>
        </div>
      </div>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="h-[600px] border border-dashed border-slate-800 bg-[#050A18] flex flex-col items-center justify-center gap-3">
        <span className="font-mono text-[10px] text-slate-600 uppercase tracking-[0.25em]">
          No Network Nodes Detected
        </span>
        <span className="font-mono text-[9px] text-slate-700">
          Populate the{" "}
          <code className="text-slate-500">entities</code> and{" "}
          <code className="text-slate-500">actors</code> tables to render the graph
        </span>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="w-full h-[600px] bg-[#050A18] border border-slate-800 relative overflow-hidden"
    >
      {/* Legend */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        <span className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-widest text-slate-500">
          <span className="w-2 h-2 rounded-full border border-[#4A90E2] bg-[#4A90E2]/20 inline-block" />
          Entity / Jurisdiction
        </span>
        <span className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-widest text-slate-500">
          <span className="w-2 h-2 rounded-full border border-[#D4AF37] bg-[#D4AF37]/20 inline-block" />
          Actor / Personnel
        </span>
        {graphData.links.length > 0 && (
          <span className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-widest text-slate-500">
            <span className="w-4 h-px border-t border-dashed border-[#4A90E2]/50 inline-block" />
            {graphData.links.length} Connection{graphData.links.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Interaction hint */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
        <span className="font-mono text-[8px] text-slate-700 uppercase tracking-widest">
          Scroll to zoom · Drag to pan · Click to filter
        </span>
      </div>

      <ForceGraph2D
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#050A18"
        linkColor={() => "rgba(74,144,226,0.22)"}
        linkWidth={1}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleColor={() => "#4A90E2"}
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => "replace"}
        nodePointerAreaPaint={paintPointer}
        nodeLabel={getNodeLabel}
        onNodeClick={handleNodeClick}
        enableZoomInteraction
        enablePanInteraction
        minZoom={0.25}
        maxZoom={8}
        cooldownTicks={80}
        d3AlphaDecay={0.04}
        d3VelocityDecay={0.85}
      />
    </div>
  );
}

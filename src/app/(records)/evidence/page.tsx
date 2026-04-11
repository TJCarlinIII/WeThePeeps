export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import EvidenceSearch from "./EvidenceSearch";
import { FileText } from "lucide-react";
import type { D1Database } from "@cloudflare/workers-types";

export default async function EvidenceIndexPage() {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };

  // This query pulls from 'incidents' and joins actors/sectors for a rich search
  const { results } = await env.DB.prepare(`
    SELECT 
      i.id, 
      i.title, 
      a.full_name as official, 
      s.name as sector, 
      i.is_critical as isCritical, 
      i.event_date as created_at
    FROM incidents i
    LEFT JOIN actors a ON i.actor_id = a.id
    LEFT JOIN entities e ON i.entity_id = e.id
    LEFT JOIN sectors s ON e.sector_id = s.id
    ORDER BY i.event_date DESC
    LIMIT 100
  `).all();

  return (
    <div className="py-12">
      <header className="mb-16 border-l-4 border-[#4A90E2] pl-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-5 h-5 text-[#4A90E2]" />
          <span className="font-mono text-[10px] text-[#4A90E2] font-black uppercase tracking-[0.4em]">
            Evidence_Manifest: Active_Records
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase mb-4 italic">
          Evidence <span className="text-[#D4AF37]">Vault</span>
        </h1>
        <p className="text-slate-500 font-serif text-sm max-w-2xl leading-relaxed italic border-t border-slate-900 pt-4">
          Documented records, sourced from public filings, FOIA requests, and sworn testimony.
        </p>
      </header>

      <EvidenceSearch initialEvidence={(results as any) || []} />
    </div>
  );
}
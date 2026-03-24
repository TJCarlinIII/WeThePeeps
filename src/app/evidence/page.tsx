export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import EvidenceSearch from './EvidenceSearch';

interface Evidence {
  id: number;
  title: string;
  official: string;
  sector: string;
  isCritical: number;
  created_at: string;
}

export default async function EvidencePage() {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };
  
  const { results: evidence } = await env.DB.prepare(
    "SELECT id, title, official, sector, isCritical, created_at FROM evidence ORDER BY created_at DESC"
  ).all() as { results: Evidence[] };

  return (
    <main className="min-h-screen bg-black text-white p-8 md:p-20 font-mono">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 border-l-4 border-red-600 pl-6">
          <span className="text-red-500 text-[10px] font-bold tracking-[0.4em] uppercase">Archive_Access</span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-white mt-2">Evidence_Manifest</h1>
          <p className="text-slate-500 text-xs font-bold mt-4 tracking-[0.1em] max-w-xl uppercase leading-relaxed">
            Central repository for all documented oversight files. Records are sorted by entry date and tagged with respective sectors and legal statutes.
          </p>
        </header>

        <EvidenceSearch initialEvidence={evidence} />
      </div>
    </main>
  );
}
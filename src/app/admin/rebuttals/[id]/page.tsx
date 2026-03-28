import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import Link from "next/link";

export const runtime = "nodejs";

interface Env {
  DB: D1Database;
}

interface RebuttalDetail {
  id: number;
  falsified_claim: string;
  clinical_fact: string;
  evidence_url?: string;
  created_at: string;
  actor_name: string;
  incident_title?: string;
  evidence_title?: string;
}

export default async function RebuttalPage({ params }: { params: { id: string } }) {
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as unknown as Env).DB;

  const rebuttal = await db.prepare(`
    SELECT 
      r.*, 
      a.full_name as actor_name,
      i.title as incident_title,
      m.title as evidence_title
    FROM rebuttals r
    LEFT JOIN actors a ON r.actor_id = a.id
    LEFT JOIN incidents i ON r.incident_id = i.id
    LEFT JOIN media m ON r.evidence_id = m.id
    WHERE r.id = ?
  `).bind(params.id).first<RebuttalDetail>();

  if (!rebuttal) notFound();

  // Formatting the ID for display
  const displayId = String(rebuttal.id).padStart(6, "0");

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 border-b border-slate-900 pb-8">
          <Link href="/codex" className="text-[#4A90E2] text-[10px] uppercase font-bold hover:underline mb-4 block">
            &larr; Back_to_Codex
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <span className="bg-emerald-600 text-black text-[10px] font-black px-2 py-1 uppercase tracking-widest">
              Verified_Rebuttal
            </span>
            <span className="text-slate-600 text-[10px]">ID: {displayId}</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
            Fact_Check: {rebuttal.actor_name}
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Falsified Claim */}
          <section className="space-y-4">
            <h2 className="text-red-500 text-xs font-black uppercase tracking-[0.3em] border-l-2 border-red-600 pl-4">
              Falsified_Claim
            </h2>
            <div className="bg-red-900/10 border border-red-900/30 p-6 italic text-slate-300 leading-relaxed">
              {/* Using template literals for quotes - much safer than entities here */}
              {`"${rebuttal.falsified_claim}"`}
              <p className="mt-2 text-red-400/80 uppercase text-[10px] font-bold tracking-widest">[Source_Contested]</p>
            </div>
          </section>

          {/* Clinical Fact */}
          <section className="space-y-4">
            <h2 className="text-emerald-500 text-xs font-black uppercase tracking-[0.3em] border-l-2 border-emerald-600 pl-4">
              Clinical_Fact
            </h2>
            <div className="bg-emerald-900/10 border border-emerald-900/30 p-6 text-white leading-relaxed font-bold">
              {rebuttal.clinical_fact}
            </div>
          </section>
        </div>

        <footer className="mt-16 pt-8 border-t border-slate-900">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <h3 className="text-slate-500 text-[10px] uppercase font-bold mb-4 tracking-widest">Supporting_Evidence</h3>
              {rebuttal.evidence_title ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4A90E2]/10 border border-[#4A90E2]/30 flex items-center justify-center text-[#4A90E2]">
                    DOC
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase">{rebuttal.evidence_title}</p>
                    <p className="text-[9px] text-slate-500 italic">Source: Internal_Vault_Record</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-700 italic">No master record linked.</p>
              )}
            </div>

            {rebuttal.evidence_url && (
              <a 
                href={rebuttal.evidence_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-black text-[10px] font-black px-6 py-3 uppercase tracking-widest hover:bg-[#4A90E2] hover:text-white transition-all"
              >
                Download_External_Asset &rarr;
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
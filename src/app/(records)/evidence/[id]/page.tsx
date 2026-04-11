export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from 'next/link';
import { getSocialShareUrl, linkifyEntities } from "@/lib/utils";
import type { D1Database } from "@cloudflare/workers-types";

interface Rebuttal {
  id: number;
  description: string;
}

interface EvidenceDetail {
  id: number;
  title: string;
  official: string;
  statute: string;
  sector: string;
  content: string;
  fileUrl: string;
  is_critical: number;
  event_date: string;
  tags?: string;
  rebuttals?: Rebuttal[];
}

interface CloudflareEnv {
  DB: D1Database;
}

export default async function EvidenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as CloudflareEnv;

  // 1. Fetch main incident and related metadata
  // Note: We use LIKE for statutes because statute_citations is now a comma-separated text field
  const [evidenceRes, actorsRes] = await Promise.all([
    env.DB.prepare(`
      SELECT 
        i.id,
        i.title,
        i.description as content,
        i.is_critical,
        i.event_date,
        a.full_name AS official, 
        s.name AS sector, 
        m.file_path as fileUrl,
        (SELECT group_concat(citation, ', ') FROM statutes WHERE i.statute_citations LIKE '%' || citation || '%') as statute
      FROM incidents i
      LEFT JOIN actors a ON i.actor_id = a.id
      LEFT JOIN entities e ON i.entity_id = e.id
      LEFT JOIN sectors s ON e.sector_id = s.id
      LEFT JOIN media m ON m.incident_id = i.id
      WHERE i.id = ?
    `).bind(id).first<EvidenceDetail>(),
    env.DB.prepare("SELECT full_name as name, slug FROM actors").all()
  ]);

  // --- CUSTOM ERROR UI (If record doesn't exist) ---
  if (!evidenceRes) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-[#050A18] investigative-grid">
        <div className="max-w-2xl w-full border border-red-900/50 bg-red-900/5 p-12 text-center backdrop-blur-md relative z-10">
          <div className="text-red-600 font-black text-[10px] uppercase tracking-[0.5em] mb-6 animate-pulse">
            [ SYSTEM_ACCESS_ERROR ]
          </div>
          <h1 className="text-white text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 italic">
            ERROR: RECORD_NOT_FOUND_IN_LEDGER
          </h1>
          <p className="text-slate-500 font-mono text-xs uppercase mb-8 leading-relaxed">
            The requested index (ID: {id}) does not exist within the active manifest or has been restricted.
          </p>
          <Link 
            href="/evidence" 
            className="inline-block border border-slate-800 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#4A90E2] hover:bg-white hover:text-black transition-all"
          >
            Return_To_Manifest
          </Link>
        </div>
      </main>
    );
  }

  // 2. Fetch linked rebuttals/verifications
  const rebuttalsRes = await env.DB.prepare(`
    SELECT id, description 
    FROM incidents 
    WHERE parent_incident_id = ? OR id IN (
      SELECT rebuttal_id FROM incident_rebuttals WHERE incident_id = ?
    )
  `).bind(id, id).all();

  const evidenceData = {
    ...evidenceRes,
    rebuttals: rebuttalsRes.results as unknown as Rebuttal[]
  };

  const actors = actorsRes.results as { name: string, slug: string }[];
  const shareUrl = `https://wethepeeps.net/evidence/${evidenceData.id}`;

  return (
    <main className="min-h-screen bg-[#050A18] text-white p-8 md:p-20 font-mono investigative-grid">
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* BREADCRUMB */}
        <Link href="/evidence" className="text-[#4A90E2] text-[10px] font-black uppercase tracking-[0.3em] hover:underline mb-12 inline-block">
          &lt;&lt; RETURN_TO_MANIFEST
        </Link>

        <article className="border border-slate-900 bg-slate-950/50 p-8 md:p-12 relative overflow-hidden backdrop-blur-sm">
          {evidenceData.is_critical === 1 && (
            <div className="absolute top-0 right-0 bg-red-600 text-black px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
              High_Priority_Record
            </div>
          )}

          <header className="mb-10">
            <div className="flex gap-4 mb-6">
              <span className="bg-[#4A90E2]/10 text-[#4A90E2] text-[10px] px-3 py-1 font-bold border border-[#4A90E2]/20 uppercase">
                {evidenceData.sector || "General Sector"}
              </span>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-3 py-1 font-bold uppercase">
                Statute: {evidenceData.statute || "Unclassified"}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight italic text-white mb-6">
              {evidenceData.title}
            </h1>
            
            <div className="text-slate-500 text-xs font-bold uppercase tracking-widest border-t border-slate-800 pt-6">
              Subject: <span className="text-white">{evidenceData.official || "Unidentified"}</span> 
              <span className="mx-4 text-slate-800">|</span> 
              Entered: {evidenceData.event_date ? new Date(evidenceData.event_date).toLocaleDateString() : "Pending"}
            </div>
          </header>

          {/* MAIN NARRATIVE */}
          <div className="prose prose-invert max-w-none mb-16 text-slate-300 font-sans leading-relaxed text-lg">
            <div 
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: linkifyEntities(evidenceData.content, actors) }} 
            />
          </div>

          {/* REBUTTALS */}
          {evidenceData.rebuttals && evidenceData.rebuttals.length > 0 && (
            <section className="mt-12 space-y-6 border-t border-slate-800 pt-12">
              <div className="flex items-center gap-4">
                <h3 className="text-green-500 text-[10px] font-black uppercase tracking-[0.4em]">
                  Verified_Rebuttals
                </h3>
                <div className="h-[1px] flex-grow bg-green-900/30"></div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {evidenceData.rebuttals.map((reb) => (
                  <div 
                    key={reb.id} 
                    className="border border-green-900/40 bg-green-950/20 p-6 relative group hover:border-green-500/50 transition-all shadow-xl"
                  >
                    <div className="text-[9px] text-green-600 font-mono mb-3 uppercase tracking-widest flex justify-between">
                      <span>Evidence_Type: Clinical_Verification // ID_{reb.id}</span>
                      <span className="text-green-900">VERIFIED_SECURE</span>
                    </div>
                    
                    <p className="text-slate-300 font-serif leading-relaxed mb-6 text-md italic">
                      "{reb.description}"
                    </p>

                    <Link 
                      href={`/evidence/${reb.id}`} 
                      className="text-[10px] text-green-500 font-black uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all"
                    >
                      Inspect_Primary_Document <span className="text-lg">→</span>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SUPPORTING MEDIA */}
          {evidenceData.fileUrl && (
            <div className="mt-12 pt-8 border-t border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-6 italic">Supporting_Media</h3>
              <a 
                href={evidenceData.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-6 bg-white text-black px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-[#4A90E2] hover:text-white transition-all shadow-2xl"
              >
                Download_Evidence_File
                <span className="text-xl">→</span>
              </a>
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-black uppercase tracking-widest">
            <div className="text-center md:text-left text-slate-600">
              Record Integrity Verified // SHA256_{evidenceData.id}
            </div>
            <div className="flex gap-6">
                <a href={getSocialShareUrl('x', { title: evidenceData.title, url: shareUrl })} target="_blank" className="text-[#4A90E2] hover:text-white transition-colors">Broadcast_X</a>
                <span className="text-slate-800">|</span>
                <button onClick={() => window.print()} className="text-slate-400 hover:text-white transition-colors">Print_Hard_Copy</button>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
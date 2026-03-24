export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import Link from "next/link";

interface EntityProfile {
  id: number;
  name: string;
  sector: string;
  description: string;
  entityslug: string;
}

interface AssociatedActor {
  id: number;
  full_name: string;
  job_title: string;
  status: string;
  entityslug: string;
}

interface SectorEvidence {
  id: number;
  title: string;
  official: string;
  created_at: string;
  is_critical: number;
}

export default async function EntityProfilePage({ params }: { params: Promise<{ entityslug: string }> }) {
  const { entityslug } = await params;
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };

  const entity = await env.DB.prepare(
    "SELECT * FROM entities WHERE entityslug = ?"
  ).bind(entityslug).first<EntityProfile>();

  if (!entity) return notFound();

  const [actorsRes, evidenceRes] = await Promise.all([
    env.DB.prepare("SELECT * FROM actors WHERE entity_id = ? ORDER BY full_name ASC")
      .bind(entity.id)
      .all<AssociatedActor>(),
    env.DB.prepare("SELECT * FROM evidence WHERE sector = ? ORDER BY created_at DESC LIMIT 10")
      .bind(entity.sector)
      .all<SectorEvidence>()
  ]);

  const actors = actorsRes.results;
  const recentEvidence = evidenceRes.results;

  return (
    <main className="min-h-screen bg-black text-slate-300 font-mono">
      <header className="border-b border-[#4A90E2]/20 bg-slate-900/10 p-10 md:p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-7xl select-none uppercase">
          {entity.sector}
        </div>
        
        <div className="max-w-6xl mx-auto">
          <Link href="/codex" className="text-[10px] text-[#4A90E2] font-black uppercase tracking-[0.3em] mb-8 block hover:text-white transition-colors">
            {`\u2190 Return_To_Codex`}
          </Link>
          
          <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase mb-6 leading-none">
            {entity.name}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <p className="text-sm leading-relaxed text-slate-400 border-l border-slate-800 pl-6 py-2">
              {entity.description || "Institutional description pending administrative review."}
            </p>
            <div className="bg-slate-950 border border-slate-900 p-6">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest block mb-2">Network_Sector</span>
              <span className="text-xl font-black text-[#4A90E2] uppercase italic tracking-tighter">
                {entity.sector}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-10 md:p-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <section className="lg:col-span-2">
          <h2 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
            <span className="h-2 w-2 bg-red-600"></span>
            Recent_Sector_Activity
          </h2>
          
          <div className="space-y-4">
            {recentEvidence.map((log) => (
              <Link 
                key={log.id} 
                href={`/evidence/${log.id}`}
                className={`block border p-5 transition-all bg-slate-950/40 hover:translate-x-1 ${
                  log.is_critical ? 'border-red-900/50 hover:border-red-600' : 'border-slate-900 hover:border-[#4A90E2]/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                    {`${new Date(log.created_at).toLocaleDateString()} // ${log.official}`}
                  </span>
                  {log.is_critical === 1 && <span className="text-red-600 text-[8px] font-black animate-pulse">CRITICAL</span>}
                </div>
                <h3 className="text-sm font-bold text-slate-200 uppercase">{log.title}</h3>
              </Link>
            ))}
          </div>
        </section>

        <aside className="bg-slate-950/50 border-l border-slate-900 pl-8">
          <h2 className="text-xs font-black text-[#4A90E2] uppercase tracking-[0.4em] mb-10">
            Known_Personnel
          </h2>
          <div className="space-y-6">
            {actors.map((person) => (
              <Link key={person.id} href={`/archive/actor/${person.entityslug}`} className="block group">
                <h4 className="text-sm font-bold text-white group-hover:text-[#4A90E2] transition-colors uppercase tracking-tight">
                  {person.full_name}
                </h4>
                <p className="text-[10px] text-slate-600 uppercase italic mt-1 font-bold group-hover:text-slate-400">
                  {person.job_title}
                </p>
                <div className="mt-2 h-[1px] w-full bg-slate-900 group-hover:bg-[#4A90E2]/30 transition-all"></div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
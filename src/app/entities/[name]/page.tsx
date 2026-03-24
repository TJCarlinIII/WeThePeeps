export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import Link from "next/link";

interface EntityProfile {
  id: number;
  name: string;
  sector: string;
  description: string;
  slug: string;
}

interface AssociatedActor {
  id: number;
  full_name: string;
  job_title: string;
  status: string;
  slug: string;
}

interface SectorEvidence {
  id: number;
  title: string;
  official: string;
  created_at: string;
  isCritical: number;
}

export default async function EntityProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };

  // Attempt to match by slug or name depending on how the data was entered
  const entity = await env.DB.prepare(
    "SELECT * FROM entities WHERE slug = ? OR name = ?"
  ).bind(decodedSlug, decodedSlug).first<EntityProfile>();

  if (!entity) return notFound();

  const [actorsRes, evidenceRes] = await Promise.all([
    env.DB.prepare("SELECT * FROM actors WHERE entity_id = ? ORDER BY full_name ASC")
      .bind(entity.id)
      .all<AssociatedActor>(),
    // We match evidence to entity by sector or entity name, using the robust query logic
    env.DB.prepare("SELECT id, title, official, isCritical, created_at FROM evidence WHERE entity = ? OR sector = ? ORDER BY created_at DESC LIMIT 10")
      .bind(entity.name, entity.sector)
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
          <Link href="/entities" className="text-[10px] text-[#4A90E2] font-black uppercase tracking-[0.3em] mb-8 block hover:text-white transition-colors">
            {`\u2190 Return_To_Entities`}
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
            <span className="h-2 w-2 bg-[#4A90E2]"></span>
            Recent_Activity_Log ({recentEvidence.length})
          </h2>
          
          {recentEvidence.length === 0 ? (
            <div className="border border-dashed border-slate-800 p-20 text-center text-slate-600 text-xs uppercase font-mono">
              Zero_Linked_Incidents_Found
            </div>
          ) : (
            <div className="space-y-4">
              {recentEvidence.map((log) => (
                <Link 
                  key={log.id} 
                  href={`/evidence/${log.id}`}
                  className={`block border p-5 transition-all bg-slate-950/40 hover:translate-x-1 ${
                    log.isCritical ? 'border-red-900/50 hover:border-red-600' : 'border-slate-900 hover:border-[#4A90E2]/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                      {`${new Date(log.created_at).toLocaleDateString()} // ${log.official}`}
                    </span>
                    {log.isCritical === 1 && <span className="text-red-600 text-[8px] font-black animate-pulse">CRITICAL</span>}
                  </div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase">{log.title}</h3>
                </Link>
              ))}
            </div>
          )}
        </section>

        <aside className="bg-slate-950/50 border-l border-slate-900 pl-8">
          <h2 className="text-xs font-black text-[#4A90E2] uppercase tracking-[0.4em] mb-10">
            Known_Personnel
          </h2>
          {actors.length === 0 ? (
            <p className="text-xs text-slate-600 italic">No personnel on record.</p>
          ) : (
            <div className="space-y-6">
              {actors.map((person) => (
                <Link key={person.id} href={`/actors/${person.slug || encodeURIComponent(person.full_name)}`} className="block group">
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
          )}
        </aside>
      </div>
    </main>
  );
}
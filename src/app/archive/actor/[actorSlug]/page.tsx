export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import Link from "next/link";

interface ActorProfile {
  id: number;
  full_name: string;
  job_title: string;
  agency_name: string;
  status: string;
  bio: string;
}

interface AssociatedEvidence {
  id: number;
  title: string;
  content: string;
  created_at: string;
  is_critical: number;
}

export default async function SubjectProfile({ params }: { params: Promise<{ actorSlug: string }> }) {
  const { actorSlug } = await params;
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };

  const actor = await env.DB.prepare(
    "SELECT a.*, e.name as agency_name FROM actors a LEFT JOIN entities e ON a.entity_id = e.id WHERE a.slug = ?"
  ).bind(actorSlug).first<ActorProfile>();

  if (!actor) return notFound();

  const { results: evidence } = await env.DB.prepare(
    "SELECT id, title, content, created_at, is_critical FROM evidence WHERE official = ? ORDER BY created_at DESC"
  ).bind(actor.full_name).all<AssociatedEvidence>();

  return (
    <main className="min-h-screen bg-black text-slate-300 font-mono">
      <header className="border-b border-slate-900 bg-slate-950/50 p-8 md:p-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="bg-red-900/20 text-red-500 border border-red-900 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                {`Status: ${actor.status}`}
              </span>
              <span className="text-slate-600 text-[10px] font-bold uppercase tracking-tighter">
                {`UID: ${actor.id.toString().padStart(4, '0')}`}
              </span>
            </div>
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
              {actor.full_name}
            </h1>
            <p className="text-[#4A90E2] text-sm font-bold uppercase tracking-widest italic">
              {`${actor.job_title} // ${actor.agency_name || 'Independent_Actor'}`}
            </p>
          </div>
          
          <div className="border border-slate-800 p-4 bg-black w-full md:w-64">
            <h4 className="text-[9px] text-slate-500 font-black uppercase mb-2">Subject_Bio</h4>
            <p className="text-[11px] leading-relaxed italic text-slate-400">
              {actor.bio || "No historical narrative provided for this node."}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-8 md:p-16">
        <h2 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
          <span className="h-[1px] w-12 bg-[#4A90E2]"></span>
          Intelligence_Timeline
        </h2>

        <div className="space-y-12 relative border-l border-slate-900 pl-8 ml-2">
          {evidence.map((item) => (
            <div key={item.id} className="relative group">
              <div className={`absolute -left-[37px] top-1 w-4 h-4 rounded-full border-2 border-black transition-all ${
                item.is_critical ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-[#4A90E2]'
              }`} />
              
              <div className="bg-slate-950/30 border border-slate-900 p-6 group-hover:border-slate-700 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] text-slate-500 font-bold">
                    {new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  {item.is_critical === 1 && (
                    <span className="text-red-600 text-[9px] font-black uppercase tracking-widest">Critical_Violation</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed font-sans line-clamp-3 group-hover:line-clamp-none transition-all">
                  {item.content}
                </p>
                <Link 
                  href={`/evidence/${item.id}`} 
                  className="inline-block mt-6 text-[10px] font-black text-[#4A90E2] uppercase tracking-widest hover:text-white transition-colors"
                >
                  View_Full_Record &rarr;
                </Link>
              </div>
            </div>
          ))}

          {evidence.length === 0 && (
            <div className="text-slate-600 italic text-sm">
              No specific evidence records have been linked to this subject yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
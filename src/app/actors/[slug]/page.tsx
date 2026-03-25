export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import Link from "next/link";

interface ActorProfile {
  id: number;
  full_name: string;
  job_title: string;
  status: string;
  slug: string;
  entity_id: number;
  agency_name?: string;
  bio?: string;
  // Adding these for the schema
  official_website_url?: string;
  social_media_url?: string;
}

interface AssociatedEvidence {
  id: number;
  title: string;
  content: string;
  created_at: string;
  isCritical: number;
}

export default async function SubjectProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };

  const actor = await env.DB.prepare(`
    SELECT a.*, e.name as agency_name 
    FROM actors a 
    LEFT JOIN entities e ON a.entity_id = e.id 
    WHERE a.slug = ? OR a.full_name = ?
  `).bind(decodedSlug, decodedSlug).first<ActorProfile>();

  if (!actor) return notFound();

  const { results: evidence } = await env.DB.prepare(`
    SELECT 
      id, 
      title, 
      description AS content, 
      event_date AS created_at, 
      is_critical AS isCritical
    FROM incidents 
    WHERE actor_id = ? 
    ORDER BY event_date DESC
  `).bind(actor.id).all<AssociatedEvidence>();

  // --- SCHEMA GENERATION ---
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: actor.full_name,
    jobTitle: actor.job_title,
    affiliation: {
      '@type': 'Organization',
      name: actor.agency_name || 'Redford Township',
    },
    description: `Evidence-backed whistleblower report regarding ${actor.full_name}'s history and public records.`,
    url: `https://wethepeeps.net/actor/${actor.slug}`,
    sameAs: [
      actor.official_website_url,
      actor.social_media_url
    ].filter(Boolean) // This removes undefined links
  };

  return (
    <main className="min-h-screen bg-black text-slate-300 font-mono">
      {/* Injecting Schema into the page body */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-slate-900 bg-slate-950/50 p-8 md:p-16">
        <Link href="/actors" className="text-[#4A90E2] text-[10px] font-bold uppercase tracking-widest hover:underline mb-12 inline-block">
          &lt;&lt; Return_To_Personnel
        </Link>

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className={`border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                actor.status === 'active' ? 'bg-green-900/20 text-green-500 border-green-900' :
                actor.status === 'former' ? 'bg-slate-900/20 text-slate-500 border-slate-800' :
                'bg-red-900/20 text-red-500 border-red-900'
              }`}>
                {`Status: ${actor.status || 'Under Review'}`}
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
          Intelligence_Timeline ({evidence.length})
        </h2>

        <div className="space-y-12 relative border-l border-slate-900 pl-8 ml-2">
          {evidence.map((item) => (
            <div key={item.id} className="relative group">
              <div className={`absolute -left-[37px] top-1 w-4 h-4 rounded-full border-2 border-black transition-all ${
                item.isCritical ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-[#4A90E2]'
              }`} />
              
              <div className="bg-slate-950/30 border border-slate-900 p-6 group-hover:border-slate-700 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] text-slate-500 font-bold">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'UNKNOWN_DATE'}
                  </span>
                  {item.isCritical === 1 && (
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
            <div className="text-slate-600 italic text-sm border border-dashed border-slate-800 p-10 text-center uppercase tracking-widest font-bold">
              No specific evidence records have been linked to this subject yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
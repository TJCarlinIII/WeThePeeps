export const dynamic = "force-dynamic";

import React from 'react';
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface EvidenceRecord {
  id: number;
  title: string;
  official: string;
  is_critical: number;
  event_date: string;
}

interface Statute {
  id: number;
  title: string;
  slug: string;
  citation: string;
  summary: string;
  full_text?: string;
  seo_description?: string;
}

async function getStatuteData(slug: string) {
  const context = await getCloudflareContext({ async: true });
  const typedContext = (context as unknown) as { env: { DB: D1Database } };
  const db = typedContext.env.DB;

  const statute = await db.prepare("SELECT * FROM statutes WHERE slug = ?")
    .bind(slug)
    .first<Statute>();
  
  if (!statute) return null;

  const { results: incidents } = await db.prepare(`
    SELECT i.id, i.title, a.full_name as official, i.is_critical, i.event_date 
    FROM incidents i
    LEFT JOIN actors a ON i.actor_id = a.id
    WHERE i.statute_citations LIKE ? 
    ORDER BY i.event_date DESC
  `).bind(`%${statute.citation}%`).all() as { results: EvidenceRecord[] };

  return { statute, incidents };
}

export default async function StatuteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getStatuteData(slug);

  if (!data) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Legislation',
    name: data.statute.title,
    identifier: data.statute.citation,
    jurisdiction: 'Michigan, USA',
    description: data.statute.seo_description || data.statute.summary,
    url: `https://wethepeeps.net/statutes/${data.statute.slug}`,
    citation: data.incidents.map(item => ({
      '@type': 'CreativeWork',
      headline: item.title,
      url: `https://wethepeeps.net/evidence/${item.id}`
    }))
  };

  return (
    <div className="min-h-screen bg-black p-8 md:p-20 font-sans text-slate-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto">
        <Link href="/statutes" className="text-[#4A90E2] font-mono text-[10px] font-bold uppercase tracking-widest hover:underline mb-8 inline-block">
          &lt;&lt; Back_To_Registry
        </Link>

        <header className="mb-12 border-b border-slate-900 pb-10">
          <span className="text-[#4A90E2] font-mono text-[10px] font-bold tracking-[0.4em] uppercase block mb-2">
            Statutory_Reference // {data.statute.citation}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
            {data.statute.title}
          </h1>
          <div className="mt-8 p-6 bg-slate-900/30 border-l-4 border-[#4A90E2] rounded-r-lg">
             <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Legal_Summary</h2>
             {/* FIXED: Escaped the quotation marks for ESLint */}
             <p className="text-lg text-white leading-relaxed font-light italic">
               &ldquo;{data.statute.summary}&rdquo;
             </p>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-8 flex items-center">
              <span className="w-8 h-[1px] bg-slate-800 mr-4"></span>
              Documented_Violations ({data.incidents.length})
            </h3>
            
            <div className="grid gap-4">
              {data.incidents.map((item) => (
                <Link 
                  key={item.id} 
                  href={`/evidence/${item.id}`} 
                  className="group block p-6 border border-slate-900 bg-slate-950 hover:border-[#4A90E2]/40 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest block mb-1">Subject: {item.official || 'Unknown_Actor'}</span>
                      <h4 className="text-white text-xl font-bold group-hover:text-[#4A90E2] transition-colors uppercase italic">{item.title}</h4>
                    </div>
                    {item.is_critical === 1 && (
                       <span className="bg-red-900/20 text-red-500 text-[8px] px-2 py-1 font-bold border border-red-900/30 uppercase tracking-tighter">Critical</span>
                    )}
                  </div>
                  <div className="mt-6 flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-600">{item.event_date}</span>
                    <span className="text-[#4A90E2] uppercase font-black opacity-0 group-hover:opacity-100 transition-opacity">View_Evidence_File →</span>
                  </div>
                </Link>
              ))}
            </div>

            {data.incidents.length === 0 && (
              <div className="p-20 border border-dashed border-slate-800 text-center text-slate-600 font-mono text-xs uppercase tracking-widest bg-slate-900/10">
                Zero_Active_Records_For_This_Statute
              </div>
            )}
          </div>

          <aside className="space-y-10">
            <div>
              <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Action_Protocol</h3>
              <div className="space-y-4">
                 <button className="w-full py-4 bg-[#4A90E2] text-black font-black text-xs uppercase tracking-widest hover:bg-white transition-colors">
                   Report_A_Violation
                 </button>
                 <button className="w-full py-4 border border-slate-800 text-white font-black text-xs uppercase tracking-widest hover:border-[#4A90E2] transition-colors">
                   Download_PDF_Brief
                 </button>
              </div>
            </div>

            <div className="p-6 border border-slate-900 bg-slate-900/20">
              <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Authority_Links</h3>
              {/* FIXED: Removed cursor-pointer because it conflicted with cursor-not-allowed */}
              <ul className="space-y-3 text-[11px] font-mono text-slate-400">
                <li className="hover:text-[#4A90E2] cursor-not-allowed">→ MI Legislative Website (Link Pending)</li>
                <li className="hover:text-[#4A90E2] cursor-not-allowed">→ Filing a MDCR Complaint</li>
                <li className="hover:text-[#4A90E2] cursor-not-allowed">→ LARA Licensing Verification</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
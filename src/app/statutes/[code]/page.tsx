export const dynamic = "force-dynamic";

import React from 'react';
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface EvidenceRecord {
  id: number;
  title: string;
  official: string;
  isCritical: number;
  created_at: string;
}

interface Statute {
  code: string;
  description?: string;
}

async function getStatuteData(code: string) {
  const decodedCode = decodeURIComponent(code);
  const context = await getCloudflareContext({ async: true });
  const typedContext = (context as unknown) as { env: { DB: D1Database } };
  const db = typedContext.env.DB;

  const statute = await db.prepare("SELECT * FROM statutes WHERE code = ?")
    .bind(decodedCode)
    .first<Statute>();
  
  if (!statute) return null;

  // Note: Using 'incidents' table to match your recent database refactor
  const { results: incidents } = await db.prepare(`
    SELECT i.id, i.title, a.full_name as official, i.is_critical as isCritical, i.event_date as created_at 
    FROM incidents i
    LEFT JOIN actors a ON i.actor_id = a.id
    WHERE i.statute_citations LIKE ? 
    ORDER BY i.event_date DESC
  `).bind(`%${decodedCode}%`).all() as { results: EvidenceRecord[] };

  return { statute, incidents };
}

export default async function StatuteDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getStatuteData(code);

  if (!data) notFound();

  // --- SCHEMA GENERATION ---
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Legislation',
    name: `MCL ${data.statute.code}`,
    identifier: data.statute.code,
    jurisdiction: 'Michigan, USA',
    description: `Public record of incidents and accountability reports citing Michigan Compiled Law ${data.statute.code}.`,
    url: `https://wethepeeps.net/statutes/${encodeURIComponent(data.statute.code)}`,
    // Link the incidents as creative works that cite this legislation
    citation: data.incidents.map(item => ({
      '@type': 'CreativeWork',
      headline: item.title,
      url: `https://wethepeeps.net/evidence/${item.id}`
    }))
  };

  return (
    <div className="min-h-screen bg-black p-8 md:p-20 font-sans">
      {/* STRUCTURED DATA INJECTION */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto">
        <Link href="/statutes" className="text-[#4A90E2] font-mono text-[10px] font-bold uppercase tracking-widest hover:underline mb-8 inline-block">
          &lt;&lt; Back_To_Codex
        </Link>

        <header className="mb-16 border-b border-slate-900 pb-10">
          <span className="text-[#4A90E2] font-mono text-[10px] font-bold tracking-[0.4em] uppercase block">Statute_Reference</span>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter mt-2">{data.statute.code}</h1>
          <p className="text-slate-500 mt-6 max-w-2xl text-sm leading-relaxed uppercase tracking-tight">
            Comprehensive log of documented incidents and evidence files citing 
            this specific section of the Michigan Compiled Laws.
          </p>
        </header>

        <section>
          <div className="flex justify-between items-end mb-8 border-l-2 border-slate-800 pl-4">
            <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.3em]">
              Documented_Violations ({data.incidents.length})
            </h3>
          </div>
          
          <div className="grid gap-4">
            {data.incidents.map((item) => (
              <Link 
                key={item.id} 
                href={`/evidence/${item.id}`} 
                className="group flex flex-col md:flex-row md:items-center justify-between p-6 border border-slate-900 bg-slate-900/5 hover:border-[#4A90E2]/40 transition-all hover:bg-[#4A90E2]/5"
              >
                <div>
                  <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest block mb-1">Subject: {item.official || 'Unknown_Actor'}</span>
                  <h4 className="text-white text-lg font-bold group-hover:text-[#4A90E2] transition-colors uppercase tracking-tight">{item.title}</h4>
                </div>
                <div className="mt-4 md:mt-0 text-left md:text-right border-t md:border-t-0 border-slate-900 pt-4 md:pt-0">
                  <div className="text-[10px] text-slate-600 font-mono mb-1">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'DATE_UNAVAILABLE'}
                  </div>
                  <span className="text-[#4A90E2] text-[10px] font-black uppercase italic group-hover:translate-x-1 transition-transform inline-block">
                    View_File_Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {data.incidents.length === 0 && (
            <div className="p-20 border border-dashed border-slate-800 text-center text-slate-600 font-mono text-xs uppercase tracking-widest">
              Zero_Active_Records_For_This_Statute
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
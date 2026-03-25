export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface EvidenceDetail {
  id: number;
  title: string;
  official: string;
  statute: string;
  sector: string;
  content: string;
  fileUrl: string;
  isCritical: number;
  created_at: string;
}

interface CloudflareEnv {
  DB: D1Database;
}

export default async function EvidenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as CloudflareEnv;

  const evidence = await env.DB.prepare(`
    SELECT 
      i.id, 
      i.title, 
      i.description as content,
      a.full_name AS official, 
      st.citation AS statute,
      s.name AS sector, 
      i.is_critical AS isCritical, 
      i.event_date AS created_at,
      m.file_path as fileUrl
    FROM incidents i
    LEFT JOIN actors a ON i.actor_id = a.id
    LEFT JOIN entities e ON i.entity_id = e.id
    LEFT JOIN sectors s ON e.sector_id = s.id
    LEFT JOIN statutes st ON i.statute_id = st.id
    LEFT JOIN media m ON m.incident_id = i.id
    WHERE i.id = ?
  `).bind(id).first<EvidenceDetail>();

  if (!evidence) notFound();

  // --- SCHEMA GENERATION ---
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Report',
    headline: evidence.title,
    author: {
      '@type': 'Organization',
      name: 'We The Peeps',
    },
    datePublished: evidence.created_at,
    description: evidence.content?.substring(0, 160),
    about: {
      '@type': 'Person',
      name: evidence.official
    },
    associatedMedia: evidence.fileUrl ? {
      '@type': 'MediaObject',
      contentUrl: evidence.fileUrl
    } : undefined
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 md:p-20 font-mono">
      {/* STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto">
        <Link href="/evidence" className="text-[#4A90E2] text-[10px] font-bold uppercase tracking-widest hover:underline mb-12 inline-block">
          &lt;&lt; Return_To_Manifest
        </Link>

        <article className="border border-slate-900 bg-slate-900/10 p-8 md:p-12 relative overflow-hidden">
          {evidence.isCritical === 1 && (
            <div className="absolute top-0 right-0 bg-red-600 text-black px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
              High_Priority_Record
            </div>
          )}

          <header className="mb-10">
            <div className="flex gap-4 mb-4">
              <span className="bg-[#4A90E2]/10 text-[#4A90E2] text-[10px] px-3 py-1 font-bold border border-[#4A90E2]/20 uppercase">
                {evidence.sector || "Unknown Sector"}
              </span>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-3 py-1 font-bold uppercase">
                Statute: {evidence.statute || "Unclassified"}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight italic text-white">
              {evidence.title}
            </h1>
            <div className="mt-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
              Subject: <span className="text-white">{evidence.official || "Unidentified"}</span> | Entered: {evidence.created_at ? new Date(evidence.created_at).toLocaleDateString() : "Date Pending"}
            </div>
          </header>

          <div className="prose prose-invert max-w-none mb-12">
            <p className="text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
              {evidence.content || "No narrative provided."}
            </p>
          </div>

          {evidence.fileUrl && (
            <div className="border-t border-slate-800 pt-8">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-4 italic">Supporting_Media</h3>
              <a 
                href={evidence.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 bg-white text-black px-6 py-4 text-xs font-black uppercase tracking-widest hover:bg-[#4A90E2] hover:text-white transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                Download_Evidence_File
                <span className="text-[14px]">→</span>
              </a>
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
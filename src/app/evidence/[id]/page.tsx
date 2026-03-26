export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSocialShareUrl, linkifyEntities } from "@/lib/utils";

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
}

interface CloudflareEnv {
  DB: D1Database;
}

export default async function EvidenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as CloudflareEnv;

  // 1. Fetch the main evidence record with tags
  // 2. Fetch all actors to pass into linkifyEntities
  const [evidenceRes, actorsRes] = await Promise.all([
    env.DB.prepare(`
      SELECT 
        i.*, 
        i.description as content,
        a.full_name AS official, 
        st.citation AS statute,
        s.name AS sector, 
        m.file_path as fileUrl
      FROM incidents i
      LEFT JOIN actors a ON i.actor_id = a.id
      LEFT JOIN entities e ON i.entity_id = e.id
      LEFT JOIN sectors s ON e.sector_id = s.id
      LEFT JOIN statutes st ON i.statute_id = st.id
      LEFT JOIN media m ON m.incident_id = i.id
      WHERE i.id = ?
    `).bind(id).first<EvidenceDetail>(),
    env.DB.prepare("SELECT full_name as name, slug FROM actors").all()
  ]);

  if (!evidenceRes) notFound();

  const actors = actorsRes.results as { name: string, slug: string }[];
  const shareUrl = `https://wethepeeps.net/evidence/${evidenceRes.id}`;

  // --- SCHEMA GENERATION ---
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Report',
    headline: evidenceRes.title,
    datePublished: evidenceRes.event_date,
    author: { '@type': 'Organization', name: 'We The Peeps' },
    about: { '@type': 'Person', name: evidenceRes.official },
    description: evidenceRes.content?.substring(0, 160)
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 md:p-20 font-mono">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto">
        <Link href="/evidence" className="text-[#4A90E2] text-[10px] font-bold uppercase tracking-widest hover:underline mb-12 inline-block">
          &lt;&lt; Return_To_Manifest
        </Link>

        <article className="border border-slate-900 bg-slate-900/10 p-8 md:p-12 relative overflow-hidden">
          {evidenceRes.is_critical === 1 && (
            <div className="absolute top-0 right-0 bg-red-600 text-black px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
              High_Priority_Record
            </div>
          )}

          <header className="mb-10">
            <div className="flex gap-4 mb-4">
              <span className="bg-[#4A90E2]/10 text-[#4A90E2] text-[10px] px-3 py-1 font-bold border border-[#4A90E2]/20 uppercase">
                {evidenceRes.sector || "Unknown Sector"}
              </span>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-3 py-1 font-bold uppercase">
                Statute: {evidenceRes.statute || "Unclassified"}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight italic text-white">
              {evidenceRes.title}
            </h1>
            <div className="mt-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
              Subject: <span className="text-white">{evidenceRes.official || "Unidentified"}</span> | Entered: {evidenceRes.event_date ? new Date(evidenceRes.event_date).toLocaleDateString() : "Date Pending"}
            </div>
          </header>

          <div className="prose prose-invert max-w-none mb-12 text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
            {/* Dynamic Linkify: This turns names in your text into links automatically */}
            <div dangerouslySetInnerHTML={{ __html: linkifyEntities(evidenceRes.content, actors) }} />
          </div>

          {evidenceRes.fileUrl && (
            <div className="border-t border-slate-800 pt-8 mb-12">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-4 italic">Supporting_Media</h3>
              <a 
                href={evidenceRes.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 bg-white text-black px-6 py-4 text-xs font-black uppercase tracking-widest hover:bg-[#4A90E2] hover:text-white transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                Download_Evidence_File
                <span className="text-[14px]">→</span>
              </a>
            </div>
          )}

          {/* DISTRIBUTION SECTION */}
          <div className="mt-16 pt-8 border-t border-white/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4A90E2] mb-2">
                  Distribute_Evidence
                </h4>
                <p className="text-xs text-slate-500 italic">One click to broadcast this record to the public cloud.</p>
              </div>

              <div className="flex gap-4">
                <a 
                  href={getSocialShareUrl('x', { 
                      title: evidenceRes.title, 
                      url: shareUrl, 
                      tags: evidenceRes.tags 
                  })}
                  target="_blank"
                  className="bg-white text-black px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#4A90E2] hover:text-white transition-all"
                >
                  Share_On_X
                </a>

                <a 
                  href={getSocialShareUrl('fb', { 
                      title: evidenceRes.title, 
                      url: shareUrl 
                  })}
                  target="_blank"
                  className="border border-slate-800 text-slate-400 px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
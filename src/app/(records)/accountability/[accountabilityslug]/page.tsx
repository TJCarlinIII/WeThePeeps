export const dynamic = "force-dynamic";

import { notFound } from 'next/navigation';
import { linkifyEntities } from '@/lib/utils';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import Link from 'next/link';
import { ShieldAlert, ChevronRight } from 'lucide-react'; // ✅ ADDED: Icons for new design

interface CloudflareEnv {
  DB: D1Database;
}

interface Subject {
  id: number;
  full_name: string;
  slug: string;
  job_title: string;
  org_name: string;
  // Added for Schema
  official_website_url?: string;
}

interface EvidenceItem {
  id: number;
  title: string;
  description: string;
  event_date: string;
  is_critical: number;
}

interface PageProps {
  params: Promise<{ accountabilityslug: string }>;
}

async function getDossierData(accountabilityslug: string) {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as CloudflareEnv;
  const db = env.DB;

  if (!db) {
    console.error("D1 Database binding 'DB' not found.");
    return null;
  }

  const subject = await db.prepare(`
    SELECT a.*, e.name as org_name 
    FROM actors a 
    LEFT JOIN entities e ON a.entity_id = e.id 
    WHERE a.slug = ?
  `).bind(accountabilityslug).first<Subject>();

  if (!subject) return null;

  const { results: evidence } = await db.prepare(`
    SELECT * FROM incidents 
    WHERE actor_id = ? 
    ORDER BY event_date DESC
  `).bind(subject.id).all<EvidenceItem>();

  return { subject, evidence };
}

export default async function DossierProfile({ params }: PageProps) {
  const { accountabilityslug } = await params;
  const data = await getDossierData(accountabilityslug);

  if (!data) notFound();

  const { subject, evidence } = data;

  // --- SCHEMA GENERATION ---
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: subject.full_name,
    jobTitle: subject.job_title,
    affiliation: {
      '@type': 'Organization',
      name: subject.org_name || 'Redford Township',
    },
    identifier: `WTP-REF-${subject.id.toString().padStart(4, '0')}`,
    url: `https://wethepeeps.net/accountability/${subject.slug}`,
    sameAs: subject.official_website_url ? [subject.official_website_url] : [],
    subjectOf: evidence.map(item => ({
      '@type': 'Report',
      headline: item.title,
      datePublished: item.event_date,
      description: item.description.substring(0, 160), // Short snippet for Google
    }))
  };

  return (
    <div className="py-12 max-w-5xl mx-auto">
      {/* STRUCTURED DATA INJECTION */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Profile Header Block */}
      <div className="relative border border-slate-800 bg-slate-950/40 backdrop-blur-sm p-8 md:p-12 mb-12">
        {/* Dossier Corner Stamp */}
        <div className="absolute top-0 right-0 p-4 border-l border-b border-slate-800 bg-slate-900/20">
          <span className="font-mono text-[9px] text-slate-600 tracking-tighter uppercase block">Ref_ID</span>
          <span className="font-mono text-xs text-[#4A90E2] font-bold">WTP-MI-{subject.id.toString().padStart(4, '0')}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-[#4A90E2]/10 border border-[#4A90E2]/30 text-[#4A90E2] text-[10px] font-black uppercase tracking-[0.3em]">
              OFFICIAL_PERSONNEL_FILE
            </span>
            <h1 className="text-5xl font-black tracking-tighter uppercase text-white leading-none">
              {subject.full_name}
            </h1>
            <div className="flex items-center gap-4 text-slate-500 font-mono text-xs uppercase tracking-widest">
              <span>{subject.job_title}</span>
              <span className="w-1 h-1 bg-slate-700 rounded-full" />
              <span className="text-[#D4AF37]">{subject.org_name || "AGENCY_UNKNOWN"}</span>
            </div>
          </div>
          
          <div className="w-full md:w-auto min-w-[200px] border-l-2 border-red-600 pl-6 py-2 bg-red-950/5">
            <span className="text-[9px] text-red-900 block uppercase font-black tracking-widest mb-1">Current_Case_Status</span>
            <span className="text-red-500 font-black uppercase tracking-[0.1em] text-lg">Under_Investigation</span>
          </div>
        </div>
      </div>

      {/* Evidence Section */}
      <section className="space-y-12">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="font-mono text-xs font-black text-[#4A90E2] tracking-[0.4em] uppercase whitespace-nowrap">
            Chain_of_Evidence
          </h2>
          <div className="h-[1px] w-full bg-slate-900" />
        </div>

        {evidence.length === 0 ? (
          <div className="border border-dashed border-slate-800 p-12 text-center">
            <p className="text-slate-600 font-mono text-xs uppercase italic tracking-widest">Archive_is_currently_empty</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {evidence.map((item: EvidenceItem) => (
              <div key={item.id} className="group relative border border-slate-900 bg-slate-950/20 p-8 hover:border-slate-700 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <h3 className="text-2xl font-bold text-slate-200 group-hover:text-[#4A90E2] transition-colors leading-tight">
                    {item.title}
                  </h3>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-mono text-[9px] text-slate-700 uppercase">Event_Timestamp</span>
                    <time className="font-mono text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                      {item.event_date ? new Date(item.event_date).toLocaleDateString() : "PENDING"}
                    </time>
                  </div>
                </div>

                <div 
                  className="text-slate-400 leading-relaxed font-serif text-base max-w-4xl"
                  dangerouslySetInnerHTML={{ __html: linkifyEntities(item.description) }}
                />

                {item.is_critical === 1 && (
                  <div className="mt-8 flex items-center gap-3">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span className="text-red-500 font-mono text-[10px] font-black uppercase tracking-[0.2em]">
                      CRITICAL_NEGLECT_FLAG
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Pagination / Return Nav */}
      <div className="mt-20 border-t border-slate-900 pt-8 flex justify-between items-center">
         <Link href="/accountability" className="flex items-center gap-2 font-mono text-[10px] text-slate-600 hover:text-white uppercase tracking-widest transition-all">
           <ChevronRight className="w-4 h-4 rotate-180" /> Back_to_Registry
         </Link>
         <span className="font-mono text-[10px] text-slate-800 uppercase tracking-widest">Ref_Node: 0x932...</span>
      </div>
    </div>
  );
}
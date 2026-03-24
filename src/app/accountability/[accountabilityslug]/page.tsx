export const dynamic = "force-dynamic";

import { notFound } from 'next/navigation';
import { linkifyEntities } from '@/lib/utils';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface CloudflareEnv {
  DB: D1Database;
}

interface Subject {
  id: number;
  name: string;
  accountabilityslug: string;
  role: string;
  org_name: string;
}

interface EvidenceItem {
  id: number;
  title: string;
  content: string;
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
    SELECT s.*, o.name as org_name, o.org_type 
    FROM subjects s 
    LEFT JOIN organizations o ON s.organization_id = o.id 
    WHERE s.accountabilityslug = ?
  `).bind(accountabilityslug).first<Subject>();

  if (!subject) return null;

  const { results: evidence } = await db.prepare(`
    SELECT * FROM evidence_items 
    WHERE subject_id = ? 
    ORDER BY event_date DESC
  `).bind(subject.id).all<EvidenceItem>();

  return { subject, evidence };
}

export default async function DossierProfile({ params }: PageProps) {
  const { accountabilityslug } = await params;
  const data = await getDossierData(accountabilityslug);

  if (!data) notFound();

  const { subject, evidence } = data;

  return (
    <div className="min-h-screen bg-black text-white font-mono p-4 md:p-12">
      <div className="max-w-5xl mx-auto border border-[#4A90E2]/20 bg-slate-900/10 p-6 md:p-10 rounded-sm shadow-2xl">
        
        <header className="border-b border-[#4A90E2]/40 pb-8 mb-12 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <span className="text-[10px] text-[#4A90E2] tracking-[0.4em] uppercase block mb-2 font-bold">
              Personnel_File // {subject.org_name}
            </span>
            <h1 className="text-4xl font-bold tracking-tighter uppercase text-white">{subject.name}</h1>
            <p className="text-slate-400 mt-2 text-sm italic">{subject.role}</p>
          </div>
          <div className="bg-[#4A90E2]/10 border border-[#4A90E2]/30 p-4 text-right shadow-[0_0_15px_rgba(74,144,226,0.1)]">
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest">Status</span>
            <span className="text-red-500 font-bold uppercase tracking-widest text-xs">Under Investigation</span>
          </div>
        </header>

        <section className="space-y-12">
          <h2 className="text-xs font-bold text-[#4A90E2] tracking-[0.3em] uppercase border-l-2 border-[#4A90E2] pl-4 mb-8">
            Documented_Evidence_Chain
          </h2>

          {evidence.length === 0 ? (
            <p className="text-slate-600 italic py-10">No evidence items committed to this file yet.</p>
          ) : (
            evidence.map((item: EvidenceItem) => (
              <div key={item.id} className="relative pl-8 border-l border-slate-800 pb-12 group">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-700 group-hover:bg-[#4A90E2] transition-colors" />
                
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                  <h3 className="text-xl font-bold text-slate-200 group-hover:text-white underline decoration-[#4A90E2]/30">
                    {item.title}
                  </h3>
                  <time className="text-[10px] text-slate-500 font-bold bg-slate-900 border border-slate-800 px-2 py-1 h-fit">
                    {new Date(item.event_date).toLocaleDateString()}
                  </time>
                </div>

                <div 
                  className="text-slate-400 leading-relaxed text-sm prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: linkifyEntities(item.content) }}
                />

                {item.is_critical === 1 && (
                  <div className="mt-4 inline-block border border-red-900/50 bg-red-950/20 text-red-500 text-[9px] px-2 py-1 font-bold uppercase tracking-widest">
                    Critical_Evidence_Flag
                  </div>
                )}
              </div>
            ))
          )}
        </section>

        <footer className="mt-20 pt-8 border-t border-slate-800 flex justify-between items-center">
          <button className="text-[10px] text-slate-500 hover:text-[#4A90E2] transition-colors uppercase tracking-widest font-bold">
            ← Return to Registry
          </button>
          <span className="text-[9px] text-slate-700 font-bold">WTP_ARCHIVE_VER_2.1</span>
        </footer>
      </div>
    </div>
  );
}
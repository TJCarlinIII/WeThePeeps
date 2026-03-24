// Using force-dynamic to ensure OpenNext handles the Cloudflare context correctly
export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import Link from "next/link";

interface EvidenceRecord {
  id: number;
  title: string;
  content: string;
  official: string;
  sector: string;
  is_critical: number;
  created_at: string;
}

export default async function EvidenceDetailPage({ params }: { params: { id: string } }) {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };

  // Fetch the specific record by ID
  const record = await env.DB.prepare(
    "SELECT * FROM evidence WHERE id = ?"
  ).bind(params.id).first<EvidenceRecord>();

  if (!record) return notFound();

  return (
    <main className="min-h-screen bg-black text-slate-300 font-mono p-6 md:p-12 lg:p-20">
      <div className="max-w-4xl mx-auto">
        
        {/* TOP NAVIGATION / STATUS */}
        <nav className="flex justify-between items-center mb-12 pb-6 border-b border-slate-900">
          <Link href="/codex" className="text-[10px] text-[#4A90E2] font-black uppercase tracking-[0.3em] hover:text-white transition-colors">
            {`\u2190 Back_To_Archive`}
          </Link>
          <div className="flex gap-4">
             <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              {`Log_ID: ${record.id.toString().padStart(5, '0')}`}
            </span>
            {record.is_critical === 1 && (
              <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                [High_Priority_Violation]
              </span>
            )}
          </div>
        </nav>

        {/* HEADER: TITLE & CORE METADATA */}
        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-8 leading-tight">
            {record.title}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-slate-900 p-6 bg-slate-950/20">
            <div>
              <label className="text-[9px] text-slate-600 font-black uppercase tracking-widest block mb-1">Involved_Official</label>
              <span className="text-sm text-white font-bold uppercase">{record.official}</span>
            </div>
            <div>
              <label className="text-[9px] text-slate-600 font-black uppercase tracking-widest block mb-1">Intelligence_Sector</label>
              <span className="text-sm text-[#4A90E2] font-bold uppercase">{record.sector}</span>
            </div>
            <div>
              <label className="text-[9px] text-slate-600 font-black uppercase tracking-widest block mb-1">Timestamp</label>
              <span className="text-sm text-slate-400 font-bold">
                {new Date(record.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </header>

        {/* THE NARRATIVE BODY */}
        <article className="prose prose-invert prose-slate max-w-none">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] flex-grow bg-slate-900"></div>
            <span className="text-[10px] text-slate-700 font-black uppercase tracking-[0.5em]">Begin_Manifest</span>
            <div className="h-[1px] flex-grow bg-slate-900"></div>
          </div>

          {/* We use whitespace-pre-wrap to respect the line breaks from your textareas */}
          <div className="text-lg leading-relaxed text-slate-300 font-sans whitespace-pre-wrap space-y-6">
            {record.content}
          </div>

          <div className="flex items-center gap-4 mt-16">
            <div className="h-[1px] flex-grow bg-slate-900"></div>
            <span className="text-[10px] text-slate-700 font-black uppercase tracking-[0.5em]">End_Of_Record</span>
            <div className="h-[1px] flex-grow bg-slate-900"></div>
          </div>
        </article>

        {/* FOOTER ACTION */}
        <footer className="mt-20 pt-10 border-t border-slate-900 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-6">
            This information is part of the public record under the We The Peeps transparency protocol.
          </p>
          <button 
            onClick={() => window.print()}
            className="text-[10px] border border-slate-800 px-6 py-3 hover:bg-white hover:text-black transition-all font-black uppercase tracking-widest"
          >
            Generate_Physical_Copy (Print)
          </button>
        </footer>
      </div>
    </main>
  );
}
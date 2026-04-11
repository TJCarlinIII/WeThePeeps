export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import StatuteSearch from './StatuteSearch';
import { Scale } from 'lucide-react';
import type { D1Database } from "@cloudflare/workers-types";

interface Statute {
  id: number;
  citation: string;
  title: string;
  slug: string;
  violation_count: number;
}

export default async function StatutesPage() {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };

  // This query fetches the statutes and counts occurrences in the incidents table
  // based on the 'statute_citations' string field.
  const { results: statutes } = await env.DB.prepare(`
    SELECT 
      s.id, 
      s.citation, 
      s.title, 
      s.slug,
      (SELECT COUNT(*) FROM incidents WHERE statute_citations LIKE '%' || s.citation || '%') as violation_count
    FROM statutes s
    ORDER BY s.citation ASC
  `).all();

  return (
    <div className="py-12">
      <header className="mb-16 border-l-4 border-[#4A90E2] pl-8 relative">
        <div className="absolute -left-[4px] top-0 h-full w-1 bg-[#D4AF37] opacity-50 blur-sm"></div>
        
        <div className="flex items-center gap-3 mb-2">
          <Scale className="w-4 h-4 text-[#4A90E2]" />
          <span className="font-mono text-[10px] text-[#4A90E2] font-black uppercase tracking-[0.4em]">
            Legal_Framework: Michigan_Compiled_Laws
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase mb-4 italic">
          Statutory <span className="text-[#D4AF37]">Registry</span>
        </h1>
        
        <p className="max-w-2xl text-slate-500 text-sm font-light leading-relaxed border-t border-slate-900 pt-4">
          A searchable index of legislative codes cited in active investigations. 
          Cross-referenced with documented government and private sector incidents.
        </p>
      </header>

      <StatuteSearch initialStatutes={(statutes as unknown as Statute[]) || []} />
      
      <footer className="mt-20 pt-8 border-t border-slate-900 text-[10px] font-mono text-slate-700 uppercase tracking-[0.2em]">
        Reference_System_v1.0 // Real-time Cross-referencing Enabled
      </footer>
    </div>
  );
}
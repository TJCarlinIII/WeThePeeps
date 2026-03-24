export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from 'next/link';

interface SectorEvidence {
  id: number;
  title: string;
  official: string;
  statute: string;
  sector: string;
  content: string;
  isCritical: number;
}

export default async function SectorDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };

  // Adjusted query to pull incident records matching the sector
  const { results } = await env.DB.prepare(`
    SELECT 
      i.id, 
      i.title, 
      a.full_name as official, 
      st.citation as statute, 
      s.name as sector, 
      i.description as content, 
      i.is_critical as isCritical
    FROM incidents i
    LEFT JOIN actors a ON i.actor_id = a.id
    LEFT JOIN entities e ON i.entity_id = e.id
    LEFT JOIN sectors s ON e.sector_id = s.id
    LEFT JOIN statutes st ON i.statute_id = st.id
    WHERE s.name = ? OR s.slug = ?
    ORDER BY i.id DESC
  `).bind(decodedName, decodedName).all();
  
  const evidence = results as unknown as SectorEvidence[];

  return (
    <main className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-5xl mx-auto">
        <Link href="/sectors" className="text-[#4A90E2] text-[10px] font-bold uppercase tracking-widest hover:underline">
          &lt; Return_To_Index
        </Link>
        
        <header className="mt-8 mb-12 flex justify-between items-end border-b border-slate-900 pb-8">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter">{decodedName}</h1>
            <p className="text-slate-500 text-xs mt-2 uppercase">Dataset: Sector_Analysis_{decodedName.replace(/\s+/g, '_')}</p>
          </div>
        </header>

        {evidence.length === 0 ? (
          <div className="border border-dashed border-slate-800 p-20 text-center">
            <p className="text-slate-600 uppercase text-xs font-bold tracking-[0.2em]">No_Data_Found_In_This_Sector</p>
          </div>
        ) : (
          <div className="space-y-4">
            {evidence.map((item: SectorEvidence) => (
              <div key={item.id} className="border border-slate-900 bg-slate-900/5 p-6 hover:bg-slate-900/20 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold uppercase">{item.title}</h2>
                  {item.isCritical === 1 && (
                    <span className="bg-red-900/20 text-red-500 text-[10px] px-2 py-1 font-black uppercase tracking-tighter border border-red-900/50">
                      CRITICAL
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm mb-6 font-sans line-clamp-3 leading-relaxed">
                  {item.content}
                </p>
                <div className="flex gap-4 text-[10px] font-bold uppercase">
                  <span className="text-[#4A90E2]">Actor: {item.official || 'Unidentified'}</span>
                  <span className="text-slate-600">Statute: {item.statute || 'Unclassified'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
export const dynamic = "force-dynamic";

import Logo from '@/components/ui/logo';
import Link from 'next/link';
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface EntityNode {
  name: string;
  slug: string;
  sector: string;
}

export default async function LandingPage() {
  let randomEntities: EntityNode[] = [];
  
  try {
    const context = await getCloudflareContext({ async: true });
    const env = (context.env as unknown) as { DB: D1Database };
    const { results } = await env.DB.prepare(
      "SELECT name, slug, sector FROM entities ORDER BY RANDOM() LIMIT 9"
    ).all();
    randomEntities = (results as unknown as EntityNode[]) || [];
  } catch (e) { console.error(e); }

  return (
    <div className="min-h-screen bg-black text-slate-300 font-mono flex flex-col items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <main className="relative z-10 max-w-4xl w-full text-center flex flex-col items-center">
        
        {/* TOP HOOK - REVISED FOR POLICY FOCUS */}
        <div className="mb-8 space-y-3">
          <h1 className="text-xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-tight">
            How Michigan&apos;s policies can turn a <br className="hidden md:block" />
            medical emergency into extreme violence.
          </h1>
          <div className="h-px w-24 bg-red-600/50 mx-auto" />
        </div>

        {/* LOGO & REFINED SEAL */}
        <div className="flex flex-col items-center my-6 space-y-4 w-full">
          <Logo size="text-6xl md:text-8xl" />
          
          <div className="w-full max-w-2xl flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-[#C5B358]/30" /> 
            
            <span 
              className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] italic whitespace-nowrap"
              style={{ color: '#C5B358' }}
            >
              Life, Liberty, & The Pursuit of Happiness
            </span>
            
            <div className="flex-1 h-[1px] bg-[#C5B358]/30" />
          </div>

          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.6em] text-white/40">
            Shall Not Be Infringed
          </span>
        </div>

        {/* NARRATIVE CONTEXT */}
        <p className="max-w-xl text-slate-500 text-[10px] md:text-xs uppercase tracking-[0.2em] leading-relaxed mb-10">
          An archive of public records documenting the 
          <span className="text-white font-black mx-1 italic">escalation of force</span> 
          against those seeking emergency assistance.
        </p>

        {/* DYNAMIC DATABASE BOXES */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          {randomEntities.length > 0 ? (
            randomEntities.map((entity) => (
              <Link 
                key={entity.slug}
                href={`/entities/${entity.slug}`}
                className="bg-slate-950/40 border border-slate-900 py-5 px-4 hover:border-[#4A90E2]/50 hover:bg-[#4A90E2]/5 transition-all group flex flex-col items-center justify-center gap-1"
              >
                <span className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">Sector: {entity.sector}</span>
                <span className="text-[10px] text-slate-300 font-black tracking-tighter uppercase group-hover:text-[#4A90E2] transition-colors text-center">
                  {entity.name}
                </span>
              </Link>
            ))
          ) : (
            [...Array(9)].map((_, i) => (
              <div key={i} className="border border-slate-900/30 py-8 opacity-10 animate-pulse bg-slate-900/20" />
            ))
          )}
        </div>

        {/* FOOTER */}
        <footer className="w-full pt-6 border-t border-slate-900/50 flex justify-between items-center">
          <p className="text-[8px] text-slate-700 tracking-[0.4em] uppercase">
            Relational_Randomizer: ACTIVE
          </p>
          <Link href="/entities" className="text-[#4A90E2] hover:text-white text-[9px] font-black tracking-widest uppercase transition-colors flex items-center gap-2 group">
            Access Archive <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </footer>
      </main>
    </div>
  );
}
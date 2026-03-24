export const dynamic = "force-dynamic";

import LogoMain from '@/components/ui/logo-main';
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
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <main className="relative z-10 max-w-4xl w-full text-center flex flex-col items-center">
        
        {/* The Hook */}
        <div className="mb-12 space-y-3">
          <h1 className="text-xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-tight">
            How Michigan&apos;s policies can turn a <br className="hidden md:block" />
            medical emergency into extreme violence.
          </h1>
          <div className="h-px w-24 bg-red-600/50 mx-auto" />
        </div>

        {/* CLICKABLE LOGO-MAIN GATEWAY */}
        <Link 
          href="/entities" 
          className="group transition-all duration-500 hover:scale-[1.02] active:scale-95 mb-12 block w-full"
        >
          <LogoMain />
        </Link>

        {/* Narrative Context */}
        <p className="max-w-xl text-slate-500 text-[10px] md:text-xs uppercase tracking-[0.2em] leading-relaxed mb-12">
          An archive of public records documenting the 
          <span className="text-white font-black mx-1 italic">escalation of force</span> 
          against those seeking emergency assistance.
        </p>

        {/* Dynamic Database Grid */}
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

        {/* Footer */}
        <footer className="w-full pt-6 border-t border-slate-900/50 flex justify-between items-center">
          <p className="text-[8px] text-slate-700 tracking-[0.3em] uppercase">
            Relational_Randomizer: ACTIVE
          </p>
          <Link href="/entities" className="text-[#4A90E2] hover:text-white text-[9px] font-black tracking-widest uppercase flex items-center gap-2 group">
            Access Archive <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </footer>
      </main>
    </div>
  );
}
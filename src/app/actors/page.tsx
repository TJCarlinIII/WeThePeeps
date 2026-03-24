export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import ActorSearch from './ActorSearch';

interface Actor {
  id: number;
  name: string;
  sector: string;
}

export default async function ActorsPage() {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };
  
  const { results: actors } = await env.DB.prepare(
    "SELECT * FROM actors ORDER BY name ASC"
  ).all() as { results: Actor[] };

  return (
    <main className="min-h-screen bg-black text-white p-8 md:p-20 font-mono">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 border-l-4 border-[#4A90E2] pl-6">
          <span className="text-[#4A90E2] text-[10px] font-bold tracking-[0.4em] uppercase">Personnel_Tracking</span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-white mt-2">Subject_Index</h1>
          <p className="text-slate-500 text-xs font-bold mt-4 tracking-[0.1em] max-w-xl uppercase leading-relaxed">
            A directory of specific individuals cited within the evidence database. 
            Cross-referenced by their primary operating sector and historical involvement.
          </p>
        </header>

        <ActorSearch initialActors={actors} />
      </div>
    </main>
  );
}
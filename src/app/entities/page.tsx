export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import EntitySearch from './EntitySearch';

interface Entity {
  id: number;
  name: string;
  sector: string;
}

export default async function EntitiesPage() {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };
  
  const { results: entities } = await env.DB.prepare(
    "SELECT * FROM entities ORDER BY name ASC"
  ).all() as { results: Entity[] };

  return (
    <main className="min-h-screen bg-black text-white p-8 md:p-20 font-mono">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 border-l-4 border-[#4A90E2] pl-6">
          <span className="text-[#4A90E2] text-[10px] font-bold tracking-[0.4em] uppercase">Organization_Database</span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-white mt-2">Known_Entities</h1>
          <p className="text-slate-500 text-xs font-bold mt-4 tracking-[0.1em] max-w-xl uppercase leading-relaxed">
            A comprehensive index of corporate and governmental bodies documented within the manifest. 
            Select an entity to view all linked evidence and officers.
          </p>
        </header>

        <EntitySearch initialEntities={entities} />
      </div>
    </main>
  );
}
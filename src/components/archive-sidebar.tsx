import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from 'next/link';

export const dynamic = "force-dynamic";

interface ActorRecord {
  name: string;
  entity: string;
  sector: string;
}

interface CloudflareEnv {
  DB: D1Database;
}

function transformData(actors: ActorRecord[]) {
  const hierarchy: Record<string, Record<string, string[]>> = {};

  actors.forEach((actor) => {
    const sector = actor.sector || 'Unknown_Sector';
    const entity = actor.entity || 'Unknown_Entity';
    if (!hierarchy[sector]) hierarchy[sector] = {};
    if (!hierarchy[sector][entity]) hierarchy[sector][entity] = [];
    hierarchy[sector][entity].push(actor.name);
  });

  return hierarchy;
}

export default async function ArchiveSidebar() {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as CloudflareEnv;

  const { results: actors } = await env.DB.prepare(
    "SELECT name, entity, sector FROM actors ORDER BY sector ASC, entity ASC, name ASC"
  ).all() as { results: ActorRecord[] };

  const sectors = transformData(actors || []);
  const sectorEntries = Object.entries(sectors);

  return (
    <nav className="h-full bg-black p-6 font-mono text-[11px] overflow-y-auto no-scrollbar border-r border-slate-900">
      <div className="mb-10">
        <h2 className="text-[#4A90E2] font-black tracking-[0.3em] uppercase mb-1 italic text-xs">
          Matrix_Hierarchy
        </h2>
        <div className="h-1 w-12 bg-[#4A90E2]"></div>
      </div>

      {sectorEntries.length === 0 ? (
        <div className="text-slate-700 italic text-[9px] uppercase tracking-widest text-center mt-20">
          Waiting_For_Database_Sync...
        </div>
      ) : (
        sectorEntries.map(([sectorName, entities]) => (
          <div key={sectorName} className="mb-10">
            <h3 className="text-white font-black uppercase tracking-widest mb-3 border-b border-slate-900 pb-1 flex justify-between items-center">
              {sectorName}
              <span className="text-[8px] text-slate-700 font-mono">SEC_LNK</span>
            </h3>
            
            {Object.entries(entities).map(([entityName, personnel]) => (
              <div key={entityName} className="ml-3 mb-6">
                <Link 
                  href={`/entities/${encodeURIComponent(entityName)}`}
                  className="text-[#4A90E2]/80 font-bold uppercase mb-3 tracking-tighter hover:text-white transition-colors block"
                >
                  <span className="opacity-50 mr-1 text-[9px]">DIR:</span>
                  {entityName}
                </Link>
                
                <ul className="space-y-1 border-l border-slate-900 ml-1 pl-4">
                  {personnel.map((person) => (
                    <li key={person}>
                      <Link 
                        href={`/actors/${encodeURIComponent(person)}`} 
                        className="hover:text-[#4A90E2] text-slate-500 transition-colors py-1 group flex items-center gap-2"
                      >
                        <span className="w-1 h-1 bg-slate-800 rounded-full group-hover:bg-[#4A90E2] transition-colors" />
                        {person}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))
      )}
    </nav>
  );
}
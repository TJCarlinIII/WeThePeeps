export const dynamic = "force-dynamic";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import SectorSearch from './SectorSearch';
import type { D1Database } from "@cloudflare/workers-types";

export default async function SectorsPage() {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };
  
  const { results: sectors } = await env.DB.prepare(`
    SELECT 
      s.*,
      (SELECT COUNT(*) FROM entities WHERE sector_id = s.id) as entity_count,
      (SELECT COUNT(*) FROM incidents i 
       JOIN entities e ON i.entity_id = e.id 
       WHERE e.sector_id = s.id) as incident_count
    FROM sectors s 
    ORDER BY s.name ASC
  `).all();

  return (
    <div className="py-12">
      <header className="mb-16 border-l-4 border-[#4A90E2] pl-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-[10px] text-[#4A90E2] font-black uppercase tracking-[0.4em]">
            System_Directory: Sector_Analysis
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase mb-4 italic">
          Operational <span className="text-[#D4AF37]">Sectors</span>
        </h1>
      </header>

      <SectorSearch initialSectors={sectors || []} />
    </div>
  );
}
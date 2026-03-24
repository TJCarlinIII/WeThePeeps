export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import SectorSearch from './SectorSearch';

interface Sector {
  id: number;
  name: string;
}

export default async function SectorsPage() {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };
  
  const { results: sectors } = await env.DB.prepare(
    "SELECT * FROM sectors ORDER BY name ASC"
  ).all() as { results: Sector[] };

  return (
    <main className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 border-l-4 border-[#4A90E2] pl-6">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Sector_Index</h1>
          <p className="text-[#4A90E2] text-xs font-bold mt-2 tracking-[0.3em]">Operational Categories // System Directory</p>
        </header>

        <SectorSearch initialSectors={sectors} />
      </div>
    </main>
  );
}
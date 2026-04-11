export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import SidebarWidget from "@/components/SidebarWidget";
import GlobalSearch from "@/components/GlobalSearch"; // ✅ NEW IMPORT
import type { D1Database } from "@cloudflare/workers-types";

interface Statute {
  id: number;
  citation: string;
  title: string;
  category: string;
}

interface Actor {
  id: number;
  full_name: string;
  slug: string;
  status: string;
  job_title: string;
}

interface Entity {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface Evidence {
  id: number;
  title: string;
  created_at: string;
  sector: string;
}

export default async function PublicCodex() {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };

  const [statutesRes, actorsRes, entitiesRes, recentEvidenceRes] = await Promise.all([
    env.DB.prepare("SELECT * FROM statutes ORDER BY citation ASC").all<Statute>(),
    env.DB.prepare("SELECT * FROM actors ORDER BY full_name ASC").all<Actor>(),
    env.DB.prepare("SELECT id, name, slug, description FROM entities ORDER BY name ASC").all<Entity>(),
    env.DB.prepare("SELECT id, title, event_date as created_at, 'CIVIC' as sector FROM incidents ORDER BY event_date DESC LIMIT 5").all<Evidence>()
  ]);

  const statutes = statutesRes.results || [];
  const actors = actorsRes.results || [];
  const entities = entitiesRes.results || [];
  const recentEvidence = recentEvidenceRes.results || [];

  return (
    <main className="min-h-screen bg-black text-slate-300 font-mono p-6 md:p-12">
      <header className="max-w-6xl mx-auto mb-16 border-b border-slate-900 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none">
              Public_Codex_v1.0
            </h1>
            <p className="text-[#4A90E2] text-[10px] font-bold tracking-[0.4em] uppercase">
              Open_Source_Civic_Intelligence_Database
            </p>
          </div>
          
          {/* ✅ SEARCH INTEGRATION */}
          <GlobalSearch />
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* PILLAR 1: STATUTES */}
          <section>
            <div className="flex items-center gap-3 mb-8 border-l-2 border-[#4A90E2] pl-4">
              <h2 className="text-sm font-black text-white uppercase tracking-widest italic">Legal_Frameworks</h2>
            </div>
            <div className="space-y-4">
              {statutes.map((law) => (
                <div key={law.id} className="group border border-slate-900 p-4 hover:border-[#4A90E2]/30 transition-all bg-slate-950/20">
                  <span className="text-[10px] text-[#4A90E2] font-bold block mb-1 uppercase tracking-tighter">
                    {`${law.category} // ${law.citation}`}
                  </span>
                  <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors uppercase">
                    {law.title}
                  </h3>
                </div>
              ))}
            </div>
          </section>

          {/* PILLAR 2: ACTORS */}
          <section>
            <div className="flex items-center gap-3 mb-8 border-l-2 border-red-600 pl-4">
              <h2 className="text-sm font-black text-white uppercase tracking-widest italic">Subject_Profiles</h2>
            </div>
            <div className="space-y-4">
              {actors.map((actor) => (
                <Link key={actor.id} href={`/actors/${actor.slug || encodeURIComponent(actor.full_name)}`} className="block group border border-slate-900 p-4 hover:border-red-900/50 transition-all bg-slate-950/20">
                  <span className="text-[10px] text-red-600 font-bold block mb-1 uppercase tracking-tighter">
                    {`ID: ${actor.id.toString().padStart(3, '0')} // ${actor.status}`}
                  </span>
                  <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors uppercase">
                    {actor.full_name}
                  </h3>
                  <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-2 block italic">
                    {actor.job_title}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* PILLAR 3: ENTITIES */}
          <section>
            <div className="flex items-center gap-3 mb-8 border-l-2 border-slate-600 pl-4">
              <h2 className="text-sm font-black text-white uppercase tracking-widest italic">Institutional_Nodes</h2>
            </div>
            <div className="space-y-4">
              {entities.map((entity) => (
                <Link key={entity.id} href={`/entities/${entity.slug || encodeURIComponent(entity.name)}`} className="block group border border-slate-900 p-4 hover:border-slate-400 transition-all bg-slate-950/20">
                  <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors uppercase">
                    {entity.name}
                  </h3>
                  <p className="text-[9px] text-slate-600 font-bold uppercase mt-2 line-clamp-2 leading-relaxed">
                    {entity.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-12 border-l border-slate-900 pl-8 hidden lg:block">
          <SidebarWidget 
            title="Recent_Intel_Logs"
            accentColor="#4A90E2"
            items={recentEvidence.map(e => ({
              label: e.title,
              href: `/evidence/${e.id}`,
              timestamp: new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              category: e.sector
            }))}
          />

          <SidebarWidget 
            title="System_Status"
            accentColor="#22c55e"
            items={[
              { label: "D1 Database: Connected", href: "#", timestamp: "LIVE" },
              { label: "Edge Nodes: 310+ Active", href: "#", timestamp: "LIVE" },
              { label: "Encryption: AES-256", href: "#", timestamp: "SECURE" }
            ]}
          />
        </aside>

      </div>
    </main>
  );
}
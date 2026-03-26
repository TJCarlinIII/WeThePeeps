import { getCloudflareContext } from "@opennextjs/cloudflare";
import IncidentForm from "@/components/admin/forms/IncidentForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 1. Define precise interfaces for the D1 results
interface SectorRow {
  id: number;
  name: string;
}

interface EntityRow {
  id: number;
  name: string;
  sector_id: number;
}

interface ActorRow {
  id: number;
  full_name: string;
  entity_id: number;
}

interface StatuteRow {
  id: number;
  title: string;
}

interface IncidentRow {
  id: number;
  title: string;
  slug: string;
  description: string;
  sector_id: number;
  entity_id: number;
  actor_id: number;
  statute_id: number;
  status: 'pending' | 'verified' | 'archived';
  is_critical: number;
  event_date: string;
  entity_name?: string;
  actor_name?: string;
}

interface Env {
  DB: D1Database;
}

async function getAdminData() {
  const ctx = await getCloudflareContext();
  const db = (ctx.env as unknown as Env).DB;

  const [sectors, entities, actors, statutes, incidents] = await Promise.all([
    db.prepare("SELECT id, name FROM sectors ORDER BY name ASC").all<SectorRow>(),
    db.prepare("SELECT id, name, sector_id FROM entities ORDER BY name ASC").all<EntityRow>(),
    db.prepare("SELECT id, full_name, entity_id FROM actors ORDER BY full_name ASC").all<ActorRow>(),
    db.prepare("SELECT id, title FROM statutes ORDER BY title ASC").all<StatuteRow>(),
    db.prepare(`
      SELECT i.*, e.name as entity_name, a.full_name as actor_name 
      FROM incidents i
      LEFT JOIN entities e ON i.entity_id = e.id
      LEFT JOIN actors a ON i.actor_id = a.id
      ORDER BY i.event_date DESC
    `).all<IncidentRow>()
  ]);

  return {
    sectors: sectors.results || [],
    entities: entities.results || [],
    actors: actors.results || [],
    statutes: statutes.results || [],
    incidents: incidents.results || []
  };
}

export default async function IncidentsAdmin() {
  const data = await getAdminData();

  return (
    <main className="p-8 bg-black min-h-screen font-mono text-white">
      <header className="mb-12 border-b border-slate-900 pb-6">
        <h1 className="text-2xl font-black italic tracking-tighter text-[#4A90E2]">
          INCIDENT_LOG_ENTRY // INTERNAL_USE_ONLY
        </h1>
        <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">
          Secure Evidence Ingress Portal
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* FORM SECTION */}
        <section className="lg:col-span-5 bg-slate-950/30 p-6 border border-slate-900 shadow-2xl">
          <h2 className="text-[10px] font-black mb-6 text-emerald-500 uppercase tracking-[0.3em]">
            &gt; Initializing_New_Record
          </h2>
          <IncidentForm 
            sectors={data.sectors}
            entities={data.entities}
            actors={data.actors}
            statutes={data.statutes}
            onSave={async (formData) => {
              "use server";
              // Placeholder for the save logic
              console.log("Committing Record:", formData);
            }}
          />
        </section>

        {/* REGISTRY SECTION */}
        <section className="lg:col-span-7">
          <h2 className="text-[10px] font-black mb-6 text-slate-500 uppercase tracking-[0.3em]">
            &gt; Historical_Incident_Registry
          </h2>
          <div className="space-y-2">
            {data.incidents.map((incident) => (
              <div 
                key={incident.id} 
                className={`p-4 border ${incident.is_critical === 1 ? 'border-red-900 bg-red-950/10' : 'border-slate-900 bg-slate-950/20'} flex justify-between items-center group hover:border-[#4A90E2] transition-colors`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    {incident.is_critical === 1 && (
                      <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                    )}
                    <h3 className="text-xs font-black uppercase">{incident.title}</h3>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-tighter font-bold">
                    {incident.event_date} — {incident.entity_name || 'Unspecified_Entity'}
                  </p>
                  <p className="text-[9px] text-blue-400 font-mono mt-0.5 italic">
                    Actor: {incident.actor_name || 'Unknown'}
                  </p>
                </div>
                <button className="text-[9px] font-black text-slate-600 group-hover:text-[#4A90E2] transition-colors">
                  [ EDIT_RECORD ]
                </button>
              </div>
            ))}
            {data.incidents.length === 0 && (
              <div className="text-[10px] text-slate-700 italic py-8 border border-dashed border-slate-900 text-center">
                NO_INCIDENTS_FOUND_IN_ACTIVE_PARTITION
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
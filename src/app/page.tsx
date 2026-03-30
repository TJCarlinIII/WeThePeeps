import { getCloudflareContext } from "@opennextjs/cloudflare";
import MarqueeBanner from "@/components/blocks/MarqueeBanner";
import HeroBlock from "@/components/blocks/HeroBlock";
import DossierCard from "@/components/blocks/DossierCard";
import StatuteTracker from "@/components/blocks/StatuteTracker";
import MapAndFeed from "@/components/blocks/MapAndFeed";
import Link from "next/link";
import { 
  OfficialDossier, IntelligenceIncident, TopStatute, 
  EntityNode, ActorNode, ActorEntityRelation 
} from "@/lib/database-types";

export const dynamic = "force-dynamic";

export default async function HomeHybridPage() {
  let stats = { subjects: 0, open_inv: 0, stonewalled: 0, incidents: 0 };
  let dossiers: OfficialDossier[] = [];
  let mapEntities: EntityNode[] = [];
  let mapActors: ActorNode[] = [];
  let mapRelations: ActorEntityRelation[] = [];
  let incidents: IntelligenceIncident[] = [];
  let topStatutes: TopStatute[] = [];

  try {
    const ctx = await getCloudflareContext({ async: true });
    const db = (ctx.env as unknown as { DB: D1Database }).DB;

    // Execute queries in parallel
    const [statsData, dossiersData, entitiesData, relationsData, incidentsData, statutesData] = await Promise.all([
      db.prepare(`
        SELECT 
          (SELECT COUNT(*) FROM actors) as subjects,
          (SELECT COUNT(*) FROM actors WHERE status = 'under_review') as open_inv,
          (SELECT COUNT(*) FROM actors WHERE status = 'former') as stonewalled,
          (SELECT COUNT(*) FROM incidents) as incidents
      `).first<typeof stats>(),
      
      db.prepare(`
        SELECT a.id, 'WTP-' || substr('00000' || a.id, -5, 5) as uid, a.full_name, a.job_title, a.status, a.slug,
               e.name as agency_name, e.slug as agency_slug, e.history_of_falsification,
               (SELECT COUNT(*) FROM incidents WHERE actor_id = a.id) as incident_count,
               (SELECT COUNT(DISTINCT statute_id) FROM incidents WHERE actor_id = a.id) as statute_count
        FROM actors a LEFT JOIN entities e ON a.entity_id = e.id
        ORDER BY incident_count DESC LIMIT 4
      `).all<OfficialDossier>(),

      // MAP: Only fetch entities that actually have documented crimes
      db.prepare(`SELECT id, name, slug, has_documented_crimes, is_high_priority FROM entities WHERE has_documented_crimes = 1 LIMIT 8`).all<EntityNode>(),
      
      // MAP: Fetch junction table relations
      db.prepare(`SELECT actor_id, entity_id, connection_type FROM actor_entity_relations`).all<ActorEntityRelation>(),
      
      db.prepare(`
        SELECT i.id, i.title, i.event_date, i.description, i.is_critical, i.slug, i.moral_violation_type,
               e.id as entity_id, e.name as entity_name, e.slug as entity_slug,
               CASE WHEN EXISTS (SELECT 1 FROM media m WHERE m.incident_id = i.id) THEN 1 ELSE 0 END as has_verified_evidence
        FROM incidents i LEFT JOIN entities e ON i.entity_id = e.id
        ORDER BY i.event_date DESC LIMIT 16
      `).all<IntelligenceIncident>(),

      db.prepare(`
        SELECT s.id, s.citation, s.title, COUNT(i.id) as violation_count
        FROM statutes s JOIN incidents i ON s.id = i.statute_id
        GROUP BY s.id ORDER BY violation_count DESC LIMIT 5
      `).all<TopStatute>()
    ]);

    if (statsData) stats = statsData;
    dossiers = dossiersData.results || [];
    mapEntities = entitiesData.results || [];
    mapRelations = relationsData.results || [];
    incidents = incidentsData.results || [];
    topStatutes = statutesData.results || [];

    // MAP: Fetch only the actors connected to the filtered entities to prevent floating dots
    if (mapEntities.length > 0) {
      const entityIds = mapEntities.map(e => e.id).join(',');
      const actorsQuery = await db.prepare(`
        SELECT DISTINCT a.id, a.full_name, a.slug, a.status 
        FROM actors a 
        JOIN actor_entity_relations r ON a.id = r.actor_id 
        WHERE r.entity_id IN (${entityIds})
      `).all<ActorNode>();
      mapActors = actorsQuery.results || [];
    }

  } catch (e) {
    console.error("D1 Database Context Failure:", e);
  }

  return (
    <div className="min-h-screen bg-[#050A18] investigative-grid overflow-hidden pb-32">
      <MarqueeBanner />
      <HeroBlock stats={stats} />

      <main className="max-w-[1400px] mx-auto px-4 space-y-24 mt-12">
        
        {/* ROW 1: ENTITY WATCH */}
        <section>
          <div className="flex justify-between items-end mb-6 border-b border-slate-800 pb-2">
            <div>
              <h2 className="text-[#D4AF37] font-mono text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <span className="text-[8px]">▶</span> Entity Watch
              </h2>
              <p className="text-slate-400 font-serif-formal italic text-sm mt-1">Officials and subjects under active investigation</p>
            </div>
            <Link href="/accountability" className="text-slate-500 font-mono text-[9px] uppercase tracking-widest hover:text-[#4A90E2] flex items-center gap-1 transition-colors">
              View All Registry →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dossiers.map(d => <DossierCard key={d.id} dossier={d} />)}
          </div>
        </section>

        {/* ROW 2: MAP, FEED & STATUTE TRACKER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 xl:col-span-9">
            <MapAndFeed 
              entities={mapEntities} 
              actors={mapActors} 
              relations={mapRelations} 
              incidents={incidents} 
            />
          </div>
          <div className="lg:col-span-4 xl:col-span-3">
            <StatuteTracker statutes={topStatutes} />
          </div>
        </div>

      </main>
    </div>
  );
}
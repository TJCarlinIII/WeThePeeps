import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import DossierCard from "@/components/blocks/DossierCard";
import IntelligenceFeed from "@/components/blocks/IntelligenceFeed";
import { OfficialDossier, IntelligenceIncident } from "@/lib/database-types";

export async function generateStaticParams() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const db = (ctx.env as unknown as { DB: D1Database }).DB;
    // Pre-render only entities mapped as jurisdictions
    const { results } = await db.prepare("SELECT slug FROM entities WHERE slug IS NOT NULL").all<{ slug: string }>();
    return (results || []).map((row) => ({ slug: row.slug }));
  } catch (e) {
    return []; 
  }
}

export default async function JurisdictionHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as { DB: D1Database }).DB;

  const entity = await db.prepare("SELECT id, name, description, history_of_falsification FROM entities WHERE slug = ?").bind(slug).first<{ id: number, name: string, description: string, history_of_falsification: number }>();
  if (!entity) notFound();

  // Fetch Associated Data (using the Junction table logic)
  const [dossiersData, incidentsData] = await Promise.all([
    db.prepare(`
      SELECT a.id, 'WTP-' || substr('00000' || a.id, -5, 5) as uid, a.full_name, a.job_title, a.status, a.slug,
             ?2 as agency_name, ?1 as agency_slug, ?4 as history_of_falsification,
             (SELECT COUNT(*) FROM incidents WHERE actor_id = a.id) as incident_count,
             (SELECT COUNT(DISTINCT statute_id) FROM incidents WHERE actor_id = a.id) as statute_count
      FROM actors a 
      JOIN actor_entity_relations r ON a.id = r.actor_id
      WHERE r.entity_id = ?3
    `).bind(slug, entity.name, entity.id, entity.history_of_falsification).all<OfficialDossier>(),
    
    db.prepare(`
      SELECT i.id, i.title, i.event_date, i.description, i.is_critical, i.slug, i.moral_violation_type,
             ?2 as entity_name, ?1 as entity_slug, ?3 as entity_id,
             CASE WHEN EXISTS (SELECT 1 FROM media m WHERE m.incident_id = i.id) THEN 1 ELSE 0 END as has_verified_evidence
      FROM incidents i WHERE i.entity_id = ?3
      ORDER BY i.event_date DESC LIMIT 16
    `).bind(slug, entity.name, entity.id).all<IntelligenceIncident>()
  ]);

  const dossiers = dossiersData.results || [];
  const incidents = incidentsData.results || [];

  return (
    <div className="min-h-screen bg-[#050A18] investigative-grid p-4 md:p-12">
      <div className="max-w-[1400px] mx-auto">
        <header className="border-b border-slate-800 pb-12 mb-12 relative">
          
          {entity.history_of_falsification === 1 && (
            <div className="absolute top-0 right-0 border border-red-900 bg-red-950/30 text-red-500 font-mono text-[10px] px-3 py-1 font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.2)]">
              ⚠️ Institutional Falsification Warning
            </div>
          )}

          <div className="inline-block px-3 py-1 bg-[#0B1021] border border-[#4A90E2]/30 font-mono text-[9px] text-[#4A90E2] uppercase tracking-widest mb-6">
            Jurisdiction Profile Node
          </div>
          <h1 className="text-5xl md:text-7xl font-serif-formal text-white mb-6 uppercase tracking-tighter">
            {entity.name}
          </h1>
          <p className="text-slate-400 font-sans max-w-3xl leading-relaxed text-lg border-l-2 border-[#D4AF37] pl-4">
            {entity.description || "Active monitoring and evidence aggregation node for this jurisdiction."}
          </p>
        </header>

        <div className="space-y-24 pb-20">
          {dossiers.length > 0 && (
            <section>
              <h2 className="text-[#D4AF37] font-mono text-[10px] font-black uppercase tracking-[0.3em] mb-6 border-b border-slate-800 pb-2 flex items-center gap-2">
                <span className="text-[8px]">▶</span> Documented Personnel ({dossiers.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dossiers.map(d => <DossierCard key={d.id} dossier={d} />)}
              </div>
            </section>
          )}

          {incidents.length > 0 ? (
            <section>
              <h2 className="text-[#D4AF37] font-mono text-[10px] font-black uppercase tracking-[0.3em] mb-6 border-b border-slate-800 pb-2 flex items-center gap-2">
                <span className="text-[8px]">▶</span> Jurisdiction Evidence Manifest
              </h2>
              <IntelligenceFeed incidents={incidents} />
            </section>
          ) : (
            <div className="border border-dashed border-slate-800 p-20 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">
              No evidence documented under this jurisdiction node yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
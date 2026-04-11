/**
 * FILE: src/app/page.tsx
 *
 * FIXES:
 * 1. CRITICAL — Restored the required double cast:
 *      (ctx.env as unknown as { DB: D1Database }).DB
 *    The single-cast version (ctx.env as { DB: D1Database }) causes a
 *    TypeScript error because the types are not directly assignable.
 *    A TypeScript compile error = blank page / crashed build.
 *
 * 2. CRITICAL — Split queries into TWO independent Promise.all groups:
 *    GROUP A: stats, dossiers, incidents, statutes (core page data)
 *    GROUP B: map entities, map relations, map actors (map-only data)
 *    If GROUP B fails (e.g. connections table empty/missing), GROUP A
 *    data is unaffected and dossiers still render.
 *
 * 3. MapAndFeed now only receives `entities` (for the feed filter link) and
 *    `incidents`. The ClosedLoopMap fetches its own data from /api/network-map.
 *
 * 4. Removed `mapActors` and `mapRelations` from page-level fetching since
 *    ClosedLoopMap handles that itself.
 *
 * 5. Added COALESCE on history_of_falsification so NULL doesn't break DossierCard.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import MarqueeBanner from "@/components/blocks/MarqueeBanner";
import HeroBlock from "@/components/blocks/HeroBlock";
import DossierCard from "@/components/blocks/DossierCard";
import StatuteTracker from "@/components/blocks/StatuteTracker";
import MapAndFeed from "@/components/blocks/MapAndFeed";
import EntityActionBar from "@/components/blocks/EntityActionBar"; // ✅ NEW IMPORT
import Link from "next/link";
import type {
  OfficialDossier,
  IntelligenceIncident,
  TopStatute,
  EntityNode,
} from "@/lib/database-types";

export const dynamic = "force-dynamic";

export default async function HomeHybridPage() {
  // Default values — shown if any query group fails
  let stats = { subjects: 0, open_inv: 0, stonewalled: 0, incidents: 0 };
  let dossiers: OfficialDossier[] = [];
  let mapEntities: EntityNode[] = [];
  let incidents: IntelligenceIncident[] = [];
  let topStatutes: TopStatute[] = [];

  // ── GROUP A: Core page data ───────────────────────────────────────────────
  // Stats, dossiers, incidents, statutes — must NEVER fail silently due to
  // an unrelated map/connections query.
  try {
    const ctx = await getCloudflareContext({ async: true });
    // ✅ DOUBLE CAST required — ctx.env is typed as unknown internally
    const db = (ctx.env as unknown as { DB: D1Database }).DB;

    const [statsData, dossiersData, incidentsData, statutesData] =
      await Promise.all([

        // ── Stats ───────────────────────────────────────────────────────────
        db.prepare(`
          SELECT
            (SELECT COUNT(*) FROM actors)                                    AS subjects,
            (SELECT COUNT(*) FROM actors  WHERE status = 'under_review')     AS open_inv,
            (SELECT COUNT(*) FROM incidents WHERE status = 'stonewalled')    AS stonewalled,
            (SELECT COUNT(*) FROM incidents)                                  AS incidents
        `).first<typeof stats>(),

        // ── Entity Watch dossiers ────────────────────────────────────────────
        db.prepare(`
          SELECT
            a.id,
            'WTP-' || substr('00000' || a.id, -5, 5)    AS uid,
            a.full_name,
            a.job_title,
            COALESCE(a.status, 'active')                 AS status,
            a.slug,
            COALESCE(e.name,  'Unaffiliated')            AS agency_name,
            COALESCE(e.slug,  '')                        AS agency_slug,
            COALESCE(e.history_of_falsification, 0)      AS history_of_falsification,
            (SELECT COUNT(*)
               FROM incidents
              WHERE actor_id = a.id)                     AS incident_count,
            (SELECT COUNT(DISTINCT statute_id)
               FROM incidents
              WHERE actor_id = a.id
                AND statute_id IS NOT NULL)              AS statute_count
          FROM actors a
          LEFT JOIN entities e ON a.entity_id = e.id
          ORDER BY incident_count DESC
          LIMIT 4
        `).all<OfficialDossier>(),

        // ── Intelligence Feed ────────────────────────────────────────────────
        db.prepare(`
          SELECT
            i.id,
            i.title,
            i.event_date,
            i.description,
            i.is_critical,
            i.slug,
            i.moral_violation_type,
            COALESCE(e.id,   0)    AS entity_id,
            COALESCE(e.name, '')   AS entity_name,
            COALESCE(e.slug, '')   AS entity_slug,
            CASE
              WHEN EXISTS (
                SELECT 1 FROM media m WHERE m.incident_id = i.id
              ) THEN 1 ELSE 0
            END                    AS has_verified_evidence
          FROM incidents i
          LEFT JOIN entities e ON i.entity_id = e.id
          ORDER BY i.event_date DESC
          LIMIT 16
        `).all<IntelligenceIncident>(),

        // ── Top Statutes ─────────────────────────────────────────────────────
        db.prepare(`
          SELECT
            s.id,
            s.citation,
            s.title,
            COUNT(i.id) AS violation_count
          FROM statutes s
          JOIN incidents i ON s.id = i.statute_id
          GROUP BY s.id
          ORDER BY violation_count DESC
          LIMIT 5
        `).all<TopStatute>(),
      ]);

    if (statsData)                stats    = statsData;
    dossiers    = dossiersData.results  ?? [];
    incidents   = incidentsData.results ?? [];
    topStatutes = statutesData.results  ?? [];

  } catch (err) {
    console.error("❌ [HomeHybridPage] GROUP A query failure:", err);
  }

  // ── GROUP B: Map entities (for feed filter link only) ─────────────────────
  // Failure here does NOT affect dossiers or the intelligence feed.
  // The ClosedLoopMap component fetches its own full entity/actor/relation
  // data from /api/network-map independently.
  try {
    const ctx = await getCloudflareContext({ async: true });
    const db = (ctx.env as unknown as { DB: D1Database }).DB;

    const entitiesData = await db.prepare(`
      SELECT
        id,
        name,
        slug,
        1                                      AS has_documented_crimes,
        COALESCE(history_of_falsification, 0)  AS is_high_priority
      FROM entities
      LIMIT 20
    `).all<EntityNode>();

    mapEntities = entitiesData.results ?? [];

  } catch (err) {
    console.error("❌ [HomeHybridPage] GROUP B query failure:", err);
    // mapEntities stays [] — MapAndFeed degrades gracefully
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#050A18] investigative-grid overflow-hidden pb-32">
      <MarqueeBanner /> {/* The Ticker stays at the top */}
      
      <main className="max-w-[1400px] mx-auto space-y-12 mt-8">
        {/* 1. Brand Identity & Main Search */}
        <HeroBlock stats={stats} /> 

        {/* 2. The New Command Bar (Under Search) */}
        <section className="border-y border-slate-800/50 py-6 bg-slate-900/10">
          <div className="px-4 mb-2">
            <span className="font-mono text-[8px] text-slate-600 uppercase tracking-[0.3em]">
              Priority Jurisdictions
            </span>
          </div>
          <EntityActionBar />
        </section>

        {/* 3. The Watchlist & Map Feed below... */}
        <section className="px-4 space-y-24">
          
          {/* ── Entity Watch ──────────────────────────────────────────────────── */}
          <section>
            <div className="flex justify-between items-end mb-6 border-b border-slate-800 pb-2">
              <div>
                <h2 className="text-[#D4AF37] font-mono text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                  <span className="text-[8px]">▶</span> Entity Watch
                </h2>
                <p className="text-slate-400 font-serif italic text-sm mt-1">
                  Officials and subjects under active investigation
                </p>
              </div>
              <Link
                href="/accountability"
                className="text-slate-500 font-mono text-[9px] uppercase tracking-widest hover:text-[#4A90E2] flex items-center gap-1 transition-colors"
              >
                View All Registry →
              </Link>
            </div>

            {dossiers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dossiers.map((d) => (
                  <DossierCard key={d.id} dossier={d} />
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-slate-800 p-12 text-center">
                <span className="font-mono text-[10px] text-slate-700 uppercase tracking-widest">
                  No subjects on record — add actors to the database to populate this panel.
                </span>
              </div>
            )}
          </section>

          {/* ── Map + Statute Sidebar ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 xl:col-span-9">
              {/*
                MapAndFeed receives:
                - entities: used only to resolve entity name for the "View Jurisdiction" link
                - incidents: the global feed, filtered client-side when a map node is clicked
                ClosedLoopMap (rendered inside MapAndFeed) fetches its own data.
              */}
              <MapAndFeed
                entities={mapEntities}
                incidents={incidents}
              />
            </div>
            <div className="lg:col-span-4 xl:col-span-3">
              <StatuteTracker statutes={topStatutes} />
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
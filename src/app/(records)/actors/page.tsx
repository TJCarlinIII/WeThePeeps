export const dynamic = "force-dynamic";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import ActorSearch from './ActorSearch';
import { Users } from "lucide-react";
import type { D1Database } from "@cloudflare/workers-types";

export default async function ActorsPage() {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };

  // 1. Fetch Actors (Fixed alias 'is' to 'ins')
  const { results: rawActors } = await env.DB.prepare(`
    SELECT
      a.id,
      a.full_name AS name,
      a.slug,
      a.job_title,
      a.status,
      a.bio,
      a.history_of_falsification,
      e.name AS sector,
      e.name AS agency_name,
      (SELECT COUNT(*) FROM incidents WHERE actor_id = a.id) AS incident_count,
      (
        SELECT COUNT(DISTINCT ins.statute_id)
        FROM incident_statutes ins
        JOIN incidents i ON i.id = ins.incident_id
        WHERE i.actor_id = a.id
      ) AS statute_count
    FROM actors a
    LEFT JOIN entities e ON a.entity_id = e.id
    ORDER BY a.full_name ASC
  `).all();

  // 2. Fetch Unique Entities for the Search Filter
  const { results: rawEntities } = await env.DB.prepare(`
    SELECT DISTINCT name FROM entities ORDER BY name ASC
  `).all();

  const actors = (rawActors || []) as any[];
  const entities = (rawEntities || []).map((e: any) => e.name) as string[];

  return (
    <div className="py-12">
      <header className="mb-16 border-l-4 border-[#4A90E2] pl-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-[10px] text-[#4A90E2] font-black uppercase tracking-[0.4em]">
            Database_Query: Personnel_Index
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase mb-4 italic">
          Subject <span className="text-[#D4AF37]">Index</span>
        </h1>
      </header>

      <ActorSearch initialActors={actors} entities={entities} />
    </div>
  );
}
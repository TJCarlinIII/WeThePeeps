import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import type { D1Database } from "@cloudflare/workers-types";

// REMOVED: export const runtime = "edge";

export async function GET() {
  try {
    const context = await getCloudflareContext({ async: true });
    const db = (context.env as unknown as { DB: D1Database }).DB;

    if (!db) {
      return NextResponse.json({ error: "DB_CONNECTION_LOST" }, { status: 500 });
    }

    const { results } = await db.prepare(`
      SELECT 
        a.id, 
        a.full_name, 
        a.job_title, 
        a.status, 
        a.slug,
        e.name AS agency_name,
        (SELECT COUNT(*) FROM incidents WHERE actor_id = a.id) as incident_count
      FROM actors a
      LEFT JOIN entities e ON a.entity_id = e.id
      ORDER BY a.full_name ASC
    `).all();

    return NextResponse.json(results);
  } catch (error) {
    console.error("ACCOUNTABILITY_API_ERROR:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

interface Env {
  DB: D1Database;
}

export async function GET() {
  try {
    const context = await getCloudflareContext({ async: true });
    const db = (context.env as unknown as Env).DB;

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
        a.seo_description,
        e.name AS entity_name,
        e.sector_id,
        (SELECT COUNT(*) FROM incidents WHERE actor_id = a.id) as incident_count
      FROM actors a
      LEFT JOIN entities e ON a.entity_id = e.id
      ORDER BY incident_count DESC, a.full_name ASC
    `).all();

    // Standardized response object
    return NextResponse.json({ results: results || [] });
  } catch (error) {
    console.error("ACCOUNTABILITY_API_ERROR:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
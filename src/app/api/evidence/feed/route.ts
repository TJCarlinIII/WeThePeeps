import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface Env {
  DB: D1Database;
}

/**
 * GET: Fetches a list of the latest incidents with joined metadata
 * Supports an optional ?limit=X query parameter
 */
export async function GET(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const { results } = await db
      .prepare(`
        SELECT 
          i.id,
          i.title,
          i.slug,
          i.description,
          i.event_date,
          i.is_critical,
          a.full_name as actor_name,
          e.name as entity_name,
          s.title as statute_title
        FROM incidents i
        LEFT JOIN actors a ON i.actor_id = a.id
        LEFT JOIN entities e ON i.entity_id = e.id
        LEFT JOIN statutes s ON i.statute_id = s.id
        ORDER BY i.event_date DESC, i.created_at DESC
        LIMIT ?
      `)
      .bind(limit)
      .all();

    return NextResponse.json({ feed: results });
  } catch (error) {
    console.error("D1_FEED_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch evidence feed" }, 
      { status: 500 }
    );
  }
}
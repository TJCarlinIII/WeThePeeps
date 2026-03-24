import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import type { D1Database } from "@cloudflare/workers-types";

// REMOVE THIS LINE: export const runtime = "edge";

interface ActorBody {
  full_name: string;
  entity_id: number;
  job_title: string;
  status: string;
  slug: string;
  bio: string;
}

export async function GET() {
  try {
    const context = await getCloudflareContext({ async: true });
    const db = (context.env as unknown as { DB: D1Database }).DB;

    const { results } = await db.prepare(`
      SELECT 
        a.id, 
        a.full_name, 
        a.full_name AS name, 
        a.job_title, 
        a.status, 
        a.slug,
        a.bio,
        e.name AS agency_name
      FROM actors a
      LEFT JOIN entities e ON a.entity_id = e.id
      ORDER BY a.full_name ASC
    `).all();

    return NextResponse.json(results); 
  } catch (error) {
    console.error("DB_FETCH_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const context = await getCloudflareContext({ async: true });
    const db = (context.env as unknown as { DB: D1Database }).DB;
    const body = await request.json() as ActorBody;

    const { full_name, entity_id, job_title, status, slug, bio } = body;

    const result = await db.prepare(`
      INSERT INTO actors (full_name, entity_id, job_title, status, slug, bio)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(full_name, entity_id, job_title, status, slug, bio).run();

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("DB_INSERT_ERROR:", error);
    return NextResponse.json({ error: "Failed to commit record" }, { status: 500 });
  }
}
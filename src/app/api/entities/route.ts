import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface Env {
  DB: D1Database;
}

interface IncidentBody {
  id?: number;
  title: string;
  slug: string;
  description: string;
  sector_id?: number;
  entity_id?: number;
  actor_id?: number;
  statute_id?: number;
  status?: string;
  is_critical?: number;
  event_date?: string;
  seo_description?: string;
  seo_keywords?: string;
}

// 1. GET: Fetch incidents (usually for the admin list view)
export async function GET() {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  try {
    const { results } = await db
      .prepare("SELECT * FROM incidents ORDER BY created_at DESC")
      .all<IncidentBody>();
    
    return NextResponse.json({ results: results || [] });
  } catch (err) {
    console.error("INCIDENT_GET_ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 });
  }
}

// 2. POST: Create a new Incident record
export async function POST(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const body = (await req.json()) as IncidentBody;

  try {
    await db
      .prepare(`
        INSERT INTO incidents (
          title, slug, description, sector_id, entity_id, 
          actor_id, statute_id, status, is_critical, event_date,
          seo_description, seo_keywords
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        body.title,
        body.slug,
        body.description,
        body.sector_id ?? null,
        body.entity_id ?? null,
        body.actor_id ?? null,
        body.statute_id ?? null,
        body.status ?? 'pending',
        body.is_critical ?? 0,
        body.event_date ?? null,
        body.seo_description ?? null,
        body.seo_keywords ?? null
      )
      .run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("INCIDENT_POST_ERROR:", err);
    return NextResponse.json({ error: "Failed to create incident record" }, { status: 400 });
  }
}

// 3. DELETE: Remove an incident (Direct API call)
export async function DELETE(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    // Note: In a full cleanup, you'd call your deleteIncident action logic here
    // for now, we'll do the direct D1 delete.
    await db.prepare("DELETE FROM incidents WHERE id = ?").bind(Number(id)).run();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("INCIDENT_DELETE_ERROR:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
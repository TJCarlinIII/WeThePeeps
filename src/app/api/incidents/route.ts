import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface Env {
  DB: D1Database;
}

interface IncidentBody {
  id?: number;
  title: string;
  slug: string; // CRITICAL: Added for SEO/Routing
  description: string;
  actor_id?: number | null;
  entity_id?: number | null;
  sector_id?: number | null; // NEW: Added to match schema
  statute_id?: number | null;
  status?: string;
  is_critical?: number;
  event_date?: string;
  seo_description?: string;
  seo_keywords?: string;
}

const getDB = async () => {
  const ctx = await getCloudflareContext({ async: true });
  return (ctx.env as unknown as Env).DB;
};

// 1. GET: Comprehensive list for Admin/Feed
export async function GET() {
  const db = await getDB();
  try {
    const { results } = await db.prepare(`
      SELECT 
        i.*, 
        a.full_name as actor_name, 
        e.name as entity_name
      FROM incidents i
      LEFT JOIN actors a ON i.actor_id = a.id
      LEFT JOIN entities e ON i.entity_id = e.id
      ORDER BY i.event_date DESC, i.created_at DESC
    `).all();

    return NextResponse.json({ results: results || [] });
  } catch (err) {
    console.error("INCIDENT_GET_FAILURE:", err);
    return NextResponse.json([], { status: 500 });
  }
}

// 2. POST: Complete Ingress with SEO and Slugs
export async function POST(request: Request) {
  const db = await getDB();
  try {
    const body = (await request.json()) as IncidentBody;

    const {
      title,
      slug,
      description,
      actor_id = null,
      entity_id = null,
      sector_id = null,
      statute_id = null,
      status = 'pending',
      is_critical = 0,
      event_date,
      seo_description = null,
      seo_keywords = null
    } = body;

    if (!title || !slug || !description) {
      return NextResponse.json({ error: "Missing: title, slug, or description" }, { status: 400 });
    }

    const result = await db.prepare(`
      INSERT INTO incidents (
        title, slug, description, actor_id, entity_id, sector_id, 
        statute_id, status, is_critical, event_date, seo_description, seo_keywords
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      title, slug, description, actor_id, entity_id, sector_id,
      statute_id, status, is_critical, 
      event_date || new Date().toISOString(),
      seo_description, seo_keywords
    )
    .run();

    return NextResponse.json({ success: true, id: result.meta.last_row_id });

  } catch (err) {
    console.error("INCIDENT_POST_FAILURE:", err);
    return NextResponse.json({ error: "D1_INGRESS_FAILURE" }, { status: 500 });
  }
}
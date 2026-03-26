// File: src/app/api/entities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface Env {
  DB: D1Database;
}

interface EntityBody {
  id?: number;
  name: string;
  sector_id: number;
  description?: string;
  slug: string;
  seo_description?: string;
  seo_keywords?: string;
}

// 1. GET: Fetch entities
export async function GET() {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  try {
    const { results } = await db
      .prepare(`
        SELECT e.*, s.name as sector_name 
        FROM entities e 
        LEFT JOIN sectors s ON e.sector_id = s.id 
        ORDER BY e.name ASC
      `)
      .all<EntityBody>();
    
    return NextResponse.json({ results: results || [] });
  } catch (err) {
    console.error("ENTITY_GET_ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch entities" }, { status: 500 });
  }
}

// 2. POST: Create a new Entity record
export async function POST(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const body = (await req.json()) as EntityBody;

  try {
    await db
      .prepare(`
        INSERT INTO entities (name, sector_id, description, slug, seo_description, seo_keywords) 
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        body.name,
        body.sector_id,
        body.description || null,
        body.slug,
        body.seo_description || null,
        body.seo_keywords || null
      )
      .run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ENTITY_POST_ERROR:", err);
    return NextResponse.json({ error: "Failed to create entity record" }, { status: 400 });
  }
}

// 3. PATCH: Update an Entity record
export async function PATCH(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const body = (await req.json()) as EntityBody;

  try {
    await db
      .prepare(`
        UPDATE entities 
        SET name = ?, sector_id = ?, description = ?, slug = ?, seo_description = ?, seo_keywords = ?
        WHERE id = ?
      `)
      .bind(
        body.name,
        body.sector_id,
        body.description || null,
        body.slug,
        body.seo_description || null,
        body.seo_keywords || null,
        body.id
      )
      .run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ENTITY_PATCH_ERROR:", err);
    return NextResponse.json({ error: "Failed to update entity record" }, { status: 400 });
  }
}

// 4. DELETE: Remove an entity
export async function DELETE(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await db.prepare("DELETE FROM entities WHERE id = ?").bind(Number(id)).run();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ENTITY_DELETE_ERROR:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
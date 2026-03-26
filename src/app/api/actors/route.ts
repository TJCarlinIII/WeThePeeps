import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface Env { DB: D1Database; }

interface ActorBody {
  id?: number;
  full_name: string;
  entity_id: number;
  job_title: string;
  status: string;
  slug: string;
  bio?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
}

// Standardized DB helper for all methods
const getDB = async () => {
  const ctx = await getCloudflareContext({ async: true });
  return (ctx.env as unknown as Env).DB;
};

// 1. GET: Fetch actors with their organization info
export async function GET() {
  const db = await getDB();
  try {
    const { results } = await db.prepare(`
      SELECT 
        a.*, 
        e.name as entity_name, 
        e.sector_id as sector_id
      FROM actors a 
      LEFT JOIN entities e ON a.entity_id = e.id 
      ORDER BY a.full_name ASC
    `).all();
    
    return NextResponse.json({ results });
  } catch (err) {
    console.error("ACTOR_GET_ERROR:", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

// 2. POST: Create a new Actor
export async function POST(req: NextRequest) {
  const db = await getDB();
  const b = (await req.json()) as ActorBody;
  try {
    await db.prepare(`
      INSERT INTO actors (full_name, entity_id, job_title, status, slug, bio, seo_description, seo_keywords) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      b.full_name, 
      b.entity_id || null, 
      b.job_title, 
      b.status, 
      b.slug, 
      b.bio || null, 
      b.seo_description || null, 
      b.seo_keywords || null
    ).run();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ACTOR_POST_ERROR:", err);
    return NextResponse.json({ error: "Insert failed" }, { status: 400 });
  }
}

// 3. PATCH: Update Actor Details
export async function PATCH(req: NextRequest) {
  const db = await getDB();
  const b = (await req.json()) as ActorBody;
  try {
    await db.prepare(`
      UPDATE actors 
      SET full_name = ?, entity_id = ?, job_title = ?, status = ?, slug = ?, bio = ?, seo_description = ?, seo_keywords = ?
      WHERE id = ?
    `).bind(
      b.full_name, 
      b.entity_id || null, 
      b.job_title, 
      b.status, 
      b.slug, 
      b.bio || null, 
      b.seo_description || null, 
      b.seo_keywords || null, 
      b.id
    ).run();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ACTOR_PATCH_ERROR:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// 4. DELETE: Cascade remove Actor and their taxonomy links
export async function DELETE(req: NextRequest) {
  const db = await getDB();
  const id = new URL(req.url).searchParams.get("id");
  
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    // We use a batch delete to clean up the taxonomy links associated with this actor
    await db.batch([
      db.prepare("DELETE FROM actors WHERE id = ?").bind(Number(id)),
      db.prepare("DELETE FROM record_taxonomy WHERE parent_id = ? AND parent_type = 'actor'").bind(Number(id))
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ACTOR_DELETE_ERROR:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
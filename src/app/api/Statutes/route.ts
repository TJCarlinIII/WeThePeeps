import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface Env {
  DB: D1Database;
}

interface StatuteBody {
  id?: number;
  citation: string;
  title: string;
  category?: string; // Links to taxonomy_definitions slug or name
  slug: string;
  description?: string;
  seo_description?: string;
  seo_keywords?: string;
}

const getDB = async () => {
  const ctx = await getCloudflareContext({ async: true });
  return (ctx.env as unknown as Env).DB;
};

// 1. GET: Fetch all statutes for dropdowns/lists
export async function GET() {
  const db = await getDB();
  try {
    const { results } = await db
      .prepare("SELECT * FROM statutes ORDER BY citation ASC")
      .all<StatuteBody>();
    
    // Wrapping in { results } for frontend consistency
    return NextResponse.json({ results: results || [] });
  } catch (err) {
    console.error("STATUTE_GET_ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch statutes" }, { status: 500 });
  }
}

// 2. POST: Create a new legal citation
export async function POST(req: NextRequest) {
  const db = await getDB();
  const b = (await req.json()) as StatuteBody;

  try {
    await db
      .prepare(`
        INSERT INTO statutes (citation, title, category, slug, description, seo_description, seo_keywords)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        b.citation,
        b.title,
        b.category ?? null,
        b.slug,
        b.description ?? null,
        b.seo_description ?? null,
        b.seo_keywords ?? null
      )
      .run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("STATUTE_POST_ERROR:", err);
    return NextResponse.json({ error: "Duplicate citation or slug" }, { status: 400 });
  }
}

// 3. PATCH: Update existing statute
export async function PATCH(req: NextRequest) {
  const db = await getDB();
  const b = (await req.json()) as StatuteBody;

  try {
    await db
      .prepare(`
        UPDATE statutes 
        SET citation = ?, title = ?, category = ?, slug = ?, description = ?, seo_description = ?, seo_keywords = ?
        WHERE id = ?
      `)
      .bind(
        b.citation,
        b.title,
        b.category ?? null,
        b.slug,
        b.description ?? null,
        b.seo_description ?? null,
        b.seo_keywords ?? null,
        b.id
      )
      .run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("STATUTE_PATCH_ERROR:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// 4. DELETE: Remove statute
export async function DELETE(req: NextRequest) {
  const db = await getDB();
  const id = new URL(req.url).searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await db.prepare("DELETE FROM statutes WHERE id = ?").bind(Number(id)).run();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("STATUTE_DELETE_ERROR:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
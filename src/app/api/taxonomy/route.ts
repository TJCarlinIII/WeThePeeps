import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface Env {
  DB: D1Database;
}

interface TaxonomyBody {
  id?: number;
  name: string;
  type: string;
  slug: string;
  seo_description?: string;
  seo_keywords?: string;
}

// 1. GET: Fetch all taxonomy terms
export async function GET() {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  try {
    const { results } = await db
      .prepare("SELECT * FROM taxonomy_definitions ORDER BY type DESC, name ASC")
      .all();
    
    // Keying this as 'terms' to provide a consistent object structure for the frontend
    return NextResponse.json({ terms: results });
  } catch (error) {
    console.error("D1_FETCH_ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch taxonomy" }, { status: 500 });
  }
}

// 2. POST: Create a new term
export async function POST(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const body = await req.json() as TaxonomyBody;

  try {
    await db
      .prepare("INSERT INTO taxonomy_definitions (name, type, slug, seo_description, seo_keywords) VALUES (?, ?, ?, ?, ?)")
      .bind(
        body.name, 
        body.type, 
        body.slug, 
        body.seo_description ?? null, 
        body.seo_keywords ?? null
      )
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("D1_INSERT_ERROR:", error);
    return NextResponse.json({ error: "Duplicate or invalid term" }, { status: 400 });
  }
}

// 3. PATCH: Update an existing term
export async function PATCH(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const body = await req.json() as TaxonomyBody;

  try {
    if (!body.id) {
      return NextResponse.json({ error: "ID required for update" }, { status: 400 });
    }

    await db
      .prepare("UPDATE taxonomy_definitions SET name = ?, type = ?, slug = ?, seo_description = ?, seo_keywords = ? WHERE id = ?")
      .bind(
        body.name, 
        body.type, 
        body.slug, 
        body.seo_description ?? null, 
        body.seo_keywords ?? null, 
        body.id
      )
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("D1_UPDATE_ERROR:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// 4. DELETE: Remove a term and all its associations
export async function DELETE(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    // We first need to fetch the slug to ensure we clean up 
    // links that use the slug instead of the ID.
    const term = await db
      .prepare("SELECT slug FROM taxonomy_definitions WHERE id = ?")
      .bind(Number(id))
      .first<{ slug: string }>();

    if (!term) {
      return NextResponse.json({ error: "Term not found" }, { status: 404 });
    }

    await db.batch([
      // 1. Remove the actual definition
      db.prepare("DELETE FROM taxonomy_definitions WHERE id = ?").bind(Number(id)),
      
      // 2. Remove any links in record_taxonomy using the ID
      db.prepare("DELETE FROM record_taxonomy WHERE taxonomy_value = ?").bind(id),
      
      // 3. Remove any links in record_taxonomy using the Slug (for safety)
      db.prepare("DELETE FROM record_taxonomy WHERE taxonomy_value = ?").bind(term.slug)
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("D1_DELETE_CASCADE_ERROR:", error);
    return NextResponse.json({ error: "Delete failed during cleanup" }, { status: 500 });
  }
}
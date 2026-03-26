import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface Env {
  DB: D1Database;
}

interface SectorBody {
  id?: number;
  name: string;
  slug: string;
  seo_description?: string;
  seo_keywords?: string;
}

// 1. GET: Fetch all sectors for the dropdowns and sitemap
export async function GET() {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  try {
    const { results } = await db
      .prepare("SELECT * FROM sectors ORDER BY name ASC")
      .all<SectorBody>();
    
    // Using { results } to match your frontend expectation
    return NextResponse.json({ results: results || [] });
  } catch (err) {
    console.error("SECTOR_GET_ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch sectors" }, { status: 500 });
  }
}

// 2. POST: Create a new high-level Sector
export async function POST(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const body = (await req.json()) as SectorBody;

  try {
    await db
      .prepare(`
        INSERT INTO sectors (name, slug, seo_description, seo_keywords) 
        VALUES (?, ?, ?, ?)
      `)
      .bind(
        body.name,
        body.slug,
        body.seo_description ?? null,
        body.seo_keywords ?? null
      )
      .run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SECTOR_POST_ERROR:", err);
    return NextResponse.json({ error: "Failed to create sector (Slug may already exist)" }, { status: 400 });
  }
}
// File: src/app/api/Statutes/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface Env { DB: D1Database; }

interface TaxRecord {
  parent_id: number;
  taxonomy_type: string;
  taxonomy_value: string;
}

interface StatutePayload {
  id?: number;
  citation: string;
  title: string;
  category?: string;
  slug: string;
  summary?: string;
  legal_text?: string;
  seo_description?: string;
  seo_keywords?: string;
  official_website_url?: string;
  categories?: string[];
  tags?: string[];
}

export async function GET() {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  try {
    const { results } = await db.prepare("SELECT * FROM statutes ORDER BY citation ASC").all();

    const { results: tax } = await db.prepare("SELECT parent_id, taxonomy_type, taxonomy_value FROM record_taxonomy WHERE parent_type = 'statute'").all<TaxRecord>();

    const mapped = results.map((r: Record<string, unknown>) => ({
      ...r,
      categories: tax.filter((t) => t.parent_id === Number(r.id) && t.taxonomy_type === 'category').map((t) => t.taxonomy_value),
      tags: tax.filter((t) => t.parent_id === Number(r.id) && t.taxonomy_type === 'tag').map((t) => t.taxonomy_value),
    }));

    return NextResponse.json({ results: mapped });
  } catch (err) {
    console.error("STATUTE_GET_ERROR:", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const body = await req.json() as StatutePayload;

  try {
    const res = await db.prepare(`
      INSERT INTO statutes (citation, title, category, slug, summary, legal_text, seo_description, seo_keywords, official_website_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
    `).bind(
      body.citation, body.title, body.category || null, body.slug, body.summary || null, 
      body.legal_text || null, body.seo_description || null, body.seo_keywords || null, body.official_website_url || null
    ).first<{id: number}>();

    const parentId = res?.id;
    if (parentId) {
      const stmts = [];
      for (const cat of (body.categories || [])) {
        if(cat) stmts.push(db.prepare("INSERT INTO record_taxonomy (parent_id, parent_type, taxonomy_type, taxonomy_value) VALUES (?, 'statute', 'category', ?)").bind(parentId, cat));
      }
      for (const tag of (body.tags || [])) {
        if(tag) stmts.push(db.prepare("INSERT INTO record_taxonomy (parent_id, parent_type, taxonomy_type, taxonomy_value) VALUES (?, 'statute', 'tag', ?)").bind(parentId, tag));
      }
      if(stmts.length > 0) await db.batch(stmts);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("STATUTE_POST_ERROR:", err);
    return NextResponse.json({ error: "Creation failed" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const body = await req.json() as StatutePayload;

  try {
    await db.prepare(`
      UPDATE statutes 
      SET citation=?, title=?, category=?, slug=?, summary=?, legal_text=?, seo_description=?, seo_keywords=?, official_website_url=?
      WHERE id=?
    `).bind(
      body.citation, body.title, body.category || null, body.slug, body.summary || null, 
      body.legal_text || null, body.seo_description || null, body.seo_keywords || null, body.official_website_url || null, body.id
    ).run();

    await db.prepare("DELETE FROM record_taxonomy WHERE parent_id = ? AND parent_type = 'statute'").bind(body.id).run();
    const stmts = [];
    for (const cat of (body.categories || [])) {
      if(cat) stmts.push(db.prepare("INSERT INTO record_taxonomy (parent_id, parent_type, taxonomy_type, taxonomy_value) VALUES (?, 'statute', 'category', ?)").bind(body.id, cat));
    }
    for (const tag of (body.tags || [])) {
      if(tag) stmts.push(db.prepare("INSERT INTO record_taxonomy (parent_id, parent_type, taxonomy_type, taxonomy_value) VALUES (?, 'statute', 'tag', ?)").bind(body.id, tag));
    }
    if(stmts.length > 0) await db.batch(stmts);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("STATUTE_PATCH_ERROR:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const id = new URL(req.url).searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await db.batch([
      db.prepare("DELETE FROM statutes WHERE id = ?").bind(Number(id)),
      db.prepare("DELETE FROM record_taxonomy WHERE parent_id = ? AND parent_type = 'statute'").bind(Number(id))
    ]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("STATUTE_DELETE_ERROR:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
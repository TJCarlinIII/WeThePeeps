// File: src/app/api/sectors/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface Env { DB: D1Database; }

interface TaxRecord {
  parent_id: number;
  taxonomy_type: string;
  taxonomy_value: string;
}

interface SectorPayload {
  id?: number;
  name: string;
  slug: string;
  seo_description?: string;
  seo_keywords?: string;
  categories?: string[];
  tags?: string[];
}

export async function GET() {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  try {
    const { results } = await db.prepare("SELECT * FROM sectors ORDER BY name ASC").all();
    const { results: tax } = await db.prepare("SELECT parent_id, taxonomy_type, taxonomy_value FROM record_taxonomy WHERE parent_type = 'sector'").all<TaxRecord>();

    const mapped = results.map((r: Record<string, unknown>) => ({
      ...r,
      categories: tax.filter((t) => t.parent_id === Number(r.id) && t.taxonomy_type === 'category').map((t) => t.taxonomy_value),
      tags: tax.filter((t) => t.parent_id === Number(r.id) && t.taxonomy_type === 'tag').map((t) => t.taxonomy_value),
    }));
    
    return NextResponse.json({ results: mapped });
  } catch (err) {
    console.error("SECTOR_GET_ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch sectors" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const body = await req.json() as SectorPayload;

  try {
    const res = await db.prepare(`
      INSERT INTO sectors (name, slug, seo_description, seo_keywords) 
      VALUES (?, ?, ?, ?) RETURNING id
    `).bind(body.name, body.slug, body.seo_description || null, body.seo_keywords || null).first<{id: number}>();

    const parentId = res?.id;
    if (parentId) {
      const stmts = [];
      for (const cat of (body.categories || [])) {
        if(cat) stmts.push(db.prepare("INSERT INTO record_taxonomy (parent_id, parent_type, taxonomy_type, taxonomy_value) VALUES (?, 'sector', 'category', ?)").bind(parentId, cat));
      }
      for (const tag of (body.tags || [])) {
        if(tag) stmts.push(db.prepare("INSERT INTO record_taxonomy (parent_id, parent_type, taxonomy_type, taxonomy_value) VALUES (?, 'sector', 'tag', ?)").bind(parentId, tag));
      }
      if(stmts.length > 0) await db.batch(stmts);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SECTOR_POST_ERROR:", err);
    return NextResponse.json({ error: "Failed to create sector" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const body = await req.json() as SectorPayload;

  try {
    await db.prepare(`
      UPDATE sectors SET name=?, slug=?, seo_description=?, seo_keywords=? WHERE id=?
    `).bind(body.name, body.slug, body.seo_description || null, body.seo_keywords || null, body.id).run();

    await db.prepare("DELETE FROM record_taxonomy WHERE parent_id = ? AND parent_type = 'sector'").bind(body.id).run();
    const stmts = [];
    for (const cat of (body.categories || [])) {
      if(cat) stmts.push(db.prepare("INSERT INTO record_taxonomy (parent_id, parent_type, taxonomy_type, taxonomy_value) VALUES (?, 'sector', 'category', ?)").bind(body.id, cat));
    }
    for (const tag of (body.tags || [])) {
      if(tag) stmts.push(db.prepare("INSERT INTO record_taxonomy (parent_id, parent_type, taxonomy_type, taxonomy_value) VALUES (?, 'sector', 'tag', ?)").bind(body.id, tag));
    }
    if(stmts.length > 0) await db.batch(stmts);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SECTOR_PATCH_ERROR:", err);
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
      db.prepare("DELETE FROM sectors WHERE id=?").bind(Number(id)),
      db.prepare("DELETE FROM record_taxonomy WHERE parent_id = ? AND parent_type = 'sector'").bind(Number(id))
    ]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SECTOR_DELETE_ERROR:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
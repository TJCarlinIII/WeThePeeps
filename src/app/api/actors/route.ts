// File: src/app/api/actors/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface Env { DB: D1Database; }

interface TaxRecord {
  parent_id: number;
  taxonomy_type: string;
  taxonomy_value: string;
}

interface ActorPayload {
  id?: number;
  full_name: string;
  entity_id: number | string | null;
  job_title: string;
  status: string;
  slug: string;
  bio?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  official_website_url?: string | null;
  categories?: string[];
  tags?: string[];
}

export async function GET() {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;

  try {
    // Updated query to include rebuttal count
    const { results } = await db.prepare(`
      SELECT a.*, e.name as entity_name, e.sector_id,
        (SELECT COUNT(*) FROM rebuttals r WHERE r.actor_id = a.id) as rebuttal_count
      FROM actors a 
      LEFT JOIN entities e ON a.entity_id = e.id 
      ORDER BY a.full_name ASC
    `).all();

    const { results: tax } = await db.prepare("SELECT parent_id, taxonomy_type, taxonomy_value FROM record_taxonomy WHERE parent_type = 'actor'").all<TaxRecord>();

    const mapped = results.map((r: Record<string, unknown>) => ({
      ...r,
      categories: tax.filter((t) => t.parent_id === Number(r.id) && t.taxonomy_type === 'category').map((t) => t.taxonomy_value),
      tags: tax.filter((t) => t.parent_id === Number(r.id) && t.taxonomy_type === 'tag').map((t) => t.taxonomy_value),
    }));

    return NextResponse.json({ results: mapped });
  } catch (err) {
    console.error("ACTOR_GET_ERROR:", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const body = await req.json() as ActorPayload;

  try {
    const res = await db.prepare(`
      INSERT INTO actors (full_name, entity_id, job_title, status, slug, bio, seo_description, seo_keywords, official_website_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
    `).bind(
      body.full_name, body.entity_id || null, body.job_title, body.status, body.slug, 
      body.bio || null, body.seo_description || null, body.seo_keywords || null, body.official_website_url || null
    ).first<{id: number}>();

    const parentId = res?.id;
    if (parentId) {
      const stmts = [];
      for (const cat of (body.categories || [])) {
        if(cat) stmts.push(db.prepare("INSERT INTO record_taxonomy (parent_id, parent_type, taxonomy_type, taxonomy_value) VALUES (?, 'actor', 'category', ?)").bind(parentId, cat));
      }
      for (const tag of (body.tags || [])) {
        if(tag) stmts.push(db.prepare("INSERT INTO record_taxonomy (parent_id, parent_type, taxonomy_type, taxonomy_value) VALUES (?, 'actor', 'tag', ?)").bind(parentId, tag));
      }
      if(stmts.length > 0) await db.batch(stmts);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ACTOR_POST_ERROR:", err);
    return NextResponse.json({ error: "Creation failed" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const body = await req.json() as ActorPayload;

  try {
    await db.prepare(`
      UPDATE actors 
      SET full_name=?, entity_id=?, job_title=?, status=?, slug=?, bio=?, seo_description=?, seo_keywords=?, official_website_url=?
      WHERE id=?
    `).bind(
      body.full_name, body.entity_id || null, body.job_title, body.status, body.slug, 
      body.bio || null, body.seo_description || null, body.seo_keywords || null, body.official_website_url || null, body.id
    ).run();

    await db.prepare("DELETE FROM record_taxonomy WHERE parent_id = ? AND parent_type = 'actor'").bind(body.id).run();
    const stmts = [];
    for (const cat of (body.categories || [])) {
      if(cat) stmts.push(db.prepare("INSERT INTO record_taxonomy (parent_id, parent_type, taxonomy_type, taxonomy_value) VALUES (?, 'actor', 'category', ?)").bind(body.id, cat));
    }
    for (const tag of (body.tags || [])) {
      if(tag) stmts.push(db.prepare("INSERT INTO record_taxonomy (parent_id, parent_type, taxonomy_type, taxonomy_value) VALUES (?, 'actor', 'tag', ?)").bind(body.id, tag));
    }
    if(stmts.length > 0) await db.batch(stmts);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ACTOR_PATCH_ERROR:", err);
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
      db.prepare("DELETE FROM actors WHERE id = ?").bind(Number(id)),
      db.prepare("DELETE FROM record_taxonomy WHERE parent_id = ? AND parent_type = 'actor'").bind(Number(id))
    ]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ACTOR_DELETE_ERROR:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
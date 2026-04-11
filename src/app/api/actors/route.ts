// src/app/api/actors/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface Env { DB: D1Database; }

interface ActorPayload {
  id?: number;
  full_name: string;
  entity_id: number | string | null;
  job_title: string;
  status: 'active' | 'under_review' | 'former';
  slug: string;
  bio?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  official_website_url?: string | null;
  cdn_image_url?: string | null;
  map_icon?: 'badge' | 'justice' | 'pharmacia' | 'suit' | 'money';
  categories?: string[];
  tags?: string[];
}

export async function GET() {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  
  try {
    const { results } = await db.prepare(`
      SELECT 
        a.*, 
        e.name as entity_name, 
        e.sector_id,
        (SELECT COUNT(*) FROM incidents i WHERE i.actor_id = a.id) as incident_count,
        (SELECT COUNT(*) FROM rebuttals r WHERE r.actor_id = a.id) as rebuttal_count
      FROM actors a
      LEFT JOIN entities e ON a.entity_id = e.id
      ORDER BY a.full_name ASC
    `).all();
    
    const { results: tax } = await db.prepare(
      "SELECT parent_id, taxonomy_type, taxonomy_value FROM record_taxonomy WHERE parent_type = 'actor'"
    ).all();
    
    const mapped = results.map((r: any) => ({
      ...r,
      categories: (tax || []).filter((t: any) => t.parent_id === r.id && t.taxonomy_type === 'category').map((t: any) => t.taxonomy_value),
      tags: (tax || []).filter((t: any) => t.parent_id === r.id && t.taxonomy_type === 'tag').map((t: any) => t.taxonomy_value),
    }));
    
    return NextResponse.json({ results: mapped });
  } catch (err) {
    return NextResponse.json({ error: "FETCH_FAILED" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const body = await req.json() as ActorPayload;
  
  try {
    // Note: included cdn_image_url and map_icon for the new theme's visual identity
    const res = await db.prepare(`
      INSERT INTO actors (
        full_name, entity_id, job_title, status, slug, 
        bio, seo_description, seo_keywords, official_website_url, 
        cdn_image_url, map_icon
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
    `).bind(
      body.full_name, body.entity_id || null, body.job_title, body.status, body.slug,
      body.bio || null, body.seo_description || null, body.seo_keywords || null, 
      body.official_website_url || null, body.cdn_image_url || null, body.map_icon || 'badge'
    ).first<{id: number}>();
    
    if (res?.id) {
      await updateTaxonomy(db, res.id, body.categories || [], body.tags || []);
    }
    
    return NextResponse.json({ success: true, id: res?.id });
  } catch (err) {
    console.error("ACTOR_POST_ERROR:", err);
    return NextResponse.json({ error: "CREATION_FAILED" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const body = await req.json() as ActorPayload;
  
  try {
    await db.prepare(`
      UPDATE actors
      SET full_name=?, entity_id=?, job_title=?, status=?, slug=?, 
          bio=?, seo_description=?, seo_keywords=?, official_website_url=?,
          cdn_image_url=?, map_icon=?
      WHERE id=?
    `).bind(
      body.full_name, body.entity_id || null, body.job_title, body.status, body.slug,
      body.bio || null, body.seo_description || null, body.seo_keywords || null, 
      body.official_website_url || null, body.cdn_image_url || null, body.map_icon || 'badge',
      body.id
    ).run();
    
    await updateTaxonomy(db, body.id!, body.categories || [], body.tags || []);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 400 });
  }
}

// Helper to keep the logic clean
async function updateTaxonomy(db: D1Database, parentId: number, categories: string[], tags: string[]) {
  const stmts = [
    db.prepare("DELETE FROM record_taxonomy WHERE parent_id = ? AND parent_type = 'actor'").bind(parentId)
  ];

  categories.forEach(cat => {
    if(cat) stmts.push(db.prepare("INSERT INTO record_taxonomy (parent_id, parent_type, taxonomy_type, taxonomy_value) VALUES (?, 'actor', 'category', ?)").bind(parentId, cat));
  });

  tags.forEach(tag => {
    if(tag) stmts.push(db.prepare("INSERT INTO record_taxonomy (parent_id, parent_type, taxonomy_type, taxonomy_value) VALUES (?, 'actor', 'tag', ?)").bind(parentId, tag));
  });

  return await db.batch(stmts);
}
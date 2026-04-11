// src/app/api/modules/incidents/statutes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getWtpDB } from "@/lib/wtp-db";

interface Env {
  NEW_DB: D1Database;
}

const getDB = async () => {
  const ctx = await getCloudflareContext({ async: true });
  return (ctx.env as unknown as Env).NEW_DB;
};

// ✅ Type interface for the POST request body
interface StatuteLinkBody {
  incident_id: number;
  statute_id?: number | null;
  create_new_statute?: boolean;
  new_statute_data?: {
    citation: string;
    title: string;
    slug: string;
    summary?: string;
    legal_text?: string;
    jurisdiction?: 'Federal' | 'State' | 'Local';
    jurisdiction_body?: string;
    status?: 'active' | 'repealed' | 'amended';
    effective_date?: string;
    official_url?: string;
    seo_description?: string;
    seo_keywords?: string;
  };
  violation_context: string; // Required: how this statute was violated in this incident
}

// GET: List statute links for a specific incident
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const incidentId = searchParams.get("incident_id");
  
  if (!incidentId) {
    return NextResponse.json({ error: "incident_id required" }, { status: 400 });
  }
  
  try {
    const db = await getWtpDB();
    const { results } = await db.prepare(`
      SELECT 
        ist.*,
        s.citation,
        s.title as statute_title,
        s.jurisdiction,
        s.official_url
      FROM incident_statutes ist
      LEFT JOIN statutes s ON ist.statute_id = s.id
      WHERE ist.incident_id = ?
      ORDER BY ist.created_at ASC
    `).bind(incidentId).all();
    
    return NextResponse.json({ results: results || [] });
  } catch (err) {
    console.error("STATUTES_GET_ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch statute links" }, { status: 500 });
  }
}

// POST: Link statute to an incident (with optional inline statute creation)
export async function POST(request: NextRequest) {
  try {
    const db = await getWtpDB();
    // ✅ TYPE THE BODY to fix "property does not exist on type 'unknown'"
    const body = (await request.json()) as StatuteLinkBody;
    
    const {
      incident_id,
      statute_id,
      create_new_statute,
      new_statute_data,
      violation_context
    } = body;
    
    let finalStatuteId = statute_id;
    
    // If creating new statute inline, insert it first
    if (create_new_statute && new_statute_data) {
      const {
        citation,
        title,
        slug,
        summary,
        legal_text,
        jurisdiction = 'State',
        jurisdiction_body,
        status = 'active',
        effective_date,
        official_url,
        seo_description,
        seo_keywords
      } = new_statute_data;
      
      if (!citation || !title || !slug) {
        return NextResponse.json({ error: "New statute requires citation, title, and slug" }, { status: 400 });
      }
      
      const statuteResult = await db.prepare(`
        INSERT INTO statutes (
          citation, title, slug, summary, legal_text, jurisdiction,
          jurisdiction_body, status, effective_date, official_url,
          seo_description, seo_keywords
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        citation, title, slug, summary || null, legal_text || null, jurisdiction,
        jurisdiction_body || null, status, effective_date || null, official_url || null,
        seo_description || null, seo_keywords || null
      ).run();
      
      finalStatuteId = statuteResult.meta.last_row_id;
    }
    
    // Now insert the join table entry
    const result = await db.prepare(`
      INSERT INTO incident_statutes (
        incident_id, statute_id, violation_context
      ) VALUES (?, ?, ?)
    `).bind(
      incident_id,
      finalStatuteId,
      violation_context
    ).run();
    
    return NextResponse.json({ 
      success: true, 
      id: result.meta.last_row_id,
      statute_id: finalStatuteId 
    });
    
  } catch (err) {
    console.error("STATUTES_POST_ERROR:", err);
    return NextResponse.json({ error: "Failed to link statute" }, { status: 500 });
  }
}

// DELETE: Remove a statute link (does NOT delete the statute record)
export async function DELETE(request: NextRequest) {
  try {
    const db = await getWtpDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    
    await db.prepare("DELETE FROM incident_statutes WHERE id = ?").bind(id).run();
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("STATUTES_DELETE_ERROR:", err);
    return NextResponse.json({ error: "Failed to remove statute link" }, { status: 500 });
  }
}
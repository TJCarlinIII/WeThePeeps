// src/app/admin/modules/incidents/evidence/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare"; // ✅ ADD THIS IMPORT
import { getWtpDB } from "@/lib/wtp-db";

interface Env {
  NEW_DB: D1Database;
}

const getDB = async () => {
  const ctx = await getCloudflareContext({ async: true });
  return (ctx.env as unknown as Env).NEW_DB;
};

// ✅ Type interface for the POST request body
interface EvidenceLinkBody {
  incident_id: number;
  evidence_id?: number | null;
  create_new_evidence?: boolean;
  new_evidence_data?: {
    title: string;
    description?: string;
    category?: string;
    file_url: string;
    file_type?: string;
    is_critical?: boolean | number;
  };
  is_rebuttal?: boolean | number;
  rebuttal_target_actor_id?: number | null;
  rebuttal_text?: string;
  display_order?: number;
}

// GET: List evidence links for a specific incident
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
        ie.*,
        e.title as evidence_title,
        e.category,
        e.file_url,
        a.full_name as rebuttal_target_name
      FROM incident_evidence ie
      LEFT JOIN evidence e ON ie.evidence_id = e.id
      LEFT JOIN actors a ON ie.rebuttal_target_actor_id = a.id
      WHERE ie.incident_id = ?
      ORDER BY ie.display_order ASC, ie.created_at ASC
    `).bind(incidentId).all();
    
    return NextResponse.json({ results: results || [] });
  } catch (err) {
    console.error("EVIDENCE_GET_ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch evidence links" }, { status: 500 });
  }
}

// POST: Link evidence to an incident (with optional inline evidence creation)
export async function POST(request: NextRequest) {
  try {
    const db = await getWtpDB();
    // ✅ TYPE THE BODY to fix "property does not exist on type 'unknown'"
    const body = (await request.json()) as EvidenceLinkBody;
    
    const {
      incident_id,
      evidence_id,
      create_new_evidence,
      new_evidence_data,
      is_rebuttal = 0,
      rebuttal_target_actor_id = null,
      rebuttal_text = undefined,
      display_order = 0
    } = body;
    
    let finalEvidenceId = evidence_id;
    
    // If creating new evidence inline, insert it first
    if (create_new_evidence && new_evidence_data) {
      const { title, description, category, file_url, file_type, is_critical = 0 } = new_evidence_data;
      
      if (!title || !file_url) {
        return NextResponse.json({ error: "New evidence requires title and file_url" }, { status: 400 });
      }
      
      const evidenceResult = await db.prepare(`
        INSERT INTO evidence (title, description, category, file_url, file_type, is_critical)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(title, description || null, category || null, file_url, file_type || null, is_critical ? 1 : 0).run();
      
      finalEvidenceId = evidenceResult.meta.last_row_id;
    }
    
    // Now insert the join table entry
    const result = await db.prepare(`
      INSERT INTO incident_evidence (
        incident_id, evidence_id, is_rebuttal, rebuttal_target_actor_id, rebuttal_text, display_order
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      incident_id,
      finalEvidenceId,
      is_rebuttal ? 1 : 0,
      rebuttal_target_actor_id ?? null,
      rebuttal_text ?? null,
      display_order
    ).run();
    
    return NextResponse.json({ 
      success: true, 
      id: result.meta.last_row_id,
      evidence_id: finalEvidenceId 
    });
    
  } catch (err) {
    console.error("EVIDENCE_POST_ERROR:", err);
    return NextResponse.json({ error: "Failed to link evidence" }, { status: 500 });
  }
}

// DELETE: Remove an evidence link (does NOT delete the evidence record)
export async function DELETE(request: NextRequest) {
  try {
    const db = await getWtpDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    
    await db.prepare("DELETE FROM incident_evidence WHERE id = ?").bind(id).run();
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("EVIDENCE_DELETE_ERROR:", err);
    return NextResponse.json({ error: "Failed to remove evidence link" }, { status: 500 });
  }
}
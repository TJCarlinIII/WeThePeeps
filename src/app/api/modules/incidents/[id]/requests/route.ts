// src/app/api/modules/incidents/requests/route.ts
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
interface RecordsRequestLinkBody {
  incident_id: number;
  request_id?: number | null;
  create_new_request?: boolean;
  new_request_data?: {
    actor_id?: number | null;      // Who made the request
    entity_id?: number | null;     // Who was asked
    request_type: 'FOIA' | 'HIPAA' | 'Medical Records' | 'Internal Memo';
    request_date?: string;
    compliance_deadline?: string;
    status: 'pending' | 'fulfilled' | 'denied' | 'stonewalled' | 'appealed';
    fee_quoted?: number | null;
    fee_waiver_requested?: boolean | number;
    days_overdue?: number | null;
    description?: string;
  };
}

// GET: List records request links for a specific incident
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
        irr.*,
        rr.request_type,
        rr.request_date,
        rr.status,
        rr.fee_quoted,
        rr.description,
        a.full_name as requestor_name,
        e.name as target_entity_name
      FROM incident_requests irr
      LEFT JOIN records_requests rr ON irr.request_id = rr.id
      LEFT JOIN actors a ON rr.actor_id = a.id
      LEFT JOIN entities e ON rr.entity_id = e.id
      WHERE irr.incident_id = ?
      ORDER BY rr.request_date DESC, irr.created_at ASC
    `).bind(incidentId).all();
    
    return NextResponse.json({ results: results || [] });
  } catch (err) {
    console.error("REQUESTS_GET_ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch records request links" }, { status: 500 });
  }
}

// POST: Link records request to an incident (with optional inline request creation)
export async function POST(request: NextRequest) {
  try {
    const db = await getWtpDB();
    // ✅ TYPE THE BODY to fix "property does not exist on type 'unknown'"
    const body = (await request.json()) as RecordsRequestLinkBody;
    
    const {
      incident_id,
      request_id,
      create_new_request,
      new_request_data
    } = body;
    
    let finalRequestId = request_id;
    
    // If creating new request inline, insert it first
    if (create_new_request && new_request_data) {
      const {
        actor_id,
        entity_id,
        request_type,
        request_date,
        compliance_deadline,
        status,
        fee_quoted,
        fee_waiver_requested = 0,
        days_overdue,
        description
      } = new_request_data;
      
      if (!request_type) {
        return NextResponse.json({ error: "New request requires request_type" }, { status: 400 });
      }
      
      const requestResult = await db.prepare(`
        INSERT INTO records_requests (
          actor_id, entity_id, request_type, request_date, compliance_deadline,
          status, fee_quoted, fee_waiver_requested, days_overdue, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        actor_id ?? null,
        entity_id ?? null,
        request_type,
        request_date ?? null,
        compliance_deadline ?? null,
        status,
        fee_quoted ?? null,
        fee_waiver_requested ? 1 : 0,
        days_overdue ?? null,
        description ?? null
      ).run();
      
      finalRequestId = requestResult.meta.last_row_id;
    }
    
    // Now insert the join table entry
    const result = await db.prepare(`
      INSERT INTO incident_requests (
        incident_id, request_id
      ) VALUES (?, ?)
    `).bind(
      incident_id,
      finalRequestId
    ).run();
    
    return NextResponse.json({ 
      success: true, 
      id: result.meta.last_row_id,
      request_id: finalRequestId 
    });
    
  } catch (err) {
    console.error("REQUESTS_POST_ERROR:", err);
    return NextResponse.json({ error: "Failed to link records request" }, { status: 500 });
  }
}

// DELETE: Remove a records request link (does NOT delete the request record)
export async function DELETE(request: NextRequest) {
  try {
    const db = await getWtpDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    
    await db.prepare("DELETE FROM incident_requests WHERE id = ?").bind(id).run();
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("REQUESTS_DELETE_ERROR:", err);
    return NextResponse.json({ error: "Failed to remove records request link" }, { status: 500 });
  }
}
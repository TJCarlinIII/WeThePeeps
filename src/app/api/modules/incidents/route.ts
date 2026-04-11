// src/app/api/modules/incidents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getWtpDB } from "@/lib/wtp-db";// ✅ NEW: Explicit v2 database client
import type { 
  Incident, 
  IncidentParticipant, 
  IncidentEvidence,
  IncidentStatute,
  RecordsRequest
} from "@/lib/wtp-data-types";

interface Env {
  NEW_DB: D1Database;
}

// GET: Fetch incidents with joined counts
export async function GET(request: NextRequest) {
  try {
    const db = await getWtpDB(); // ✅ Explicitly uses wethepeeps-v2
    
    const { searchParams } = new URL(request.url);
    const incidentId = searchParams.get('id');
    
    if (incidentId) {
      // Fetch single incident with all joins
      const [incident, participants, evidence, statutes, requests] = await Promise.all([
        db.prepare("SELECT * FROM incidents WHERE id = ?").bind(incidentId).first<Incident>(),
        db.prepare("SELECT * FROM incident_participants WHERE incident_id = ?").bind(incidentId).all<IncidentParticipant>(),
        db.prepare("SELECT * FROM incident_evidence WHERE incident_id = ?").bind(incidentId).all<IncidentEvidence>(),
        db.prepare("SELECT * FROM incident_statutes WHERE incident_id = ?").bind(incidentId).all<IncidentStatute>(),
        db.prepare("SELECT * FROM records_requests WHERE incident_id = ?").bind(incidentId).all<RecordsRequest>(),
      ]);
      
      if (!incident) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      
      return NextResponse.json({
        incident,
        participants: participants.results || [],
        evidence: evidence.results || [],
        statutes: statutes.results || [],
        requests: requests.results || [],
      });
    }
    
    // Fetch list with counts
    const { results } = await db.prepare(`
      SELECT 
        i.*,
        (SELECT COUNT(*) FROM incident_participants WHERE incident_id = i.id) as participant_count,
        (SELECT COUNT(*) FROM incident_evidence WHERE incident_id = i.id) as evidence_count,
        (SELECT COUNT(*) FROM incident_statutes WHERE incident_id = i.id) as statute_count
      FROM incidents i
      ORDER BY i.event_date DESC, i.created_at DESC
      LIMIT 100
    `).all<Incident & { participant_count: number; evidence_count: number; statute_count: number }>();
    
    return NextResponse.json({ results: results || [] });
    
  } catch (err) {
    console.error("API_ERROR [incidents-v2]:", err);
    return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 });
  }
}

// POST: Create new incident
export async function POST(request: NextRequest) {
  try {
    const db = await getWtpDB(); // ✅ Explicitly uses wethepeeps-v2
    const body = await request.json() as Partial<Incident>;
    
    const result = await db.prepare(`
      INSERT INTO incidents (
        title, slug, event_date, description, status, is_critical,
        moral_violation_type, forensic_analysis, tactic_category, correlation_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.title, body.slug, body.event_date, body.description,
      body.status || 'pending', body.is_critical || 0,
      body.moral_violation_type, body.forensic_analysis,
      body.tactic_category, body.correlation_id
    ).run();
    
    return NextResponse.json({ success: true, id: result.meta.last_row_id });
    
  } catch (err) {
    console.error("API_ERROR [POST incidents-v2]:", err);
    return NextResponse.json({ error: "Failed to create incident" }, { status: 500 });
  }
}

// PATCH: Update incident
export async function PATCH(request: NextRequest) {
  try {
    const db = await getWtpDB(); // ✅ Explicitly uses wethepeeps-v2
    const body = await request.json() as Incident & { id: number };
    
    await db.prepare(`
      UPDATE incidents SET
        title = ?, slug = ?, event_date = ?, description = ?,
        status = ?, is_critical = ?, moral_violation_type = ?,
        forensic_analysis = ?, tactic_category = ?, correlation_id = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.title, body.slug, body.event_date, body.description,
      body.status, body.is_critical, body.moral_violation_type,
      body.forensic_analysis, body.tactic_category, body.correlation_id,
      body.id
    ).run();
    
    return NextResponse.json({ success: true });
    
  } catch (err) {
    console.error("API_ERROR [PATCH incidents-v2]:", err);
    return NextResponse.json({ error: "Failed to update incident" }, { status: 500 });
  }
}

// DELETE: Remove incident (cascades to join tables)
export async function DELETE(request: NextRequest) {
  try {
    const db = await getWtpDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    
    // Delete incident (ON DELETE CASCADE handles join tables if set up)
    await db.prepare("DELETE FROM incidents WHERE id = ?").bind(id).run();
    
    return NextResponse.json({ success: true });
    
  } catch (err) {
    console.error("DELETE_ERROR [incidents-v2]:", err);
    return NextResponse.json({ error: "Failed to delete incident" }, { status: 500 });
  }
}
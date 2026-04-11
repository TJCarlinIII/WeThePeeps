import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { getWtpDB } from "@/lib/wtp-db";

interface Env {
  NEW_DB: D1Database;
}

const getDB = async () => {
  const ctx = await getCloudflareContext({ async: true });
  return (ctx.env as unknown as Env).NEW_DB;
};

// GET: List participants for a specific incident
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
        ip.*,
        a.full_name as actor_name,
        a.job_title,
        e.name as entity_name
      FROM incident_participants ip
      LEFT JOIN actors a ON ip.actor_id = a.id
      LEFT JOIN entities e ON ip.entity_id = e.id
      WHERE ip.incident_id = ?
      ORDER BY ip.is_primary DESC, ip.created_at ASC
    `).bind(incidentId).all();

    return NextResponse.json({ results: results || [] });
  } catch (err) {
    console.error("PARTICIPANTS_GET_ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 });
  }
}

// Add this interface near the top of the file:
interface ParticipantRequestBody {
  incident_id: number;
  actor_id?: number | null;
  entity_id?: number | null;
  create_new_actor?: boolean;
  new_actor_data?: {
    full_name: string;
    entity_id?: number | null;
    job_title?: string;
    slug: string;
    bio?: string;
  };
  role_description: string;
  forensic_note?: string;
  is_primary?: number;
}

// POST: Add a participant to an incident (with optional inline actor creation)
export async function POST(request: NextRequest) {
  try {
    const db = await getWtpDB();
    // ✅ TYPE THE BODY:
    const body = (await request.json()) as ParticipantRequestBody;

    const {
      incident_id,
      actor_id,        // If selecting existing actor
      entity_id,       // If selecting existing entity
      create_new_actor, // If creating new actor inline
      new_actor_data,  // { full_name, entity_id, job_title, slug, ... }
      role_description,
      forensic_note,
      is_primary = 0
    } = body;

    let finalActorId = actor_id;

    // If creating a new actor inline, insert them first
    if (create_new_actor && new_actor_data) {
      const { full_name, entity_id: newEntityId, job_title, slug, bio } = new_actor_data;

      if (!full_name || !slug) {
        return NextResponse.json({ error: "New actor requires full_name and slug" }, { status: 400 });
      }

      const actorResult = await db.prepare(`
        INSERT INTO actors (full_name, entity_id, job_title, slug, bio, status)
        VALUES (?, ?, ?, ?, ?, 'active')
      `).bind(full_name, newEntityId || null, job_title || null, slug, bio || null).run();

      finalActorId = actorResult.meta.last_row_id;
    }

    // Now insert the join table entry
    const result = await db.prepare(`
      INSERT INTO incident_participants (
        incident_id, actor_id, entity_id, role_description, forensic_note, is_primary
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      incident_id,
      finalActorId ?? null,
      entity_id ?? null,
      role_description,
      forensic_note ?? null,
      is_primary ? 1 : 0
    ).run();

    return NextResponse.json({
      success: true,
      id: result.meta.last_row_id,
      actor_id: finalActorId
    });

  } catch (err) {
    console.error("PARTICIPANTS_POST_ERROR:", err);
    return NextResponse.json({ error: "Failed to add participant" }, { status: 500 });
  }
}

// DELETE: Remove a participant link (does NOT delete the actor)
export async function DELETE(request: NextRequest) {
  try {
    const db = await getWtpDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    await db.prepare("DELETE FROM incident_participants WHERE id = ?").bind(id).run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PARTICIPANTS_DELETE_ERROR:", err);
    return NextResponse.json({ error: "Failed to remove participant" }, { status: 500 });
  }
}

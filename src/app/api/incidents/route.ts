import { getCloudflareContext } from "@opennextjs/cloudflare";

interface Env {
  DB: D1Database;
}

// Define the shape of the incoming request to satisfy TS
interface IncidentBody {
  title: string;
  description: string;
  actor_id?: number | null;
  entity_id?: number | null;
  statute_id?: number | null;
  status?: string;
  is_critical?: number;
  event_date?: string;
}

export async function POST(request: Request) {
  try {
    const context = await getCloudflareContext();
    const env = context.env as unknown as Env;
    
    // Cast the JSON body to our interface
    const body = (await request.json()) as IncidentBody;

    const {
      title,
      description,
      actor_id = null,
      entity_id = null,
      statute_id = null,
      status = 'pending',
      is_critical = 0,
      event_date
    } = body;

    if (!title || !description) {
      return Response.json({ error: "Required: title/description" }, { status: 400 });
    }

    const result = await env.DB.prepare(`
      INSERT INTO incidents (
        title, description, actor_id, entity_id, statute_id, status, is_critical, event_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      title, description, actor_id, entity_id, statute_id, 
      status, is_critical, event_date || new Date().toISOString()
    )
    .run();

    return Response.json({ success: true, id: result.meta.last_row_id });

  } catch (err) {
    console.error("INCIDENT_POST_FAILURE:", err);
    return Response.json({ error: "D1_INGRESS_FAILURE" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const context = await getCloudflareContext();
    const env = context.env as unknown as Env;

    const { results } = await env.DB.prepare(`
      SELECT 
        i.title, 
        i.event_date, 
        a.full_name as actor, 
        e.name as entity
      FROM incidents i
      LEFT JOIN actors a ON i.actor_id = a.id
      LEFT JOIN entities e ON i.entity_id = e.id
      WHERE i.is_critical = 1 AND i.status = 'verified'
      ORDER BY i.event_date DESC
      LIMIT 10
    `).all();

    return Response.json(results);
  } catch {
    return Response.json([], { status: 500 });
  }
}
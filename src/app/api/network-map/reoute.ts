import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge"; // Crucial for Cloudflare D1

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const db = (ctx.env as any).DB;

    // Fetch nodes (Entities)
    const entities = await db.prepare(`
      SELECT id, name, geographic_cluster, entity_type 
      FROM entities 
      WHERE geographic_cluster IS NOT NULL
    `).all();

    // Fetch links (Connections)
    const connections = await db.prepare(`
      SELECT source_id, target_id, connection_type, strength 
      FROM connections
    `).all();

    return Response.json({
      nodes: entities.results || [],
      links: connections.results || []
    });
  } catch (error) {
    console.error("D1 Fetch Error:", error);
    return Response.json({ nodes: [], links: [] }, { status: 500 });
  }
}
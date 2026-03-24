export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface CloudflareEnv {
  DB: D1Database;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('q') || '';
  
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as unknown as CloudflareEnv).DB;

  try {
    // This query pulls the evidence and counts how many rebuttals exist for it
    const query = `
      SELECT e.*, 
      (SELECT COUNT(*) FROM evidence_relations WHERE source_id = e.id AND relation_type = 'REFUTES') as rebuttal_count
      FROM evidence e
      WHERE e.description LIKE ?
      ORDER BY e.id DESC
    `;
    
    const { results } = await db.prepare(query)
      .bind(`%${search}%`)
      .all();

    return NextResponse.json({ results: results || [] });
  } catch (err) {
    console.error("FEED_FETCH_ERROR:", err);
    return NextResponse.json({ error: "DATABASE_ERROR" }, { status: 500 });
  }
}
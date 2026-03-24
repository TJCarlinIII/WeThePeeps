export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface Env {
  DB: D1Database;
}

export async function POST(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as unknown as Env).DB;

  try {
    const body = await request.json() as { 
      source_id: number; 
      target_id: number; 
      relation_type: string; 
      notes?: string 
    };
    
    const { source_id, target_id, relation_type, notes } = body;

    const query = `
      INSERT INTO evidence_relations (source_id, target_id, relation_type, notes) 
      VALUES (?, ?, ?, ?)
    `;
    
    await db.prepare(query)
      .bind(source_id, target_id, relation_type, notes || '')
      .run();
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("RELATION_POST_ERROR:", err);
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : 'Relation failed' 
    }, { status: 500 });
  }
}
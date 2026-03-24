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
      evidence_id: number; 
      file_url: string; 
      display_name: string; 
      file_type: string 
    };
    
    const { evidence_id, file_url, display_name, file_type } = body;

    const query = `
      INSERT INTO evidence_media (evidence_id, file_url, display_name, file_type) 
      VALUES (?, ?, ?, ?)
    `;
    
    await db.prepare(query)
      .bind(evidence_id, file_url, display_name, file_type)
      .run();
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("MEDIA_POST_ERROR:", err);
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : 'Insertion failed' 
    }, { status: 500 });
  }
}
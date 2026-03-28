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
      actor_id: string; 
      incident_id?: string; 
      evidence_id?: string;
      falsified_claim: string; 
      clinical_fact: string;
      evidence_url?: string;
    };
    
    const { 
      actor_id, 
      incident_id, 
      evidence_id, 
      falsified_claim, 
      clinical_fact, 
      evidence_url 
    } = body;

    // We use a single INSERT. If your schema uses separate columns for 
    // the lie and the truth, we map them here.
    const query = `
      INSERT INTO rebuttals (
        actor_id, 
        incident_id, 
        evidence_id, 
        falsified_claim, 
        clinical_fact, 
        evidence_url,
        created_at
      ) 
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    await db.prepare(query)
      .bind(
        actor_id || null, 
        incident_id || null, 
        evidence_id || null, 
        falsified_claim, 
        clinical_fact, 
        evidence_url || ''
      )
      .run();
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("REBUTTAL_POST_ERROR:", err);
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : 'Ledger commitment failed' 
    }, { status: 500 });
  }
}
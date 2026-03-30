// src/app/api/rebuttals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface Env { DB: D1Database; }

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as unknown as Env).DB;
    const { results } = await db.prepare(`
      SELECT r.*, a.full_name as actor_name, i.title as incident_title 
      FROM rebuttals r 
      LEFT JOIN actors a ON r.actor_id = a.id 
      LEFT JOIN incidents i ON r.incident_id = i.id
      ORDER BY r.created_at DESC
    `).all();
    return NextResponse.json({ results: results || [] });
  } catch (err) {
    return NextResponse.json({ results: [] });
  }
}

export async function POST(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as unknown as Env).DB;

  try {
    const body = await request.json() as any;
    await db.prepare(`INSERT INTO rebuttals (actor_id, incident_id, evidence_id, falsified_claim, clinical_fact, evidence_url, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`)
      .bind(body.actor_id || null, body.incident_id || null, body.evidence_id || null, body.falsified_claim, body.clinical_fact, body.evidence_url || '').run();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
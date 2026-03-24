export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface CloudflareEnv {
  DB: D1Database;
}

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as unknown as CloudflareEnv).DB;
  const { id } = params;

  try {
    const evidence = await db.prepare("SELECT * FROM evidence WHERE id = ?").bind(id).first();

    if (!evidence) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    const media = await db.prepare("SELECT * FROM evidence_media WHERE evidence_id = ?").bind(id).all();

    const rebuttals = await db.prepare(`
      SELECT e.id, e.description FROM evidence e
      JOIN evidence_relations er ON e.id = er.target_id
      WHERE er.source_id = ? AND er.relation_type = 'REFUTES'
    `).bind(id).all();

    return NextResponse.json({
      ...evidence,
      media: media.results || [],
      rebuttals: rebuttals.results || []
    });
  } catch (err) {
    console.error("D1_FETCH_ERROR:", err);
    return NextResponse.json({ error: "DATABASE_ERROR" }, { status: 500 });
  }
}
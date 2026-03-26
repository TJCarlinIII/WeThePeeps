export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface Env {
  DB: D1Database;
}

type RouteContext = {
  params: Promise<{ table: string }>;
};

const ALLOWED_TABLES = ['sectors', 'entities', 'actors', 'incidents', 'media', 'statutes', 'content', 'posts'];

// UI-only fields that shouldn't be sent to the DB
const FORBIDDEN_COLUMNS = ['sector_name', 'entity_name', 'actor_name', 'statute_title'];

function isTableAllowed(table: string): boolean {
  return ALLOWED_TABLES.includes(table);
}

function cleanPayload(body: Record<string, unknown>) {
  const cleanData = Object.fromEntries(
    Object.entries(body).filter(([k, v]) => 
      !Array.isArray(v) && 
      k !== 'id' && 
      k !== 'created_at' && 
      !FORBIDDEN_COLUMNS.includes(k)
    )
  );

  if (!cleanData.slug) {
    const source = cleanData.name || cleanData.title || cleanData.full_name;
    if (source) {
      cleanData.slug = String(source)
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
    }
  }
  return cleanData;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { table } = await context.params;
  if (!isTableAllowed(table)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { env } = await getCloudflareContext({ async: true });
  const db = (env as unknown as Env).DB;

  try {
    const { results } = await db.prepare(`SELECT * FROM \`${table}\` ORDER BY id DESC`).all();
    return NextResponse.json({ results: results || [] });
  } catch (err) {
    console.error(`GET_ERROR [${table}]:`, err);
    return NextResponse.json({ error: 'Database fetch failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { table } = await context.params;
  if (!isTableAllowed(table)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { env } = await getCloudflareContext({ async: true });
  const db = (env as unknown as Env).DB;

  try {
    const body = await request.json() as Record<string, unknown>;
    const cleanData = cleanPayload(body);
    
    const keys = Object.keys(cleanData);
    const values = Object.values(cleanData);
    
    if (keys.length === 0) return NextResponse.json({ error: 'No data' }, { status: 400 });

    // Use backticks for table and keys to prevent SQL errors
    const keyString = `\`${keys.join('\`, \`')}\``;
    const placeholders = keys.map(() => '?').join(', ');

    const query = `INSERT INTO \`${table}\` (${keyString}) VALUES (${placeholders})`;
    await db.prepare(query).bind(...values).run();
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`POST_ERROR [${table}]:`, err);
    return NextResponse.json({ error: 'Insertion failed' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { table } = await context.params;
  if (!isTableAllowed(table)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { env } = await getCloudflareContext({ async: true });
  const db = (env as unknown as Env).DB;

  try {
    const body = await request.json() as { id: string | number } & Record<string, unknown>;
    if (!body.id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const cleanData = cleanPayload(body);
    const keys = Object.keys(cleanData);
    
    if (keys.length === 0) return NextResponse.json({ success: true, message: 'No changes' });

    const setClause = keys.map(key => `\`${key}\` = ?`).join(', ');
    const values = [...Object.values(cleanData), body.id];

    await db.prepare(`UPDATE \`${table}\` SET ${setClause} WHERE id = ?`).bind(...values).run();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`PATCH_ERROR [${table}]:`, err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { table } = await context.params;
  if (!isTableAllowed(table)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { env } = await getCloudflareContext({ async: true });
  const db = (env as unknown as Env).DB;

  try {
    const body = await request.json() as { id: string | number };
    if (!body?.id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await db.prepare(`DELETE FROM \`${table}\` WHERE id = ?`).bind(body.id).run();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`DELETE_ERROR [${table}]:`, err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
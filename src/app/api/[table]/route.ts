import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

// Using force-dynamic to ensure OpenNext handles the Cloudflare context correctly
export const dynamic = 'force-dynamic';

interface Env {
  DB: D1Database;
}

type RouteContext = {
  params: Promise<{ table: string }>;
};

const ALLOWED_TABLES = ['sectors', 'entities', 'actors', 'incidents', 'media', 'statutes', 'content'];

function isTableAllowed(table: string): boolean {
  return ALLOWED_TABLES.includes(table);
}

// GET: Fetch all rows
export async function GET(request: NextRequest, context: RouteContext) {
  const env = getRequestContext().env as unknown as Env;
  const db = env.DB;
  const { table } = await context.params;

  if (!isTableAllowed(table)) {
    return NextResponse.json({ error: 'Unauthorized table access' }, { status: 403 });
  }

  try {
    const { results } = await db.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).all();
    return NextResponse.json(results);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown database error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Add a new row
export async function POST(request: NextRequest, context: RouteContext) {
  const env = getRequestContext().env as unknown as Env;
  const db = env.DB;
  const { table } = await context.params;

  if (!isTableAllowed(table)) {
    return NextResponse.json({ error: 'Unauthorized table access' }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    
    // We omit 'id' and 'created_at' from the spread to avoid inserting into 
    // auto-generated columns, using the underscore-only pattern which most 
    // linters ignore, or simply omitting them from the keys entirely.
    const { id: _, created_at: __, ...cleanData } = body;
    
    const keys = Object.keys(cleanData);
    const values = Object.values(cleanData);
    
    if (keys.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    const keyString = keys.join(', ');
    const placeholders = keys.map(() => '?').join(', ');

    const query = `INSERT INTO ${table} (${keyString}) VALUES (${placeholders})`;
    await db.prepare(query).bind(...values).run();
    
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Insertion failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Update an existing row
export async function PATCH(request: NextRequest, context: RouteContext) {
  const env = getRequestContext().env as unknown as Env;
  const db = env.DB;
  const { table } = await context.params;

  if (!isTableAllowed(table)) {
    return NextResponse.json({ error: 'Unauthorized table access' }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { id: string | number } & Record<string, unknown>;
    
    // Extract ID for the WHERE clause, omit created_at from the UPDATE data
    const { id, created_at: _, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const keys = Object.keys(data);
    if (keys.length === 0) {
      return NextResponse.json({ success: true, message: 'No changes' });
    }

    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    await db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`)
      .bind(...values)
      .run();
      
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Remove a row
export async function DELETE(request: NextRequest, context: RouteContext) {
  const env = getRequestContext().env as unknown as Env;
  const db = env.DB;
  const { table } = await context.params;

  if (!isTableAllowed(table)) {
    return NextResponse.json({ error: 'Unauthorized table access' }, { status: 403 });
  }

  try {
    const { id } = (await request.json()) as { id: string | number };

    await db.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// Define the shape of your Cloudflare Env locally 
// to avoid using 'any' or fighting global declarations.
interface Env {
  DB: D1Database;
}

// GET: Fetch all rows for a specific table
export async function GET(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  const env = getRequestContext().env as unknown as Env;
  const db = env.DB;
  const tableName = params.table;

  try {
    const { results } = await db.prepare(`SELECT * FROM ${tableName} ORDER BY id DESC`).all();
    return NextResponse.json(results);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown database error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Add a new row
export async function POST(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  const env = getRequestContext().env as unknown as Env;
  const db = env.DB;
  const body = (await request.json()) as Record<string, unknown>;

  const keys = Object.keys(body).join(', ');
  const placeholders = Object.keys(body).map(() => '?').join(', ');
  const values = Object.values(body);

  try {
    const query = `INSERT INTO ${params.table} (${keys}) VALUES (${placeholders})`;
    await db.prepare(query).bind(...values).run();
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Insertion failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Update an existing row
export async function PATCH(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  const env = getRequestContext().env as unknown as Env;
  const db = env.DB;
  const body = (await request.json()) as { id: string | number } & Record<string, unknown>;
  const { id, ...data } = body;

  const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), id];

  try {
    await db.prepare(`UPDATE ${params.table} SET ${setClause} WHERE id = ?`)
      .bind(...values)
      .run();
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Remove a row
export async function DELETE(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  const env = getRequestContext().env as unknown as Env;
  const db = env.DB;
  const { id } = (await request.json()) as { id: string | number };

  try {
    await db.prepare(`DELETE FROM ${params.table} WHERE id = ?`)
      .bind(id)
      .run();
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
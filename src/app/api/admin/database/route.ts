export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface Env { DB: D1Database; }

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const table = searchParams.get('table');

  try {
    const ctx = await getCloudflareContext({ async: true });
    const db = (ctx.env as unknown as Env).DB;

    if (action === 'list_tables') {
      const { results } = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC").all();
      return NextResponse.json({ tables: results.map(r => r.name) });
    }

    if (action === 'table_data' && table) {
      // Fetch column headers
      const pragma = await db.prepare(`PRAGMA table_info(${table})`).all();
      const columns = pragma.results.map(r => r.name);
      
      // Fetch top 50 rows
      const { results: rows } = await db.prepare(`SELECT * FROM ${table} ORDER BY id DESC LIMIT 50`).all();
      
      return NextResponse.json({ columns, rows });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("DB_EXPLORER_ERROR:", error);
    return NextResponse.json({ error: "Database query failed" }, { status: 500 });
  }
}
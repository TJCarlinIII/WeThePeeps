// src/app/test-db/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
// ✅ FIX 1: Import D1Database type from workers-types
import type { D1Database } from "@cloudflare/workers-types";

export async function GET() {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    
    // ✅ FIX 2: Use double-cast pattern for type safety
    const env = ctx.env as unknown as { DB: D1Database };
    const db = env.DB;

    if (!db) {
      return NextResponse.json({ 
        status: "Error", 
        message: "DB binding is missing from context. Check wrangler.toml." 
      }, { status: 500 });
    }

    const { results } = await db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table'"
    ).all();

    return NextResponse.json({ 
      status: "Connected", 
      tables: results,
      timestamp: new Date().toISOString() 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "Database Connection Error", message }, 
      { status: 500 }
    );
  }
}
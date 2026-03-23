import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Import from @opennextjs/cloudflare to match your successful actions.ts
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext();
    
    // Type-safe environment access
    const env = ctx.env as Record<string, unknown>;
    const db = env.DB as D1Database;

    if (!db) {
      return NextResponse.json({ 
        status: "Error", 
        message: "DB binding is missing from context. Check wrangler.toml." 
      }, { status: 500 });
    }

    // List tables to confirm D1 access
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
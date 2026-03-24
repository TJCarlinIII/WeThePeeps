export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

interface CloudflareEnv {
  DB: D1Database;
}

interface SectorRequestBody {
  name: string;
}

export async function GET() {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as CloudflareEnv;
  const db = env.DB;

  const { results } = await db.prepare("SELECT * FROM sectors ORDER BY name ASC").all();
  return NextResponse.json({ results });
}

export async function POST(request: Request) {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as CloudflareEnv;
  const db = env.DB;

  const body = (await request.json()) as SectorRequestBody;

  try {
    await db.prepare(
      "INSERT INTO sectors (name) VALUES (?)"
    ).bind(body.name).run();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database insert failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
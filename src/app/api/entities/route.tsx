export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

interface CloudflareEnv {
  DB: D1Database;
}

export async function POST(request: Request) {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as CloudflareEnv;
  
  const body = (await request.json()) as { name: string; sector: string };

  try {
    await env.DB.prepare(
      "INSERT INTO entities (name, sector) VALUES (?, ?)"
    ).bind(body.name, body.sector).run();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
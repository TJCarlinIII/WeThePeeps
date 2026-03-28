export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface CloudflareEnv {
  DB: D1Database;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = (env as unknown as CloudflareEnv).DB;
  const searchTerm = `%${query}%`;

  try {
    // Added 'rebuttals' to the Promise.all array
    const [actors, statutes, posts, rebuttals] = await Promise.all([
      db.prepare("SELECT id, full_name as title, 'actor' as type FROM actors WHERE full_name LIKE ? LIMIT 5").bind(searchTerm).all(),
      db.prepare("SELECT id, citation || ': ' || title as title, 'statute' as type FROM statutes WHERE title LIKE ? OR citation LIKE ? LIMIT 5").bind(searchTerm, searchTerm).all(),
      db.prepare("SELECT id, title, 'post' as type FROM posts WHERE title LIKE ? LIMIT 5").bind(searchTerm).all(),
      // New: Search within the 'falsified_claim' and 'clinical_fact' fields
      db.prepare(`
        SELECT id, SUBSTR(falsified_claim, 1, 50) || '...' as title, 'rebuttal' as type 
        FROM rebuttals 
        WHERE falsified_claim LIKE ? OR clinical_fact LIKE ? 
        LIMIT 5
      `).bind(searchTerm, searchTerm).all()
    ]);

    const combined = [
      ...(actors.results || []),
      ...(statutes.results || []),
      ...(posts.results || []),
      ...(rebuttals.results || []) // Merged into the final manifest
    ];

    return NextResponse.json({ results: combined });
  } catch (err) {
    console.error("SEARCH_SYSTEM_ERROR:", err);
    return NextResponse.json({ error: "SEARCH_FAILED" }, { status: 500 });
  }
}
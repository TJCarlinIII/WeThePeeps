// src/app/api/network-map/route.ts

import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDB();

    // ✅ ENTITIES (FIXED FIELD MAPPING)
    const entities = await db.prepare(`
      SELECT 
        id,
        name,
        slug,
        CASE 
          WHEN history_of_falsification = 1 
            OR history_of_withholding = 1 
            OR statutory_delayer = 1
          THEN 1 ELSE 0 
        END as has_documented_crimes,
        history_of_falsification as is_high_priority
      FROM entities
    `).all();

    // ✅ ACTORS
    const actors = await db.prepare(`
      SELECT 
        id,
        full_name,
        slug,
        status
      FROM actors
    `).all();

    // ✅ CONNECTIONS → RELATIONS (CRITICAL FIX)
    const relations = await db.prepare(`
      SELECT source_id, target_id, connection_type FROM connections
    `).all();

    return NextResponse.json({
      entities: entities.results || [],
      actors: actors.results || [],
      relations: relations.results || []
    });

  } catch (error) {
    console.error("NETWORK_MAP_API_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load network map" },
      { status: 500 }
    );
  }
}
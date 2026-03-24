"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface SearchResult {
  id: number | string;
  title: string;
  type: 'STATUTE' | 'ACTOR' | 'ENTITY' | 'EVIDENCE';
  slug?: string;
  subtitle?: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };
  const searchTerm = `%${query}%`;

  const { results } = await env.DB.prepare(`
    SELECT id, title as title, 'STATUTE' as type, citation as subtitle, NULL as slug FROM statutes WHERE title LIKE ? OR citation LIKE ?
    UNION ALL
    SELECT id, full_name as title, 'ACTOR' as type, job_title as subtitle, slug FROM actors WHERE full_name LIKE ?
    UNION ALL
    SELECT id, name as title, 'ENTITY' as type, sector as subtitle, slug FROM entities WHERE name LIKE ?
    UNION ALL
    SELECT id, title as title, 'EVIDENCE' as type, official as subtitle, NULL as slug FROM evidence WHERE title LIKE ? OR content LIKE ?
    LIMIT 10
  `).bind(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm).all<SearchResult>();

  return results;
}
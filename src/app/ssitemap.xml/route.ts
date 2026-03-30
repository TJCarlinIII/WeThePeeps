// src/app/ssitemap.xml/route.ts
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

interface Env {
  DB: D1Database;
}

interface TaxonomyResult {
  slug: string;
  type: 'category' | 'tag' | 'statute';
}

interface IncidentResult {
  slug: string;
}

// ✅ Helper: Retry a D1 query with exponential backoff
async function retryQuery<T>(
  db: D1Database,
  query: string,
  params: unknown[] = [],
  maxRetries = 3
): Promise<{ results: T[] }> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await db.prepare(query).bind(...params).all<T>();
    } catch (error) {
      lastError = error as Error;
      // If it's a SQLITE_BUSY error, wait and retry
      if (error instanceof Error && error.message.includes('SQLITE_BUSY')) {
        await new Promise(resolve => setTimeout(resolve, 100 * attempt)); // 100ms, 200ms, 300ms
        continue;
      }
      // For other errors, throw immediately
      throw error;
    }
  }
  
  // If all retries failed, return empty results
  console.warn(`Query failed after ${maxRetries} retries: ${lastError?.message}`);
  return { results: [] };
}

export async function GET() {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const baseUrl = "https://wethepeeps.net";

  try {
    // ✅ Use retryQuery for all database calls
    const [taxonomy, incidents, sectors, entities, actors, statutes] = await Promise.all([
      retryQuery<TaxonomyResult>(db, "SELECT slug, type FROM taxonomy_definitions"),
      retryQuery<IncidentResult>(db, "SELECT slug FROM incidents"),
      retryQuery<{ slug: string }>(db, "SELECT slug FROM sectors"),
      retryQuery<{ slug: string }>(db, "SELECT slug FROM entities"),
      retryQuery<{ slug: string }>(db, "SELECT slug FROM actors"),
      retryQuery<{ slug: string }>(db, "SELECT slug FROM statutes")
    ]);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${baseUrl}/</loc><priority>1.0</priority></url>
<url><loc>${baseUrl}/accountability</loc><priority>0.8</priority></url>
<url><loc>${baseUrl}/evidence</loc><priority>0.8</priority></url>
${taxonomy.results.map((item) => `
<url>
<loc>${baseUrl}/${item.type === 'statute' ? 'statutes' : 'categories'}/${item.slug}</loc>
<changefreq>weekly</changefreq>
</url>
`).join('')}
${incidents.results.map((item) => `
<url>
<loc>${baseUrl}/evidence/${item.slug}</loc>
<changefreq>daily</changefreq>
</url>
`).join('')}
${sectors.results.map((item) => `
<url>
<loc>${baseUrl}/sectors/${item.slug}</loc>
<changefreq>weekly</changefreq>
</url>
`).join('')}
${entities.results.map((item) => `
<url>
<loc>${baseUrl}/entities/${item.slug}</loc>
<changefreq>weekly</changefreq>
</url>
`).join('')}
${actors.results.map((item) => `
<url>
<loc>${baseUrl}/actors/${item.slug}</loc>
<changefreq>weekly</changefreq>
</url>
`).join('')}
${statutes.results.map((item) => `
<url>
<loc>${baseUrl}/statutes/${item.slug}</loc>
<changefreq>weekly</changefreq>
</url>
`).join('')}
</urlset>`;

    return new NextResponse(xml.trim(), {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("SITEMAP_ERROR:", error);
    // ✅ Return a minimal fallback sitemap instead of crashing
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${baseUrl}/</loc></url></urlset>`;
    return new NextResponse(fallbackXml, {
      headers: { "Content-Type": "application/xml" },
    });
  }
}
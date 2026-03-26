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

export async function GET() {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as Env).DB;
  const baseUrl = "https://wethepeeps.net";

  try {
    // Fetch all slugs with specific types
    const [taxonomy, incidents] = await Promise.all([
      db.prepare("SELECT slug, type FROM taxonomy_definitions").all<TaxonomyResult>(),
      db.prepare("SELECT slug FROM incidents").all<IncidentResult>()
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
    </urlset>`;

    return new NextResponse(xml.trim(), {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("SITEMAP_ERROR:", error);
    // Return a basic fallback sitemap to prevent build crash
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${baseUrl}/</loc></url></urlset>`;
    return new NextResponse(fallbackXml, {
      headers: { "Content-Type": "application/xml" },
    });
  }
}
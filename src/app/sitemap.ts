import { MetadataRoute } from 'next';
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface SitemapItem {
  slug: string;
  updated_at?: string | number | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.wethepeeps.net';
  
  // 1. Get the Cloudflare D1 Context
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as { DB: D1Database }).DB;

  // 2. Safe fetch helper to handle database calls
  const safeFetch = async (query: string): Promise<SitemapItem[]> => {
    try {
      const { results } = await db.prepare(query).all<SitemapItem>();
      return results || [];
    } catch (e) {
      console.error(`Sitemap query failed: ${query}`, e);
      return []; 
    }
  };

  // 3. Run all queries - Updated to pull from the NEW 'statutes' table
  const [sectors, entities, actors, statutes] = await Promise.all([
    safeFetch('SELECT slug FROM sectors'),
    safeFetch('SELECT slug FROM entities'),
    safeFetch('SELECT slug FROM actors'),
    safeFetch('SELECT slug FROM statutes'), // Pointing to the new table
  ]);

  // 4. Define static landing pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/actors`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/entities`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/sectors`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/statutes`, lastModified: new Date(), priority: 0.9 }, // Priority boost for the registry
  ];

  // 5. Helper to format dynamic database entries into sitemap URLs
  const createEntries = (data: SitemapItem[], path: string) => 
    data.map((item) => ({
      url: `${baseUrl}/${path}/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7, // Higher priority for statutory content
    }));

  // 6. Combine all sections into the final sitemap
  return [
    ...staticPages,
    ...createEntries(sectors, 'sectors'),
    ...createEntries(entities, 'entities'),
    ...createEntries(actors, 'actors'),
    ...createEntries(statutes, 'statutes'),
  ];
}
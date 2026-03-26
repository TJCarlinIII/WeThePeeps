import { MetadataRoute } from 'next';
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface SitemapItem {
  slug: string;
  updated_at?: string | number | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.wethepeeps.net';
  
  // 1. Get the Cloudflare D1 Context correctly
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as { DB: D1Database }).DB;

  // 2. Fix the safeFetch to always return an array
  const safeFetch = async (query: string): Promise<SitemapItem[]> => {
    try {
      const { results } = await db.prepare(query).all<SitemapItem>();
      return results || [];
    } catch (e) {
      // Log the actual error for your terminal/dashboard
      console.error(`Sitemap query failed: ${query}`, e);
      return []; // Return empty array so .map() doesn't crash
    }
  };

  // 3. Run all queries
  const [sectors, entities, actors, statutes, categories] = await Promise.all([
    safeFetch('SELECT slug FROM sectors'),
    safeFetch('SELECT slug FROM entities'),
    safeFetch('SELECT slug FROM actors'),
    safeFetch('SELECT slug FROM taxonomy_definitions WHERE type = "statute"'),
    safeFetch('SELECT slug FROM taxonomy_definitions WHERE type = "category"'),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/actors`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/entities`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/sectors`, lastModified: new Date(), priority: 0.8 },
  ];

  const createEntries = (data: SitemapItem[], path: string) => 
    data.map((item) => ({
      url: `${baseUrl}/${path}/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  return [
    ...staticPages,
    ...createEntries(sectors, 'sectors'),
    ...createEntries(entities, 'entities'),
    ...createEntries(actors, 'actors'),
    ...createEntries(statutes, 'statutes'),
    ...createEntries(categories, 'categories'),
  ];
}
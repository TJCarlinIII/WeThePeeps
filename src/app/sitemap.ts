import { MetadataRoute } from 'next';
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface SitemapItem {
  slug: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.wethepeeps.net';
  
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as { DB: D1Database }).DB;

  const safeFetch = async (query: string): Promise<SitemapItem[]> => {
    try {
      const { results } = await db.prepare(query).all<SitemapItem>();
      return results || [];
    } catch (e) {
      // Silently ignore missing tables during migration
      console.warn(`Sitemap query skipped (table may not exist yet): ${query}`);
      return [];
    }
  };

  /**
   * FIX: Sequential Fetching
   * We avoid Promise.all here because multiple simultaneous 
   * queries against local D1 often trigger SQLITE_BUSY locks 
   * during the 'Collecting page data' build phase.
   */
  const sectors = await safeFetch('SELECT slug FROM sectors WHERE slug IS NOT NULL');
  const entities = await safeFetch('SELECT slug FROM entities WHERE slug IS NOT NULL');
  const actors = await safeFetch('SELECT slug FROM actors WHERE slug IS NOT NULL');
  const statutes = await safeFetch('SELECT slug FROM statutes WHERE slug IS NOT NULL');

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/actors`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/entities`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/sectors`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/statutes`, lastModified: new Date(), priority: 0.9 },
  ];

  const createEntries = (data: SitemapItem[], path: string) => 
    data.map((item) => ({
      url: `${baseUrl}/${path}/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  return [
    ...staticPages,
    ...createEntries(sectors, 'sectors'),
    ...createEntries(entities, 'entities'),
    ...createEntries(actors, 'actors'),
    ...createEntries(statutes, 'statutes'),
  ];
}
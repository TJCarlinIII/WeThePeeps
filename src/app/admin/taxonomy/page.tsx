import { getCloudflareContext } from "@opennextjs/cloudflare";
import TaxonomyRegistry from "./TaxonomyRegistry";
import { Taxonomy } from "@/components/admin/forms/TaxonomyForm";

// 1. Maintain the Env interface for clarity
interface Env extends Record<string, unknown> {
  DB: D1Database;
}

interface TaxonomyRow {
  id: number;
  name: string;
  slug: string | null;
  type: 'category' | 'tag';
  seo_description: string | null;
  seo_keywords: string | null;
}

export default async function TaxonomyPage() {
  const context = await getCloudflareContext({ async: true });
  
  // 2. Explicitly cast the env to our local Env interface
  const env = context.env as Env;
  const db = env.DB;

  const { results } = await db.prepare(
    "SELECT * FROM taxonomy_definitions ORDER BY type DESC, name ASC"
  ).all<TaxonomyRow>();

  const terms: Taxonomy[] = (results || []).map((row: TaxonomyRow) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    // Provide an empty string fallback if the interface requires a string
    slug: row.slug ?? "", 
    seo_description: row.seo_description ?? "",
    seo_keywords: row.seo_keywords ?? "",
  }));

  return (
    <main className="min-h-screen bg-black">
      <TaxonomyRegistry initialTerms={terms} />
    </main>
  );
}
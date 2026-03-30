// File: src/app/admin/taxonomy/page.tsx
import { getCloudflareContext } from "@opennextjs/cloudflare";
import TaxonomyRegistry from "./TaxonomyRegistry";
import { Taxonomy } from "@/components/admin/forms/TaxonomyForm";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";

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

export const dynamic = "force-dynamic";
export const revalidate = 0; // Ensure no static generation

export default async function TaxonomyPage() {
  let terms: Taxonomy[] = [];
  
  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as Env;
    const db = env.DB;
    
    const { results } = await db.prepare(
      "SELECT * FROM taxonomy_definitions ORDER BY type DESC, name ASC"
    ).all<TaxonomyRow>();
    
    terms = (results || []).map((row: TaxonomyRow) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      slug: row.slug ?? "",
      seo_description: row.seo_description ?? "",
      seo_keywords: row.seo_keywords ?? "",
    }));
  } catch (error) {
    // ✅ Graceful fallback for build-time: render empty state
    console.warn("TAXONOMY_PAGE: Database unavailable during build (expected). Rendering empty state.");
    terms = [];
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-black text-white font-mono">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <header className="mb-12 border-b border-slate-900 pb-6">
              <h1 className="text-3xl font-black italic tracking-tighter uppercase text-[#4A90E2]">
                Taxonomy_Architect
              </h1>
              <p className="text-slate-500 text-[10px] mt-2 tracking-[0.3em]">
                SECURE_NODE // CLASSIFICATION_ENGINE_V1
              </p>
            </header>
            <TaxonomyRegistry initialTerms={terms} />
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
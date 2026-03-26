import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

interface Category {
  id: number;
  name: string;
  seo_keywords: string;
  seo_description: string;
  slug: string;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as { DB: D1Database }).DB;

  const category = await db.prepare(
    "SELECT name, seo_keywords, seo_description FROM taxonomy_definitions WHERE slug = ? AND type = 'category'"
  ).bind(decodeURIComponent(slug)).first<Category>();

  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} | We The Peeps`,
    description: category.seo_description || category.seo_keywords,
    keywords: category.seo_keywords,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as { DB: D1Database }).DB;

  const category = await db.prepare(
    "SELECT * FROM taxonomy_definitions WHERE slug = ? AND type = 'category'"
  ).bind(decodeURIComponent(slug)).first<Category>();

  // This check prevents the "'category' is possibly null" error
  if (!category) notFound();

  const incidents = await db.prepare(`
    SELECT i.id, i.title, i.slug, i.event_date FROM incidents i
    JOIN record_taxonomy rt ON i.id = rt.incident_id
    WHERE rt.tag_name = ?
    ORDER BY i.event_date DESC
    LIMIT 10
  `).bind(category.name).all<{ id: number; title: string; slug: string; event_date: string }>();

  return (
    <main className="min-h-screen bg-black text-white font-mono p-8">
      <div className="max-w-4xl mx-auto border border-slate-900 p-8 bg-slate-950/20">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-1 bg-blue-900/30 text-[#4A90E2] text-[10px] font-black uppercase border border-blue-800/50">
            [CATEGORY]
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 italic">
          {category.name}
        </h1>

        <div className="prose prose-invert max-w-none mb-10">
          <p className="text-slate-300 leading-relaxed italic">
            {category.seo_description || "No description available."}
          </p>
        </div>

        <section className="mt-12">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[#4A90E2] mb-6 border-b border-slate-900 pb-2">
            Associated_Incidents ({incidents.results?.length || 0})
          </h2>
          <div className="grid gap-4">
            {incidents.results && incidents.results.length > 0 ? (
              incidents.results.map((incident) => (
                <a key={incident.id} href={`/evidence/${incident.slug}`} className="p-4 border border-slate-900 hover:border-[#4A90E2]/50 transition-all group flex justify-between items-center bg-slate-950/40">
                  <span className="font-bold uppercase tracking-tight group-hover:text-[#4A90E2]">
                    {incident.title}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">
                    {new Date(incident.event_date).toLocaleDateString()} &rarr;
                  </span>
                </a>
              ))
            ) : (
              <p className="text-[10px] text-slate-600 uppercase italic">Zero_Linked_Incidents</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
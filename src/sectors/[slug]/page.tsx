import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Metadata } from "next";

interface SectorPageProps {
  params: Promise<{ slug: string }>;
}

interface Sector {
  id: number;
  name: string;
  seo_keywords: string;
  seo_description: string;
  slug: string;
}

export async function generateMetadata({ params }: SectorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as { DB: D1Database }).DB;

  const sector = await db.prepare(
    "SELECT name, seo_keywords, seo_description FROM sectors WHERE slug = ?"
  ).bind(decodeURIComponent(slug)).first<Sector>();

  if (!sector) return { title: "Sector Not Found" };

  return {
    title: `${sector.name} | We The Peeps`,
    description: sector.seo_description || sector.seo_keywords,
    keywords: sector.seo_keywords,
  };
}

export default async function SectorPage({ params }: SectorPageProps) {
  const { slug } = await params;
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as unknown as { DB: D1Database }).DB;

  const sector = await db.prepare("SELECT * FROM sectors WHERE slug = ?").bind(decodeURIComponent(slug)).first<Sector>();

  if (!sector) notFound();

  const entities = await db.prepare("SELECT id, name, slug FROM entities WHERE sector_id = ? ORDER BY name ASC").bind(sector.id).all<{ id: number; name: string; slug: string }>();

  return (
    <main className="min-h-screen bg-black text-white font-mono p-8">
      <div className="max-w-4xl mx-auto border border-slate-900 p-8 bg-slate-950/20">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-1 bg-blue-900/30 text-[#4A90E2] text-[10px] font-black uppercase border border-blue-800/50">
            [SECTOR]
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 italic">
          {sector.name}
        </h1>

        <div className="prose prose-invert max-w-none mb-10">
          <p className="text-slate-300 leading-relaxed italic">
            {sector.seo_description || "Institutional description pending review."}
          </p>
        </div>

        <section className="mt-12">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[#4A90E2] mb-6 border-b border-slate-900 pb-2">
            Entities_In_Sector ({entities.results?.length || 0})
          </h2>
          <div className="grid gap-4">
            {entities.results && entities.results.length > 0 ? (
              entities.results.map((entity) => (
                <a key={entity.id} href={`/entities/${entity.slug}`} className="p-4 border border-slate-900 hover:border-[#4A90E2]/50 transition-all group flex justify-between items-center bg-slate-950/40">
                  <span className="font-bold uppercase tracking-tight group-hover:text-[#4A90E2]">
                    {entity.name}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">View_Entity &rarr;</span>
                </a>
              ))
            ) : (
              <p className="text-[10px] text-slate-600 uppercase italic">No_Entities_On_Record</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
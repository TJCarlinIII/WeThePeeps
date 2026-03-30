// src/app/tags/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import { Metadata } from "next";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  type: 'category' | 'tag';
  seo_description?: string;
  seo_keywords?: string;
}

interface RelatedActor {
  id: number;
  full_name: string;
  slug: string;
}

// 1. Generate Metadata for SEO (Pulls your keywords from the DB)
export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDB();
  
  // ✅ FIX: Use .prepare().bind().first() instead of .get()
  const tag = await db
    .prepare("SELECT name, seo_keywords FROM tags WHERE slug = ?")
    .bind(decodeURIComponent(slug))
    .first<Tag>();

  if (!tag) return { title: "Tag Not Found" };

  return {
    title: `${tag.name} | We The Peeps`,
    description: tag.seo_keywords,
    keywords: tag.seo_keywords,
  };
}

// 2. The Main Page Component
export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const db = await getDB();
  
  // Fetch the specific tag details
  // ✅ FIX: Use .prepare().bind().first() instead of .get()
  const tag = await db
    .prepare("SELECT * FROM tags WHERE slug = ?")
    .bind(decodeURIComponent(slug))
    .first<Tag>();

  if (!tag) {
    notFound();
  }

  // Fetch all Actors associated with this tag
  // ✅ FIX: Use .prepare().bind().all() instead of .all()
  // ✅ FIX: Add explicit typing for the result
  const { results: relatedActors } = await db
    .prepare(`
      SELECT a.id, a.full_name, a.slug 
      FROM actors a
      JOIN actor_tags at ON a.id = at.actor_id
      WHERE at.tag_id = ?
    `)
    .bind(tag.id)
    .all<RelatedActor>();

  return (
    <main className="min-h-screen bg-black text-white font-mono p-8">
      <div className="max-w-4xl mx-auto border border-slate-900 p-8 bg-slate-950/20">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-[10px] font-black uppercase border border-blue-800/50">
            [TAG]
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
          {tag.name}
        </h1>

        <div className="prose prose-invert max-w-none mb-10">
          {/* ✅ REMOVED: tag.description reference (not in schema) */}
          <p className="text-slate-300 leading-relaxed italic">
            {tag.seo_description || "No description available for this tag."}
          </p>
        </div>

        {tag.seo_keywords && (
          <div className="mb-10">
            <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest block mb-2">
              SEO_KEYWORDS:
            </span>
            <p className="text-[11px] text-emerald-500/80 leading-relaxed uppercase">
              {tag.seo_keywords}
            </p>
          </div>
        )}

        {/* LIST RELATED CONTENT */}
        <section className="mt-12">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-blue-500 mb-6 border-b border-slate-900 pb-2">
            Associated_Actors ({relatedActors?.length || 0})
          </h2>
          <div className="grid gap-4">
            {relatedActors && relatedActors.length > 0 ? (
              relatedActors.map((actor: RelatedActor) => (
                <a 
                  key={actor.id} 
                  href={`/actors/${actor.slug}`}
                  className="p-4 border border-slate-900 hover:border-blue-500 transition-colors group flex justify-between items-center"
                >
                  <span className="font-bold uppercase tracking-tight group-hover:text-blue-400">
                    {actor.full_name}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">View_Profile →</span>
                </a>
              ))
            ) : (
              <p className="text-[10px] text-slate-600 uppercase">No active records found for this tag.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
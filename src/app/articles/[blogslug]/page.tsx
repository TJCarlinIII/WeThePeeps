export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import Link from "next/link";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import SidebarWidget from "@/components/SidebarWidget";
import ShareBriefing from "@/components/ShareBriefing"; // ✅ NEW IMPORT

interface Post {
  id: number;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  is_featured: number;
  seo_keywords: string;
  created_at: string;
}

export default async function ArticlePage({ params }: { params: Promise<{ blogslug: string }> }) {
  const { blogslug } = await params;
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };

  // 1. Fetch the main article
  const post = await env.DB.prepare(
    "SELECT * FROM posts WHERE slug = ?"
  ).bind(blogslug).first() as Post | null;

  if (!post) notFound();

  // 2. Fetch "Related Intel" (Other posts in same category)
  const { results: related } = await env.DB.prepare(
    "SELECT title, slug FROM posts WHERE category = ? AND slug != ? LIMIT 5"
  ).bind(post.category, blogslug).all<{ title: string; slug: string }>();

  return (
    <main className="min-h-screen bg-black text-slate-300 font-mono p-6 md:p-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* LEFT COLUMN: Main Dossier */}
        <article className="lg:col-span-3">
          <Link href="/codex" className="text-[#4A90E2] text-[10px] font-black uppercase tracking-widest hover:underline mb-12 block">
            &larr; BACK_TO_CENTRAL_MANIFEST
          </Link>

          <header className="mb-12 border-b border-slate-900 pb-10">
            {/* ✅ Header with badges + ShareBriefing */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-blue-950/30 border border-blue-900/50 text-[#4A90E2] text-[10px] font-bold uppercase">
                  CAT_{post.category}
                </span>
                {post.is_featured === 1 && (
                  <span className="px-3 py-1 bg-red-950/30 border border-red-900/50 text-red-500 text-[10px] font-bold animate-pulse">
                    PRIORITY_EXHIBIT
                  </span>
                )}
              </div>
              {/* ✅ ShareBriefing component */}
              <ShareBriefing slug={post.slug} />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-6 leading-none uppercase">
              {post.title}
            </h1>

            <p className="text-slate-500 text-sm italic mb-6 leading-relaxed border-l-2 border-slate-800 pl-4">
              &quot;{post.summary}&quot;
            </p>
            
            {/* ✅ Metadata row */}
            <div className="flex gap-8 text-[9px] text-slate-700 font-bold uppercase tracking-[0.2em]">
              <span>
                LOG_DEPOSITED: {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'TIMESTAMP_PENDING'}
              </span>
              <span>KEYWORDS: {post.seo_keywords || "NONE"}</span>
            </div>
          </header>

          {/* MAIN CONTENT */}
          <section className="prose prose-invert prose-slate max-w-none mb-20 
            prose-headings:italic prose-headings:tracking-tighter prose-headings:font-black
            prose-a:text-[#4A90E2] prose-strong:text-white prose-p:leading-8 font-sans">
            <MarkdownRenderer content={post.content} />
          </section>

          {/* DYNAMIC BLOCK: CRIMES_COMMITTED (Only shows for specific categories) */}
          {post.category.includes("CRIME") && (
            <section className="border-2 border-red-900/20 bg-red-950/5 p-8 mb-20">
              <h2 className="text-red-500 font-black italic uppercase tracking-tighter mb-4 text-xl">
                Statutory_Violations_Detected
              </h2>
              <p className="text-xs text-slate-500 mb-6 font-mono">
                The following violations have been cross-referenced with the Public Codex:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 border border-red-900/10 text-[10px] text-red-200">
                  <span className="block font-black text-red-500 mb-1">OFFENSE_01</span>
                  Breach of Fiduciary Duty to the Public
                </div>
                <div className="bg-black/40 p-4 border border-red-900/10 text-[10px] text-red-200">
                  <span className="block font-black text-red-500 mb-1">OFFENSE_02</span>
                  Willful Misrepresentation of Official Data
                </div>
              </div>
            </section>
          )}
        </article>

        {/* RIGHT COLUMN: Sidebar Intel */}
        <aside className="space-y-12 border-l border-slate-900 pl-8 hidden lg:block">
          <SidebarWidget 
            title="Related_Briefings"
            accentColor="#4A90E2"
            items={related.map(r => ({
              label: r.title,
              href: `/articles/${r.slug}`,
              timestamp: "LINKED"
            }))}
          />

          <div className="p-6 bg-slate-950 border border-slate-900">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Meta_Tags</h4>
            <div className="flex flex-wrap gap-2">
              {post.seo_keywords.split(',').map(tag => (
                <span key={tag} className="text-[8px] border border-slate-800 px-2 py-1 text-slate-600 uppercase">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
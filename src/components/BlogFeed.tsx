import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from 'next/link';

export const dynamic = "force-dynamic";

interface Post {
  id: number;
  title: string;
  slug: string;
  summary: string;
  category: string;
  created_at: string;
}

export default async function BlogFeed() {
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as { DB: D1Database };

  const { results: posts } = await env.DB.prepare(
    "SELECT id, title, slug, summary, category, created_at FROM posts ORDER BY created_at DESC LIMIT 3"
  ).all() as { results: Post[] };

  if (!posts || posts.length === 0) return null;

  return (
    <section className="mt-24">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">Narrative_Logs</h2>
        <div className="h-[1px] flex-grow bg-slate-900"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group relative bg-slate-950/40 border border-slate-900 p-6 hover:border-[#4A90E2]/50 transition-all">
            <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-slate-800 uppercase tracking-widest">
              Log_ID: {post.id.toString().padStart(3, '0')}
            </div>
            
            <span className="text-[9px] font-bold text-[#4A90E2] uppercase tracking-[0.2em] mb-4 block">
              [{post.category}]
            </span>
            
            <h3 className="text-xl font-black text-white italic tracking-tighter mb-3 group-hover:text-[#4A90E2] transition-colors leading-tight">
              {post.title}
            </h3>
            
            <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-6 font-medium">
              {post.summary}
            </p>

            <div className="text-[9px] text-slate-700 font-bold uppercase tracking-widest flex justify-between items-center border-t border-slate-900 pt-4">
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              <span className="group-hover:translate-x-1 transition-transform">Read_Full_Entry &rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
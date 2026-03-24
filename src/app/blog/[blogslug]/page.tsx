export const dynamic = "force-dynamic";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import Link from "next/link";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface Post {
  id: number;
  title: string;
  blogslug: string;
  summary: string;
  content: string;
  category: string;
  created_at: string;
}

interface CloudflareEnv {
  DB: D1Database;
}

export default async function PostPage({ params }: { params: Promise<{ blogslug: string }> }) {
  const { blogslug } = await params;
  const context = await getCloudflareContext({ async: true });
  const env = (context.env as unknown) as CloudflareEnv;

  const post = await env.DB.prepare(
    "SELECT * FROM posts WHERE blogslug = ?"
  ).bind(blogslug).first() as Post | null;

  if (!post) notFound();

  return (
    <article className="min-h-screen bg-black text-slate-300 font-mono">
      <header className="border-b border-slate-900 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-[#4A90E2] text-[10px] font-black uppercase tracking-widest hover:underline mb-8 block">
            &larr; Return_To_Matrix
          </Link>
          
          <div className="inline-block px-3 py-1 bg-red-950/20 border border-red-900/50 text-red-500 text-[10px] font-bold uppercase tracking-widest mb-6">
            Subject_File: {post.category}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-6 leading-none">
            {post.title}
          </h1>
          
          <div className="flex gap-8 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
            <span>Published: {new Date(post.created_at).toLocaleDateString()}</span>
            <span>Status: Verified_Entry</span>
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto py-16 px-6 leading-relaxed">
        <div className="font-sans text-slate-300 prose prose-invert prose-slate max-w-none 
          prose-headings:italic prose-headings:tracking-tighter prose-headings:font-black
          prose-a:text-[#4A90E2] prose-strong:text-white">
          <MarkdownRenderer content={post.content} />
        </div>
      </section>

      <footer className="border-t border-slate-900 py-12 px-6 bg-slate-950/20">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <div className="w-12 h-1 bg-[#4A90E2] mb-6"></div>
          <p className="text-[10px] text-slate-700 tracking-[0.4em] uppercase text-center">
            Digital Chain of Custody // Integrity Verified // End of Entry
          </p>
        </div>
      </footer>
    </article>
  );
}
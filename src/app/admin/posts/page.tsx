// File: src/app/admin/posts/page.tsx
"use client";
export const dynamic = "force-dynamic";

import { savePost, getBlogPosts, deleteBlogPost } from "./actions";
import { getEvidenceRecords, deleteEvidenceRecord } from "@/app/admin/actions";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminGuard from "@/components/admin/AdminGuard";
import { slugify } from "@/lib/stringutils";

type ViewMode = 'EVIDENCE' | 'POSTS';

interface HubRecord {
  id: number;
  title: string;
  content: string;
  slug?: string;
  category?: string;
  summary?: string;
  is_featured?: number;
  seo_description?: string;
  seo_keywords?: string;
  [key: string]: unknown;
}

interface TaxonomyTerm {
  id: number;
  name: string;
  slug: string;
  type: string;
}

export default function AdminPostsPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('POSTS');
  const [records, setRecords] = useState<HubRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<TaxonomyTerm[]>([]);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [seoDesc, setSeoDesc] = useState('');
  const [seoKey, setSeoKey] = useState('');

  // Exposing a simple loader function for manual triggers (like Delete/Submit)
  const loadData = async () => {
    setLoading(true);
    const result = viewMode === 'EVIDENCE' ? await getEvidenceRecords() : await getBlogPosts(); 
    if (result.success && result.data) {
      setRecords(result.data as unknown as HubRecord[]);
    } else {
      setRecords([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      // Small promise delay circumvents React synchronous effect warning
      await Promise.resolve();
      if (!isMounted) return;
      
      setLoading(true);
      const result = viewMode === 'EVIDENCE' ? await getEvidenceRecords() : await getBlogPosts(); 
      if (isMounted) {
        if (result.success && result.data) {
          setRecords(result.data as unknown as HubRecord[]);
        } else {
          setRecords([]);
        }
        setLoading(false);
      }
    };
    
    init();

    fetch('/api/taxonomy')
      .then(res => res.json() as Promise<{ terms: TaxonomyTerm[] }>)
      .then(data => {
        if (isMounted && data.terms) {
          setCategories(data.terms.filter(t => t.type === 'category'));
        }
      })
      .catch(console.error);

    return () => { isMounted = false; };
  }, [viewMode]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) setSlug(slugify(val));
  };

  const handleEdit = (record: HubRecord) => {
    setEditingId(record.id);
    setTitle(record.title || '');
    setSlug(record.slug || '');
    setCategory(record.category || '');
    setSummary(record.summary || '');
    setContent(record.content || '');
    setIsFeatured(record.is_featured === 1);
    setSeoDesc(record.seo_description || '');
    setSeoKey(record.seo_keywords || '');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle(''); setSlug(''); setCategory(''); setSummary(''); 
    setContent(''); setIsFeatured(false); setSeoDesc(''); setSeoKey('');
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("Syncing_With_Matrix...");
    
    const formData = new FormData();
    if (editingId) formData.append("id", editingId.toString());
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("category", category);
    formData.append("summary", summary);
    formData.append("content", content);
    formData.append("is_featured", isFeatured ? "1" : "0");
    formData.append("seo_description", seoDesc);
    formData.append("seo_keywords", seoKey);

    const result = await savePost(formData);
    if (result.success) {
      setStatus("Entry_Verified_And_Logged.");
      resetForm();
      loadData();
    } else {
      setStatus("Error: Sync_Failed.");
    }
  }

  const handlePurge = async (id: number) => {
    if (window.confirm("CRITICAL_PURGE: Are you sure?")) {
      const result = viewMode === 'EVIDENCE' ? await deleteEvidenceRecord(id) : await deleteBlogPost(id);
      if (result.success) loadData();
      else alert("PURGE_FAILED: Database rejected the request.");
    }
  };

  const inputClass = "bg-slate-950 border border-slate-800 p-3 text-sm focus:border-[#4A90E2] outline-none transition-colors w-full";

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-black text-white font-mono">
        <AdminSidebar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <header className="mb-12 border-b border-slate-900 pb-6 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase">Intelligence_Dispatch</h1>
                <p className="text-slate-500 text-[10px] mt-2 tracking-[0.3em]">SECURE_NODE // POST_EDITOR_V2</p>
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => setViewMode('POSTS')} className={`text-[10px] px-4 py-2 border font-black uppercase tracking-widest transition-all ${viewMode === 'POSTS' ? 'border-[#4A90E2] text-[#4A90E2] bg-[#4A90E2]/10' : 'border-slate-800 text-slate-600 hover:border-[#4A90E2]'}`}>Posts_View</button>
                <button onClick={() => setViewMode('EVIDENCE')} className={`text-[10px] px-4 py-2 border font-black uppercase tracking-widest transition-all ${viewMode === 'EVIDENCE' ? 'border-[#4A90E2] text-[#4A90E2] bg-[#4A90E2]/10' : 'border-slate-800 text-slate-600 hover:border-[#4A90E2]'}`}>Evidence_View</button>
              </div>
            </header>

            {loading ? (
              <div className="animate-pulse text-[#4A90E2] tracking-[0.3em]">INITIALIZING_SCAN...</div>
            ) : (
              <div className="mb-16">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[#4A90E2] text-xs font-black uppercase tracking-[0.3em]">
                    {viewMode === 'EVIDENCE' ? 'Evidence_Archive' : 'Post_Registry'} ({records.length})
                  </h2>
                  <button
                    onClick={loadData}
                    className="text-[10px] border border-slate-700 px-4 py-2 hover:bg-[#4A90E2] hover:text-black transition-all font-bold uppercase tracking-widest"
                  >
                    Rescan_DB
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {records.map((item) => (
                    <div key={item.id} className={`border p-6 rounded-lg transition-all ${editingId === item.id ? 'border-[#4A90E2] bg-[#4A90E2]/5' : 'border-slate-800 bg-slate-900/10 hover:border-slate-600'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          {item.category && <span className="text-[9px] text-[#4A90E2] uppercase font-bold tracking-widest mb-1 block">[{item.category}]</span>}
                          <h3 className="text-lg font-bold text-white uppercase tracking-tight">{item.title}</h3>
                        </div>
                        <div className="flex gap-2">
                          {viewMode === 'POSTS' && (
                            <button onClick={() => handleEdit(item)} className="text-[9px] font-black px-3 py-1 border border-slate-800 hover:bg-white hover:text-black transition-all uppercase">Edit</button>
                          )}
                          <button onClick={() => handlePurge(item.id)} className="text-[9px] font-black px-3 py-1 border border-red-900 text-red-900 hover:bg-red-900 hover:text-white transition-all uppercase">Purge</button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 font-sans line-clamp-2">{item.summary || item.content}</p>
                    </div>
                  ))}
                  {records.length === 0 && <div className="text-center py-20 border border-dashed border-slate-800 text-slate-600 uppercase text-xs">No records found.</div>}
                </div>
              </div>
            )}

            {viewMode === 'POSTS' && (
              <section className="border border-[#4A90E2]/30 p-8 bg-slate-900/10 rounded-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[#4A90E2] text-xs font-black uppercase tracking-[0.3em]">
                    {editingId ? `Modify_Post [ID: ${editingId}]` : "New_Post_Composition"}
                  </h2>
                  {editingId && <button type="button" onClick={resetForm} className="text-[9px] text-slate-500 uppercase hover:text-white underline">[ ABORT_EDIT ]</button>}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Entry_Title</label>
                      <input required className={inputClass} value={title} onChange={e => handleTitleChange(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">URL_Slug</label>
                      <input required className={`${inputClass} border-dashed text-[#4A90E2]`} value={slug} onChange={e => setSlug(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Taxonomy_Category</label>
                    <select className={inputClass} value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="">-- SELECT_CATEGORY --</option>
                      {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Manifest_Summary</label>
                    <textarea rows={2} required className={inputClass} value={summary} onChange={e => setSummary(e.target.value)} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Full_Narrative_Content (Markdown)</label>
                    <textarea rows={10} required className={`${inputClass} font-sans normal-case`} value={content} onChange={e => setContent(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">SEO_Keywords</label>
                      <input className={inputClass} value={seoKey} onChange={e => setSeoKey(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">SEO_Description</label>
                      <textarea rows={2} className={inputClass} value={seoDesc} onChange={e => setSeoDesc(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-4 border-y border-slate-900">
                    <input type="checkbox" id="featured" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-[#4A90E2]" />
                    <label htmlFor="featured" className="text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer">Promote_To_Primary_Matrix (Featured)</label>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-600">{status}</span>
                    <button type="submit" className="bg-[#4A90E2] text-black font-black uppercase px-10 py-4 italic tracking-tighter hover:bg-white transition-all">
                      {editingId ? "UPDATE_BROADCAST" : "INITIALIZE_BROADCAST"} &rarr;
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
"use client";

export const dynamic = "force-dynamic";

import { savePost, getBlogPosts, deleteBlogPost } from "./actions";
import { getEvidenceRecords, deleteEvidenceRecord } from "@/app/admin/actions";
import { useState, useCallback, useEffect } from "react";

type ViewMode = 'EVIDENCE' | 'POSTS';

interface HubRecord {
  id: number;
  title: string;
  content: string;
  [key: string]: unknown;
}

export default function AdminPostsPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('POSTS');
  const [records, setRecords] = useState<HubRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = viewMode === 'EVIDENCE' 
      ? await getEvidenceRecords() 
      : await getBlogPosts(); 

    if (result.success && result.data) {
      setRecords(result.data as unknown as HubRecord[]);
    } else {
      setRecords([]);
    }
    setLoading(false);
  }, [viewMode]);

  useEffect(() => {
    let isMounted = true;
    const initializeTerminal = async () => {
      const result = viewMode === 'EVIDENCE' 
        ? await getEvidenceRecords() 
        : await getBlogPosts(); 

      if (isMounted) {
        if (result.success && result.data) {
          setRecords(result.data as unknown as HubRecord[]);
        }
        setLoading(false);
      }
    };
    initializeTerminal();
    return () => { isMounted = false; };
  }, [viewMode]);

  async function handleSubmit(formData: FormData) {
    setStatus("Syncing_With_Matrix...");
    const result = await savePost(formData);
    if (result.success) {
      setStatus("Entry_Verified_And_Logged.");
      const form = document.getElementById("post-form") as HTMLFormElement;
      if (form) form.reset();
      loadData();
    } else {
      setStatus("Error: Sync_Failed.");
    }
  }

  const handlePurge = async (id: number) => {
    if (window.confirm("CRITICAL_PURGE: Are you sure?")) {
      const result = viewMode === 'EVIDENCE' 
        ? await deleteEvidenceRecord(id) 
        : await deleteBlogPost(id);
      
      if (result.success) {
        loadData();
      } else {
        alert("PURGE_FAILED: Database rejected the request.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-slate-900 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">Intelligence_Dispatch_Terminal</h1>
            <p className="text-slate-500 text-[10px] mt-2 tracking-[0.3em]">SECURE_NODE // POST_EDITOR_V1</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('POSTS')}
              className={`text-[10px] px-4 py-2 border font-black uppercase tracking-widest transition-all ${
                viewMode === 'POSTS' 
                  ? 'border-[#4A90E2] text-[#4A90E2] bg-[#4A90E2]/10' 
                  : 'border-slate-800 text-slate-600 hover:border-[#4A90E2]'
              }`}
            >
              Posts_View
            </button>
            <button
              onClick={() => setViewMode('EVIDENCE')}
              className={`text-[10px] px-4 py-2 border font-black uppercase tracking-widest transition-all ${
                viewMode === 'EVIDENCE' 
                  ? 'border-[#4A90E2] text-[#4A90E2] bg-[#4A90E2]/10' 
                  : 'border-slate-800 text-slate-600 hover:border-[#4A90E2]'
              }`}
            >
              Evidence_View
            </button>
          </div>
        </header>

        {loading ? (
          <div className="animate-pulse text-[#4A90E2] tracking-[0.3em]">INITIALIZING_SCAN...</div>
        ) : (
          <div className="mb-12">
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
                <div
                  key={item.id}
                  className="border border-slate-800 bg-slate-900/10 p-6 rounded-lg hover:border-[#4A90E2]/40 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight">{item.title}</h3>
                    </div>
                    <button 
                      onClick={() => handlePurge(item.id)}
                      className="text-[9px] font-black px-3 py-1 border border-red-900 text-red-900 hover:bg-red-900 hover:text-white transition-all uppercase"
                    >
                      Purge
                    </button>
                  </div>
                  <p className="text-sm text-slate-400 font-sans line-clamp-2">
                    {item.content}
                  </p>
                  <div className="mt-4 text-[9px] text-slate-600 uppercase">
                    Record_ID: {item.id}
                  </div>
                </div>
              ))}
              {records.length === 0 && (
                <div className="text-center py-20 border border-dashed border-slate-800 text-slate-600 uppercase text-xs tracking-widest">
                  No records found in the current {viewMode.toLowerCase()} sector.
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'POSTS' && (
          <section className="border border-[#4A90E2]/30 p-8 bg-slate-900/10 rounded-lg">
            <h2 className="text-[#4A90E2] text-xs font-black uppercase tracking-[0.3em] mb-6">
              New_Post_Composition
            </h2>
            
            <form id="post-form" action={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-[#4A90E2] font-black uppercase tracking-widest">Entry_Title</label>
                  <input name="title" required className="bg-slate-950 border border-slate-800 p-3 text-sm focus:border-[#4A90E2] outline-none transition-colors" placeholder="Ex: The Redford Incident" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-[#4A90E2] font-black uppercase tracking-widest">URL_Slug</label>
                  <input name="slug" required className="bg-slate-950 border border-slate-800 p-3 text-sm focus:border-[#4A90E2] outline-none transition-colors" placeholder="redford-incident-01" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-[#4A90E2] font-black uppercase tracking-widest">Category</label>
                <select name="category" className="bg-slate-950 border border-slate-800 p-3 text-sm outline-none">
                  <option value="Personal Story">Personal Story</option>
                  <option value="How-To">How-To</option>
                  <option value="Legal Analysis">Legal Analysis</option>
                  <option value="Update">System Update</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-[#4A90E2] font-black uppercase tracking-widest">Manifest_Summary</label>
                <textarea name="summary" rows={2} required className="bg-slate-950 border border-slate-800 p-3 text-sm focus:border-[#4A90E2] outline-none transition-colors" placeholder="Brief overview for the feed cards..." />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-[#4A90E2] font-black uppercase tracking-widest">Full_Narrative_Content (Markdown_Supported)</label>
                <textarea name="content" rows={15} required className="bg-slate-950 border border-slate-800 p-3 text-sm focus:border-[#4A90E2] outline-none transition-colors font-sans" placeholder="Paste your Google Doc content here..." />
              </div>

              <div className="flex items-center gap-4 py-4 border-y border-slate-900">
                <input type="checkbox" name="is_featured" value="1" id="featured" className="w-4 h-4 accent-[#4A90E2]" />
                <label htmlFor="featured" className="text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer">Promote_To_Primary_Matrix (Featured)</label>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-600">{status}</span>
                <button type="submit" className="bg-[#4A90E2] text-black font-black uppercase px-10 py-4 italic tracking-tighter hover:bg-white transition-all">
                  Initialize_Broadcast &rarr;
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
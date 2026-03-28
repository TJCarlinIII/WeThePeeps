// File: src/app/admin/statutes/StatuteRegistry.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import StatuteForm, { Statute } from '@/components/admin/forms/StatuteForm';

interface Taxonomy { id: number; name: string; type: 'category' | 'tag'; slug: string; }

export default function StatuteRegistry() {
  const [rows, setRows] = useState<Statute[]>([]);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const refreshData = useCallback(async () => {
    try {
      const [statRes, taxRes] = await Promise.all([
        fetch('/api/statutes'),
        fetch('/api/taxonomy')
      ]);

      const statData = await statRes.json() as { results: Statute[] };
      const taxData = await taxRes.json() as { terms: Taxonomy[] };

      setRows(statData.results || []);
      setTaxonomies(taxData.terms || []);
    } catch (err) {
      console.error("FETCH_ERROR:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) await refreshData();
    };
    init();
    return () => { isMounted = false };
  }, [refreshData]);

  const handleSave = async (formData: Statute) => {
    const method = isEditing ? 'PATCH' : 'POST';
    try {
      const res = await fetch('/api/statutes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsEditing(false);
        setSelectedId(null);
        await refreshData();
      } else {
        alert("CRITICAL_ERROR: Failed to save record.");
      }
    } catch (err) {
      console.error("SAVE_ERROR:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("PURGE_STATUTE? This action cannot be undone.")) {
      try {
        const res = await fetch(`/api/statutes?id=${id}`, { method: 'DELETE' });
        if (res.ok) await refreshData();
      } catch (err) {
        console.error("DELETE_ERROR:", err);
      }
    }
  };

  const toggleExpand = (id: number) => setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const selectedRow = rows.find(r => r.id === selectedId);

  return (
    <div className="flex min-h-screen bg-black text-white font-mono">
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-8 border-b border-slate-900 pb-4">
          <Link href="/admin" className="group flex items-center gap-3 bg-slate-900/50 hover:bg-blue-600/20 px-4 py-2 rounded border border-slate-800 transition-all">
            <span className="text-blue-500 text-lg">«</span>
            <span className="text-white font-bold uppercase tracking-widest text-[10px]">Back_to_Control_Center</span>
          </Link>
          <div className="text-right">
            <h1 className="text-white font-black tracking-widest text-lg uppercase">Statute_Codex</h1>
            <p className="text-[9px] text-slate-600 uppercase tracking-widest">Node_Status: Online</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-5 sticky top-6 bg-slate-950/50 border border-slate-800 p-6 rounded shadow-xl h-fit">
             <h2 className="text-sm font-black text-blue-500 mb-6 uppercase tracking-widest border-b border-slate-900 pb-3">
               {isEditing ? `Override_Statute [ID: ${selectedId}]` : 'Initialize_New_Statute'}
             </h2>
             <StatuteForm key={selectedId || 'new'} initialData={isEditing ? selectedRow : null} taxonomies={taxonomies} onSave={handleSave} />
             {isEditing && (
               <button onClick={() => { setIsEditing(false); setSelectedId(null); }} className="w-full mt-4 py-3 text-[10px] text-slate-500 hover:text-white uppercase font-bold border border-dashed border-slate-800 transition-all">
                 [ Abort_Edit ]
               </button>
             )}
          </div>

          <div className="xl:col-span-7">
            <h2 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] mb-4 border-b border-slate-900 pb-2">Live_Manifest</h2>
            <div className="space-y-4">
              {rows.map(row => {
                const isExpanded = expandedIds.includes(row.id!);
                return (
                  <div key={row.id} className={`bg-black border-2 transition-all duration-300 ${selectedId === row.id ? 'border-blue-600 bg-blue-900/5' : 'border-slate-900'}`}>
                    <div className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="cursor-pointer flex-1" onClick={() => toggleExpand(row.id!)}>
                          <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest bg-blue-900/20 px-2 py-1 rounded mr-2">
                            [ {row.citation} ]
                          </span>
                          <h3 className="text-xl font-black text-white uppercase mt-2 tracking-tight group-hover:text-blue-400">
                            {row.title}
                          </h3>
                        </div>

                        <div className="flex gap-3 items-center">
                          <button onClick={() => toggleExpand(row.id!)} className="bg-slate-900 border border-slate-700 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:bg-slate-800 transition-all">
                            {isExpanded ? "↑ LESS" : "↓ MORE"}
                          </button>
                          <button onClick={() => { setSelectedId(row.id!); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="bg-blue-900/40 border border-blue-500/50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-blue-200 hover:bg-blue-600 hover:text-white transition-all">
                            EDIT
                          </button>
                          <button onClick={() => handleDelete(row.id!)} className="bg-red-950/40 border border-red-900 px-4 py-2 text-[10px] font-bold text-red-500 hover:bg-red-600 hover:text-white transition-all">
                            [X]
                          </button>
                        </div>
                      </div>

                      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1200px] opacity-100 mt-4 border-t border-slate-900 pt-4' : 'max-h-0 opacity-0'}`}>
                        <p className="text-sm text-slate-400 leading-relaxed font-sans mb-4 italic">
                          {row.summary || "NO_SUMMARY_PROVIDED"}
                        </p>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black text-emerald-900 uppercase">WEBSITE:</span>
                          <p className="text-[11px] text-emerald-600 font-mono">{row.official_website_url || 'NOT_SET'}</p>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black text-slate-800 uppercase">SLUG:</span>
                          <p className="text-[11px] text-slate-600 font-mono">/{row.slug}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
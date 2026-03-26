"use client";
import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminSidebar from "@/components/admin/AdminSidebar";
import TaxonomyForm, { Taxonomy } from '@/components/admin/forms/TaxonomyForm';
import { deleteTaxonomyTerm } from "../actions";

interface RegistryProps {
  initialTerms: Taxonomy[];
}

export default function TaxonomyRegistry({ initialTerms }: RegistryProps) {
  const [editingTerm, setEditingTerm] = useState<Taxonomy | null>(null);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'category' | 'tag'>('all');
  const router = useRouter();

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredTerms = initialTerms.filter(term =>
    activeFilter === 'all' ? true : term.type === activeFilter
  );

  const handleRefresh = useCallback(() => {
    setEditingTerm(null);
    router.refresh();
  }, [router]);

  return (
    <div className="flex min-h-screen bg-black text-slate-300 font-mono">
      <AdminSidebar />

      <main className="flex-1 p-6 overflow-y-auto">
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-900 pb-4">
          <Link href="/admin" className="group flex items-center gap-3 bg-slate-900/50 hover:bg-blue-600/20 px-4 py-2 rounded border border-slate-800 transition-all">
            <span className="text-blue-500 text-lg">«</span>
            <span className="text-white font-bold uppercase tracking-widest text-[10px]">Back_to_Control_Center</span>
          </Link>

          <div className="text-right">
            <h1 className="text-white font-black tracking-widest text-lg uppercase">Taxonomy_Architect</h1>
            <p className="text-[9px] text-slate-600 uppercase tracking-widest">Node_Status: Online</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* FORM COLUMN (Left) */}
          <div className="xl:col-span-5 sticky top-6 bg-slate-950/50 border border-slate-800 p-6 rounded shadow-xl h-fit">
            <h2 className="text-sm font-black text-blue-500 mb-6 uppercase tracking-widest border-b border-slate-900 pb-3">
              {editingTerm ? "Edit_Record" : "Create_New_Node"}
            </h2>

            <TaxonomyForm 
              key={editingTerm?.id || 'new'} 
              initialData={editingTerm} 
              onSave={handleRefresh} 
            />

            {editingTerm && (
              <button
                onClick={() => setEditingTerm(null)}
                className="w-full mt-4 py-3 text-[10px] text-slate-500 hover:text-white uppercase font-bold border border-dashed border-slate-800 transition-all"
              >
                [ Abort_Edit ]
              </button>
            )}
          </div>

          {/* LIST COLUMN (Right) */}
          <div className="xl:col-span-7 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-900 pb-4">
              <h2 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em]">Live_Registry</h2>
              <div className="flex gap-2">
                {['all', 'category', 'tag'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f as 'all' | 'category' | 'tag')} // Specific cast
                    className={`px-3 py-1 text-[9px] font-black uppercase border transition-all ${
                      activeFilter === f ? 'bg-white text-black border-white' : 'border-slate-800 text-slate-500 hover:text-white'
                    }`}
                  >
                    [{f}]
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredTerms.map((term) => {
                const isExpanded = expandedIds.includes(term.id!);
                return (
                  <div key={term.id} className={`bg-black border-2 transition-all duration-300 ${editingTerm?.id === term.id ? 'border-blue-600 bg-blue-900/5' : 'border-slate-900'}`}>
                    <div className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="cursor-pointer flex-1" onClick={() => setEditingTerm(term)}>
                          <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest bg-blue-900/20 px-2 py-1 rounded">
                            [{term.type}]
                          </span>
                          <h3 className="text-xl font-black text-white uppercase mt-2 tracking-tight group-hover:text-blue-400">
                            {term.name}
                          </h3>
                        </div>

                        <div className="flex gap-3 items-center">
                          <button onClick={() => toggleExpand(term.id!)} className="bg-slate-900 border border-slate-700 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                            {isExpanded ? "↑ LESS" : "↓ MORE"}
                          </button>
                          <button onClick={() => setEditingTerm(term)} className="bg-blue-900/40 border border-blue-500/50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-blue-200">
                            EDIT
                          </button>
                          <button 
                            onClick={async () => { if(confirm('Purge Record?')) { await deleteTaxonomyTerm(term.id!); handleRefresh(); }}}
                            className="bg-red-950/40 border border-red-900 px-4 py-2 text-[10px] font-bold text-red-500"
                          >
                            [X]
                          </button>
                        </div>
                      </div>

                      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100 mt-4 border-t border-slate-900 pt-4' : 'max-h-0 opacity-0'}`}>
                        <p className="text-sm text-slate-400 leading-relaxed font-sans mb-4 italic">
                          {term.seo_description || "NO_DESCRIPTION_SET"}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-emerald-900 uppercase">SEO_KEYWORDS:</span>
                          <p className="text-[11px] text-emerald-600 font-mono">{term.seo_keywords || 'NOT_SET'}</p>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-800 uppercase">SLUG:</span>
                          <p className="text-[11px] text-slate-600 font-mono">/{term.slug}</p>
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
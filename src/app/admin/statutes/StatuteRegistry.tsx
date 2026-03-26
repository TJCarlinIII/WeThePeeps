// File: src/app/admin/statutes/StatuteRegistry.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from 'next/link';
import { Edit, Trash2, Loader2 } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import StatuteForm, { Statute, Taxonomy } from '@/components/admin/forms/StatuteForm';

export default function StatuteRegistry() {
  const [statutes, setStatutes] = useState<Statute[]>([]);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statRes, taxRes] = await Promise.all([
        fetch('/api/statutes'),
        fetch('/api/taxonomy')
      ]);
      
      const statData = (await statRes.json()) as { results: Statute[] };
      const taxData = (await taxRes.json()) as { terms: Taxonomy[] };
      
      setStatutes(statData.results || []);
      setTaxonomies((taxData.terms || []).filter((t: Taxonomy) => t.type === 'category' || t.type === 'statute'));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("PURGE_STATUTE?")) return;
    try {
      const res = await fetch(`/api/statutes?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const selectedRow = statutes.find(r => r.id === selectedId);

  return (
    <div className="flex min-h-screen bg-black text-white font-mono">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8 border-b border-slate-900 pb-4">
          <Link href="/admin" className="bg-slate-900 px-4 py-2 border border-slate-800 text-[10px] font-bold uppercase hover:bg-blue-600 transition-all">
            « Back_to_Control_Center
          </Link>
          <div className="text-right">
            <h1 className="text-xl font-black tracking-tighter uppercase">Statute_Codex</h1>
            <p className="text-[9px] text-slate-500 uppercase">System: Legal_Frameworks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-5 bg-slate-950/50 border border-slate-800 p-6 rounded sticky top-8 h-fit">
            <h2 className="text-blue-500 text-[10px] font-black uppercase mb-6 tracking-widest">
              {isEditing ? `Modify_Statute [ID: ${selectedId}]` : 'Initialize_New_Statute'}
            </h2>
            <StatuteForm key={selectedId || 'new'} initialData={isEditing ? selectedRow : null} taxonomies={taxonomies} onSave={handleSave} />
            {isEditing && (
              <button onClick={() => { setIsEditing(false); setSelectedId(null); }} className="w-full mt-4 py-3 text-[10px] text-slate-500 hover:text-white uppercase font-bold border border-dashed border-slate-800 transition-all">
                [ Abort_Edit ]
              </button>
            )}
          </div>

          <div className="xl:col-span-7">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em]">Active_Statutes</h2>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />}
            </div>

            <div className="space-y-2">
              {statutes.map((statute: Statute) => (
                <div key={statute.id} className={`p-4 border transition-all ${selectedId === statute.id ? 'border-blue-500 bg-blue-900/10' : 'border-slate-900 bg-black'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-black uppercase">{statute.title}</h3>
                      <p className="text-slate-500 text-[9px] font-mono uppercase">
                        CITATION: {statute.citation} | CATEGORY: {statute.category || 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedId(statute.id!); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="border border-slate-800 px-3 py-2 text-[10px] font-bold hover:bg-white hover:text-black transition-all">
                        <Edit className="h-3 w-3 inline mr-1" /> EDIT
                      </button>
                      <button onClick={() => handleDelete(statute.id!)} className="border border-red-900 px-3 py-2 text-[10px] font-bold text-red-500 hover:bg-red-600 hover:text-white transition-all">
                        <Trash2 className="h-3 w-3 inline mr-1" /> [X]
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
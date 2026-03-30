// File: src/app/admin/statutes/StatuteRegistry.tsx
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import StatuteForm, { Statute } from '@/components/admin/forms/StatuteForm';

interface Taxonomy { 
  id: number; 
  name: string; 
  type: 'category' | 'tag'; 
  slug: string; 
}

export default function StatuteRegistry() {
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const refreshData = useCallback(async (isMounted: boolean) => {
    try {
      // Fetch taxonomies for the form
      const taxRes = await fetch('/api/taxonomy');
      const taxData = await taxRes.json() as { terms: Taxonomy[] };
      
      if (isMounted) {
        setTaxonomies(taxData.terms || []);
      }
    } catch (err) {
      console.error("FETCH_ERROR:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    // Using an IIFE to wrap the async call
    (async () => {
      await refreshData(isMounted);
    })();
    return () => { isMounted = false; };
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
        await refreshData(true);
      } else {
        alert("CRITICAL_ERROR: Failed to save statute record.");
      }
    } catch (err) {
      console.error("SAVE_ERROR:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("PURGE_STATUTE? This action cannot be undone.")) {
      try {
        const res = await fetch(`/api/statutes?id=${id}`, { method: 'DELETE' });
        if (res.ok) await refreshData(true);
      } catch (err) {
        console.error("DELETE_ERROR:", err);
      }
    }
  };

  const toggleExpand = (id: number) => setExpandedIds(prev => 
    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  );

  // ✅ REMOVED: Layout wrapper (<main>, header, sidebar link) — now handled by page.tsx
  // This component is now a pure client-side registry

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Form Section */}
      <div className="xl:col-span-5 sticky top-6 bg-slate-950/50 border border-slate-800 p-6 rounded shadow-xl h-fit">
        <h2 className="text-sm font-black text-blue-500 mb-6 uppercase tracking-widest border-b border-slate-900 pb-3">
          {isEditing ? `Override_Statute [ID: ${selectedId}]` : 'Create_New_Node'}
        </h2>
        {/* ✅ FIX: Pass required props to StatuteForm */}
        <StatuteForm 
          key={selectedId || 'new'} 
          initialData={null} 
          taxonomies={taxonomies} 
          onSave={handleSave} 
        />
        {isEditing && (
          <button onClick={() => { setIsEditing(false); setSelectedId(null); }} className="w-full mt-4 py-3 text-[10px] text-slate-500 hover:text-white uppercase font-bold border border-dashed border-slate-800 transition-all">
            [ Abort_Edit ]
          </button>
        )}
      </div>

      {/* Manifest Section */}
      <div className="xl:col-span-7">
        <h2 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] mb-4 border-b border-slate-900 pb-2">Live_Manifest</h2>
        <div className="space-y-4">
          {/* Add your statute list rendering here */}
          <p className="text-slate-600 text-xs italic">Statute list rendering pending implementation...</p>
        </div>
      </div>
    </div>
  );
}
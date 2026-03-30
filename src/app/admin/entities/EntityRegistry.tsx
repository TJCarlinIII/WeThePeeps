// src/app/admin/entities/EntityRegistry.tsx
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import EntityForm, { Entity } from '@/components/admin/forms/EntityForm';

interface Sector { id: number; name: string; }
interface Taxonomy { id: number; name: string; type: 'category' | 'tag'; slug: string; }

interface ApiEntity extends Entity {
  is_critical?: number | string;
  sector_name?: string;
  parent_name?: string;
  total_rebuttals?: number;
}

export default function EntityRegistry() {
  const [rows, setRows] = useState<ApiEntity[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const refreshData = useCallback(async (isMounted: boolean) => {
    try {
      const [entRes, secRes, taxRes] = await Promise.all([
        fetch('/api/entities'),
        fetch('/api/sectors'),
        fetch('/api/taxonomy')
      ]);

      const entData = await entRes.json() as { results: ApiEntity[] };
      const secData = await secRes.json() as { results: Sector[] };
      const taxData = await taxRes.json() as { terms: Taxonomy[] };

      if (isMounted) {
        setRows(entData.results || []);
        setSectors(secData.results || []);
        setTaxonomies(taxData.terms || []);
      }
    } catch (err) {
      console.error("FETCH_ERROR:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    // Standard pattern to satisfy ESLint and handle async within effects
    const initFetch = async () => {
      await refreshData(isMounted);
    };
    initFetch();
    return () => { isMounted = false; };
  }, [refreshData]);

  const handleSave = async (formData: Entity) => {
    const method = isEditing ? 'PATCH' : 'POST';
    try {
      const res = await fetch('/api/entities', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsEditing(false);
        setSelectedId(null);
        await refreshData(true);
      } else {
        alert("CRITICAL_ERROR: Failed to save record.");
      }
    } catch (err) {
      console.error("SAVE_ERROR:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("PURGE_ENTITY? This action cannot be undone.")) {
      try {
        const res = await fetch(`/api/entities?id=${id}`, { method: 'DELETE' });
        if (res.ok) await refreshData(true);
      } catch (err) {
        console.error("DELETE_ERROR:", err);
      }
    }
  };

  const toggleExpand = (id: number) => setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const selectedRow = rows.find(r => r.id === selectedId);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Form Section */}
      <div className="xl:col-span-5 sticky top-6 bg-slate-950/50 border border-slate-800 p-6 rounded shadow-xl h-fit">
         <h2 className="text-sm font-black text-blue-500 mb-6 uppercase tracking-widest border-b border-slate-900 pb-3">
           {isEditing ? `Override_Entity [ID: ${selectedId}]` : 'Create_New_Node'}
         </h2>
         <EntityForm 
           key={selectedId || 'new'} 
           initialData={isEditing ? selectedRow : null} 
           sectors={sectors} 
           allEntities={rows.map(r => ({ id: r.id!, name: r.name }))}
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
          {rows.map(row => {
            const isExpanded = expandedIds.includes(row.id!);
            return (
              <div key={row.id} className={`bg-black border-2 transition-all duration-300 ${selectedId === row.id ? 'border-blue-600 bg-blue-900/5' : 'border-slate-900'}`}>
                <div className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="cursor-pointer flex-1" onClick={() => toggleExpand(row.id!)}>
                      <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest bg-blue-900/20 px-2 py-1 rounded mr-2">
                        [ {row.sector_name || "NO_SECTOR"} ]
                      </span>
                      <h3 className="text-xl font-black text-white uppercase mt-2 tracking-tight">
                        {row.name}
                      </h3>
                      {row.total_rebuttals !== undefined && row.total_rebuttals > 0 && (
                        <div className="mt-3 flex flex-col">
                          <span className="text-emerald-500 text-[8px] font-black border border-emerald-900/50 px-2 py-0.5 bg-emerald-900/10 w-fit">
                            {row.total_rebuttals}_LINKED_REBUTTALS
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 items-center">
                      <button onClick={() => toggleExpand(row.id!)} className="bg-slate-900 border border-slate-700 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:bg-slate-800">
                        {isExpanded ? "↑ LESS" : "↓ MORE"}
                      </button>
                      <button onClick={() => { setSelectedId(row.id!); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="bg-blue-900/40 border border-blue-500/50 px-4 py-2 text-[10px] font-bold text-blue-200 hover:bg-blue-600 hover:text-white">
                        EDIT
                      </button>
                      <button onClick={() => handleDelete(row.id!)} className="bg-red-950/40 border border-red-900 px-4 py-2 text-[10px] font-bold text-red-500 hover:bg-red-600 hover:text-white">
                        [X]
                      </button>
                    </div>
                  </div>

                  <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1200px] opacity-100 mt-4 border-t border-slate-900 pt-4' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-950/30 p-4 border border-slate-900">
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase block mb-1">Physical_Location</span>
                        <p className="text-xs text-white uppercase font-bold">
                          {row.address ? `${row.address}, ${row.city}, ${row.state} ${row.zip_code}` : 'NO_ADDRESS_SET'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase block mb-1">Contact_Line</span>
                        <p className="text-xs text-emerald-500 font-mono">{row.phone || 'NO_PHONE_LINKED'}</p>
                      </div>
                      <div className="mt-2">
                        <span className="text-[8px] text-slate-500 uppercase block mb-1">Parent_Node</span>
                        <p className="text-xs text-slate-300 font-bold uppercase">{row.parent_name || 'INDEPENDENT_ROOT'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1 text-[11px] font-mono">
                      <span className="text-[9px] font-black text-emerald-900 uppercase">WEBSITE:</span>
                      <span className="text-emerald-600 underline decoration-emerald-900/50">{row.official_website_url || 'NOT_SET'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600">
                      <span className="text-[9px] font-black text-slate-800 uppercase">SLUG:</span>
                      <span>/{row.slug}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
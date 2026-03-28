// File: src/app/admin/actors/ActorRegistry.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ActorForm, { Actor } from '@/components/admin/forms/ActorForm';
import { saveActor, deleteActor } from "./actions";

interface Entity { id: number; name: string; sector_id: number; }
interface Sector { id: number; name: string; }
interface Taxonomy { id: number; name: string; type: 'category' | 'tag'; slug: string; }

interface ApiActor extends Actor {
  entity_name?: string;
  rebuttal_count?: number; // NEW: count of rebuttals linked to this actor
}

export default function ActorRegistry() {
  const [rows, setRows] = useState<ApiActor[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const refreshData = useCallback(async (isMounted: boolean) => {
    try {
      const [actRes, entRes, secRes, taxRes] = await Promise.all([
        fetch('/api/actors'),
        fetch('/api/entities'),
        fetch('/api/sectors'),
        fetch('/api/taxonomy')
      ]);

      const actData = await actRes.json() as { results: ApiActor[] };
      const entData = await entRes.json() as { results: Entity[] };
      const secData = await secRes.json() as { results: Sector[] };
      const taxData = await taxRes.json() as { terms: Taxonomy[] };

      if (isMounted) {
        setRows(actData.results || []);
        setEntities(entData.results || []);
        setSectors(secData.results || []);
        setTaxonomies(taxData.terms || []);
      }
    } catch (err) {
      console.error("FETCH_ERROR:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      await refreshData(isMounted);
    })();
    return () => { isMounted = false; };
  }, [refreshData]);

  const handleAction = async (formData: FormData) => {
    await saveActor(formData);
    setIsEditing(false);
    setSelectedId(null);
    await refreshData(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("PURGE_ACTOR? This action cannot be undone.")) {
      try {
        await deleteActor(id.toString());
        await refreshData(true);
      } catch (err) {
        console.error("DELETE_ERROR:", err);
      }
    }
  };

  const toggleExpand = (id: number) => setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const selectedRow = rows.find(r => r.id === selectedId);

  return (
    <main className="flex-1 p-6 overflow-y-auto font-mono text-white bg-black">
      <div className="flex justify-between items-center mb-8 border-b border-slate-900 pb-4">
        <Link href="/admin" className="group flex items-center gap-3 bg-slate-900/50 hover:bg-blue-600/20 px-4 py-2 rounded border border-slate-800 transition-all">
          <span className="text-blue-500 text-lg">«</span>
          <span className="text-white font-bold uppercase tracking-widest text-[10px]">Back_to_Control_Center</span>
        </Link>
        <div className="text-right">
          <h1 className="text-white font-black tracking-widest text-lg uppercase">Personnel_Architect</h1>
          <p className="text-[9px] text-slate-600 uppercase tracking-widest">Node_Status: Online</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-5 sticky top-6 bg-slate-950/50 border border-slate-800 p-6 rounded shadow-xl h-fit">
           <h2 className="text-sm font-black text-blue-500 mb-6 uppercase tracking-widest border-b border-slate-900 pb-3">
             {isEditing ? `Override_Subject [ID: ${selectedId}]` : 'Initialize_New_Subject'}
           </h2>
           
           <ActorForm 
            key={selectedId || 'new'} 
            initialData={isEditing ? selectedRow : null} 
            entities={entities} 
            sectors={sectors} 
            taxonomies={taxonomies} 
            action={handleAction} 
          />

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
                    <div className="flex justify-between items-start">
                      <div className="cursor-pointer flex-1" onClick={() => toggleExpand(row.id!)}>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded mr-2 ${
                          row.status === 'active' ? 'bg-green-900/20 text-green-500' :
                          row.status === 'former' ? 'bg-slate-900/20 text-slate-500' :
                          'bg-red-900/20 text-red-500'
                        }`}>
                          [ {row.status} ]
                        </span>
                        <h3 className="text-xl font-black text-white uppercase mt-2 tracking-tight">
                          {row.full_name}
                        </h3>
                        
                        {/* NEW: Rebuttal Counter Badge */}
                        {row.rebuttal_count !== undefined && row.rebuttal_count > 0 && (
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="text-emerald-500 text-[8px] font-black border border-emerald-900/50 px-2 py-0.5 bg-emerald-900/10">
                                {row.rebuttal_count}_ACTIVE_REBUTTALS
                              </span>
                              <span className="text-[7px] text-slate-600 mt-0.5 uppercase">Fact_Check_Verified</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 items-center">
                        <button onClick={() => toggleExpand(row.id!)} className="bg-slate-900 border border-slate-700 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:bg-slate-800 transition-all">
                          {isExpanded ? "↑ LESS" : "↓ MORE"}
                        </button>
                        <button onClick={() => { setSelectedId(row.id!); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="bg-blue-900/40 border border-blue-500/50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-blue-200 hover:bg-blue-600 hover:text-white transition-all">
                          EDIT
                        </button>
                        <Link
                          href={`/admin/rebuttals?actor_id=${row.id}`}
                          className="text-[9px] border border-emerald-900/50 px-3 py-1 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all font-bold uppercase"
                        >
                          Rebut_Actor
                        </Link>
                        <button onClick={() => handleDelete(row.id!)} className="bg-red-950/40 border border-red-900 px-4 py-2 text-[10px] font-bold text-red-500 hover:bg-red-600 hover:text-white transition-all">
                          [X]
                        </button>
                      </div>
                    </div>

                    <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[800px] opacity-100 mt-4 border-t border-slate-900 pt-4' : 'max-h-0 opacity-0'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase">AFFILIATION:</span>
                        <p className="text-[11px] text-white font-bold">{row.entity_name || 'INDEPENDENT'}</p>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[9px] font-black text-slate-500 uppercase">TITLE:</span>
                        <p className="text-[11px] text-white font-bold">{row.job_title}</p>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed font-sans mb-4 italic border-l-2 border-slate-800 pl-4">
                        {row.bio || "NO_BIOGRAPHY_PROVIDED"}
                      </p>
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
  );
}
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from 'next/link';
import { Edit, Trash2, Maximize2, Minimize2, Loader2 } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SectorForm, { Sector } from '@/components/admin/forms/SectorForm';

export function SectorRegistry() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const hasFetched = useRef(false);

  const fetchSectors = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sectors');
      
      // FIX: Explicitly cast the response to resolve the 'unknown' error
      const data = (await res.json()) as { sectors: Sector[] };
      
      // FIX: Map from data.sectors to match the API response
      const rowsData = data.sectors || []; 
      setSectors(rowsData);
    } catch (err) {
      console.error("FETCH_ERROR:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchSectors();
      hasFetched.current = true;
    }
  }, [fetchSectors]);

  const handleSave = async (formData: Sector) => {
    const method = isEditing ? 'PATCH' : 'POST';
    try {
      const res = await fetch('/api/sectors', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsEditing(false);
        setSelectedId(null);
        fetchSectors();
      }
    } catch (err) {
      console.error("SAVE_ERROR:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("PURGE_SECTOR? This may affect linked entities.")) return;
    try {
      const res = await fetch(`/api/sectors?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchSectors();
    } catch (err) {
      console.error("DELETE_ERROR:", err);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedRow = sectors.find((r: Sector) => r.id === selectedId);

  return (
    <div className="flex min-h-screen bg-black text-white font-mono">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8 border-b border-slate-900 pb-4">
          <Link
            href="/admin"
            className="bg-slate-900 px-4 py-2 border border-slate-800 text-[10px] font-bold uppercase hover:bg-blue-600 transition-all"
          >
            « Back_to_Control_Center
          </Link>
          <div className="text-right">
            <h1 className="text-xl font-black tracking-tighter uppercase">Sector_Authority_Index</h1>
            <p className="text-[9px] text-slate-500 uppercase">System: Category_Management</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-5 bg-slate-950/50 border border-slate-800 p-6 rounded sticky top-8">
            <h2 className="text-blue-500 text-[10px] font-black uppercase mb-6 tracking-widest">
              {isEditing ? `Modify_Sector [ID: ${selectedId}]` : 'Initialize_New_Sector'}
            </h2>
            <SectorForm
              key={selectedId || 'new'}
              initialData={isEditing ? selectedRow : null}
              onSave={handleSave}
            />
            {isEditing && (
              <button
                onClick={() => { setIsEditing(false); setSelectedId(null); }}
                className="w-full mt-4 py-3 text-[10px] text-slate-500 hover:text-white uppercase font-bold border border-dashed border-slate-800 transition-all"
              >
                [ Abort_Edit ]
              </button>
            )}
          </div>

          <div className="xl:col-span-7">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em]">
                Active_Sectors
              </h2>
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
              )}
            </div>

            <div className="space-y-2">
              {sectors.map((sector: Sector) => {
                const isExpanded = expandedIds.includes(sector.id!);
                return (
                  <div
                    key={sector.id}
                    className={`p-4 border transition-all ${
                      selectedId === sector.id
                        ? 'border-blue-500 bg-blue-900/10'
                        : 'border-slate-900 bg-black'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(sector.id!)}>
                        <h3 className="text-lg font-black uppercase">{sector.name}</h3>
                        <p className="text-slate-500 text-[9px] font-mono uppercase">
                          URL_SLUG: {sector.slug}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedId(sector.id!);
                            setIsEditing(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="border border-slate-800 px-3 py-2 text-[10px] font-bold hover:bg-white hover:text-black transition-all"
                        >
                          <Edit className="h-3 w-3 inline mr-1" /> EDIT
                        </button>
                        <button
                          onClick={() => handleDelete(sector.id!)}
                          className="border border-red-900 px-3 py-2 text-[10px] font-bold text-red-500 hover:bg-red-600 hover:text-white transition-all"
                        >
                          <Trash2 className="h-3 w-3 inline mr-1" /> [X]
                        </button>
                        <button
                          onClick={() => toggleExpand(sector.id!)}
                          className="border border-slate-800 px-3 py-2 text-[10px] font-bold hover:bg-slate-800 transition-all"
                        >
                          {isExpanded ? (
                            <Minimize2 className="h-3 w-3" />
                          ) : (
                            <Maximize2 className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && sector.seo_description && (
                      <div className="mt-4 pt-4 border-t border-slate-800 text-slate-400 text-sm font-sans italic">
                        {sector.seo_description}
                      </div>
                    )}
                  </div>
                );
              })}
              {!isLoading && sectors.length === 0 && (
                <div className="text-center py-12 border border-dashed border-slate-800">
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest">
                    No sectors defined yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
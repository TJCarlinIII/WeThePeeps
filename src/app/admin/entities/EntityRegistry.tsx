"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import AdminSidebar from "@/components/admin/AdminSidebar";
import EntityForm, { Entity } from '@/components/admin/forms/EntityForm';

interface Sector {
  id: number;
  name: string;
}

interface ApiEntity extends Entity {
  is_critical?: number | string;
  sector_name?: string;
}

export default function EntityRegistry() {
  const [rows, setRows] = useState<ApiEntity[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const hasFetched = useRef(false);

  const refreshData = useCallback(async () => {
    try {
      const [entRes, secRes] = await Promise.all([
        fetch('/api/entities'),
        fetch('/api/sectors')
      ]);

      const entData = await entRes.json() as { results: ApiEntity[] };
      const secData = await secRes.json() as { results: Sector[] };

      setRows(entData.results || []);
      setSectors(secData.results || []);
    } catch (err) {
      console.error("FETCH_ERROR:", err);
    }
  }, []);

  // Timeout to move execution out of the render cycle, satisfying the strictest linters
  useEffect(() => {
    if (!hasFetched.current) {
      const timer = setTimeout(() => {
        refreshData();
        hasFetched.current = true;
      }, 0);
      return () => clearTimeout(timer);
    }
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
        refreshData();
      }
    } catch (err) {
      console.error("SAVE_ERROR:", err);
    }
  };

  const selectedRow = rows.find(r => r.id === selectedId);

  return (
    <div className="flex min-h-screen bg-black text-white font-mono">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto text-slate-300">
        <div className="flex justify-between items-center mb-8 border-b border-slate-900 pb-4">
          <Link href="/admin" className="bg-slate-900 px-4 py-2 border border-slate-800 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all text-white">
            « Back_to_Control_Center
          </Link>
          <div className="text-right">
            <p className="text-[9px] text-slate-500 uppercase">Status: Ingress_Active</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-5 bg-slate-950/50 border border-slate-800 p-6 rounded shadow-xl h-fit sticky top-8">
             <h2 className="text-blue-500 text-[10px] font-black uppercase mb-6 tracking-[0.2em]">
               {isEditing ? `Override_Entity [ID: ${selectedId}]` : 'Create_New_Entity'}
             </h2>
             <EntityForm
                key={selectedId || 'new'}
                initialData={isEditing ? selectedRow : null}
                sectors={sectors}
                onSave={handleSave}
             />
          </div>

          <div className="xl:col-span-7">
            <h2 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] mb-4">Live_Manifest</h2>
            <div className="space-y-3">
              {rows.map(row => {
                const isCritical = row.is_critical === '1' || row.is_critical === 1;
                const sector = sectors.find(s => s.id === Number(row.sector_id));
                const sectorName = sector?.name || row.sector_name;

                return (
                  <div
                    key={row.id}
                    className={`p-4 border transition-all duration-300 ${
                      selectedId === row.id
                        ? 'border-blue-500 bg-blue-900/10'
                        : isCritical
                          ? 'border-red-600 bg-red-950/20 shadow-[0_0_15px_rgba(220,38,38,0.15)]'
                          : 'border-slate-900 bg-black'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className={`text-lg font-black uppercase leading-none ${isCritical ? 'text-red-500' : 'text-white'}`}>
                            {row.name}
                          </h3>
                          {isCritical && (
                            <span className="animate-pulse bg-red-600 text-white text-[8px] px-2 py-0.5 font-black tracking-tighter rounded-full">
                              CRITICAL_ALERT
                            </span>
                          )}
                        </div>

                        <div className="flex gap-4 mt-3">
                          <p className="text-blue-400 text-[10px] font-mono italic tracking-tighter">slug: {row.slug}</p>
                          {sectorName && (
                            <p className="text-slate-500 text-[10px] font-mono uppercase tracking-tighter">Sector: {sectorName}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => { setSelectedId(row.id!); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`border px-4 py-2 text-[10px] font-bold transition-all ${
                            isCritical
                              ? 'border-red-600 text-red-500 hover:bg-red-600 hover:text-white'
                              : 'border-slate-800 text-white hover:bg-white hover:text-black'
                          }`}
                        >
                          EDIT
                        </button>
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
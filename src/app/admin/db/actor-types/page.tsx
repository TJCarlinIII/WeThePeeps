"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import ActorTypeForm, { ActorType } from '@/components/admin/forms/ActorTypeForm';

interface ApiResponse<T> {
  results?: T[];
}

export default function ActorTypesManager() {
  const [rows, setRows] = useState<ActorType[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch('/api/actor-types')
      .then(res => res.json() as Promise<ApiResponse<ActorType> | ActorType[]>)
      .then((data) => {
        setRows(Array.isArray(data) ? data : data.results || []);
      })
      .catch(err => console.error("FETCH_ERROR:", err));
  }, []);

  const handleSave = async (formData: ActorType) => {
    const method = isEditing ? 'PATCH' : 'POST';
    const payload = isEditing ? { ...formData, id: selectedId ?? undefined } : formData;

    try {
      const res = await fetch('/api/actor-types', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("CLASSIFICATION_MANIFEST_UPDATED");
        window.location.reload();
      }
    } catch (err) {
      console.error("SAVE_ERROR:", err);
    }
  };

  const selectedRow = rows.find(r => r.id === selectedId);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-black text-white p-8 font-mono">
        <Link href="/admin/db" className="text-[#4A90E2] text-[10px] underline uppercase tracking-widest">
          ← BACK_TO_DATABASE_HUB
        </Link>
        
        <div className="mt-8 border border-slate-700 p-6 rounded-lg bg-slate-900/20 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[#4A90E2] uppercase tracking-[0.2em] text-xs font-bold">
              {isEditing ? `TYPE_MODIFICATION [ID: ${selectedId}]` : 'CORE_TAXONOMY_ACTOR_TYPES'}
            </h2>
            {isEditing && (
              <button 
                onClick={() => { setIsEditing(false); setSelectedId(null); }}
                className="text-slate-500 text-[9px] border border-slate-800 px-3 py-1 hover:text-white"
              >
                [ ABORT ]
              </button>
            )}
          </div>
          
          <ActorTypeForm 
            initialData={isEditing ? selectedRow : null} 
            onSave={(data) => { handleSave(data); }} 
          />
        </div>

        <div className="mt-12">
          <h3 className="text-slate-400 text-[10px] uppercase mb-4 tracking-widest font-bold">Type_Manifest</h3>
          <div className="border border-slate-800 rounded bg-black/40 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/40 border-b border-slate-700 text-slate-500 text-[9px] uppercase font-black">
                  <th className="p-4 w-12 text-center">SEL</th>
                  <th className="p-4">Type_Name</th>
                  <th className="p-4 text-right">Operations</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr 
                    key={row.id} 
                    onClick={() => setSelectedId(row.id ?? null)}
                    className={`border-b border-slate-900 cursor-pointer transition-colors ${selectedId === row.id ? "bg-slate-800/60" : "hover:bg-slate-900/40"}`}
                  >
                    <td className="p-4 text-center">
                       <div className={`w-2 h-2 rounded-full mx-auto transition-all ${selectedId === row.id ? "bg-[#4A90E2] shadow-[0_0_5px_#4A90E2]" : "bg-slate-700"}`} />
                    </td>
                    <td className={`p-4 font-bold ${selectedId === row.id ? "text-white" : "text-slate-400"}`}>{row.name}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(row.id ?? null);
                          setIsEditing(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} 
                        className="text-[#4A90E2] text-[9px] uppercase hover:underline"
                      >
                        [ EDIT ]
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
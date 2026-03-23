"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
// Fix: Ensure this path matches your folder structure exactly 
// (e.g., src/components/admin/DynamicTableForm.tsx)
import DynamicIngressForm from '@/components/admin/DynamicTableForm';

// Fix: params must be typed as a Promise in Next.js 15
interface TablePageProps {
  params: Promise<{ table: string }>;
}

// Define a generic type for our database rows to avoid 'any'
interface DbRow {
  id: number;
  name?: string;
  title?: string;
  full_name?: string;
  code_number?: string;
  [key: string]: unknown;
}

export default function TableManager(props: TablePageProps) {
  // Fix: Unwrap the async params using React.use()
  const params = use(props.params);
  const tableName = params.table;

  // --- STATE ---
  const [rows, setRows] = useState<DbRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DbRow | null>(null);
  
  // Commented out 'status' until we add the visual loading spinner to avoid ESLint errors
  // const [status, setStatus] = useState({ type: '', msg: '' });

  // --- DATA LOADING ---
  useEffect(() => {
    const fetchRows = async () => {
      try {
        const response = await fetch(`/api/db/${tableName}`);
        const data = await response.json();
        if (Array.isArray(data)) setRows(data);
      } catch (err) {
        console.error("Failed to load records:", err);
      }
    };
    fetchRows();
  }, [tableName]);

  // --- LOGIC FUNCTIONS ---

  const handlePurge = async () => {
    if (!selectedId) return alert("Select a record first.");
    if (!confirm("CRITICAL_WARNING: Permanently purge this record?")) return;

    try {
      const res = await fetch(`/api/db/${tableName}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedId })
      });

      if (res.ok) {
        alert("RECORD_PURGED");
        window.location.reload();
      }
    } catch (err) {
      console.error("Purge error:", err);
      alert("PURGE_FAILURE");
    }
  };

  const handleEditInitiate = () => {
    const row = rows.find(r => r.id === selectedId);
    if (row) {
      setSelectedRow(row);
      setIsEditing(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSave = async (formData: Record<string, unknown>) => {
    // setStatus({ type: 'loading', msg: 'COMMITTING_TO_D1...' });
    
    const method = isEditing ? 'PATCH' : 'POST';
    const payload = isEditing ? { ...formData, id: selectedId } : formData;

    try {
      const res = await fetch(`/api/db/${tableName}`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(isEditing ? "RECORD_UPDATED" : "RECORD_COMMITTED");
        setIsEditing(false);
        window.location.reload();
      } else {
        const errData = await res.json() as { error: string };
        alert(`ERROR: ${errData.error}`);
      }
    } catch (err) {
      console.error("Save failure:", err);
      alert("TRANSMISSION_FAILURE: Could not reach the API.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono space-y-10">
      <Link href="/admin/db" className="text-[#4A90E2] text-[10px] underline uppercase tracking-widest">
        ← BACK_TO_DATABASE_HUB
      </Link>
      
      <section className="border border-[#4A90E2]/30 p-6 bg-slate-900/10 rounded-lg">
        <h3 className="text-[#4A90E2] text-xs font-bold mb-6 uppercase tracking-[0.2em]">
          {isEditing ? `UPDATE_ENTRY_ID:${selectedId}` : `NEW_${tableName.toUpperCase()}_ENTRY`}
        </h3>
        
        <DynamicIngressForm 
          key={isEditing ? `edit-${selectedId}` : 'new-entry'} // Forces a reset when switching modes
          tableName={tableName} 
          onSave={handleSave} 
          initialData={isEditing ? selectedRow : null} 
        />

        {isEditing && (
          <button 
            onClick={() => { setIsEditing(false); setSelectedRow(null); }}
            className="mt-4 text-[9px] text-slate-500 underline uppercase"
          >
            Cancel_Edit_And_Create_New
          </button>
        )}
      </section>

      <section className="border border-slate-800 p-6 rounded-lg bg-black">
        <header className="flex justify-between items-center mb-6">
           <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Existing_Records</h3>
           
           <div className="flex gap-4">
              <button 
                onClick={handleEditInitiate}
                disabled={!selectedId}
                className="text-[10px] text-[#4A90E2] font-bold border border-[#4A90E2]/30 px-4 py-2 hover:bg-[#4A90E2] hover:text-black disabled:opacity-20 transition-all"
              >
                EDIT_SELECTED
              </button>
              <button 
                onClick={handlePurge}
                disabled={!selectedId}
                className="text-[10px] text-red-600 font-bold border border-red-900/30 px-4 py-2 hover:bg-red-600 hover:text-black disabled:opacity-20 transition-all"
              >
                PURGE_SELECTED
              </button>
           </div>
        </header>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-600 border-b border-slate-800 uppercase text-[9px]">
              <th className="pb-4">SEL</th>
              <th className="pb-4">ID</th>
              <th className="pb-4">Label/Identifier</th>
              <th className="pb-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-900 hover:bg-slate-900/50 group">
                <td className="py-3">
                  <input 
                    type="radio" 
                    name="row-select" 
                    checked={selectedId === row.id}
                    onChange={() => setSelectedId(row.id)} 
                    className="accent-[#4A90E2]"
                  />
                </td>
                <td className="py-3 text-slate-700">{row.id}</td>
                <td className="py-3 text-slate-300 font-bold">
                  {row.name || row.title || row.full_name || row.code_number || "Unnamed Record"}
                </td>
                <td className="py-3 text-right text-slate-600 group-hover:text-[#4A90E2] uppercase text-[9px]">
                  Ready
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {rows.length === 0 && (
          <p className="text-center text-slate-700 py-10 uppercase text-[10px] tracking-[0.5em]">
            No_Records_Found_In_{tableName.toUpperCase()}
          </p>
        )}
      </section>
    </div>
  );
}
// src/components/admin/ArchitectView.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { TABLE_SCHEMAS } from '@/lib/schemas';
import { Edit3, Trash2 } from 'lucide-react';
import { saveRecord, deleteRecord, getRecords } from '@/app/admin/actions';
import { useFormState } from 'react-dom';

interface ArchitectProps {
  table: 'incidents' | 'rebuttals' | 'cases' | 'media';
  title: string;
}

type RecordType = {
  id: number;
  title?: string;
  name?: string;
  full_name?: string;
  status?: string;
  [key: string]: unknown;
};

export default function ArchitectView({ table, title }: ArchitectProps) {
  const schema = TABLE_SCHEMAS[table];
  const [records, setRecords] = useState<RecordType[]>([]);
  const [loading, setLoading] = useState(true);

  // Wrap saveRecord to match useFormState signature
  const [formState, formAction] = useFormState(
    async (_prevState: unknown, formData: FormData) => {
      return await saveRecord(formData);
    },
    null
  );

  // Fetch records on mount - Refactored for { success, data } response
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await getRecords(table);
        if (result.success && Array.isArray(result.data)) {
          setRecords(result.data as RecordType[]);
        } else {
          setRecords([]);
        }
      } catch (err) {
        console.error("LOAD_ERROR:", err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [table]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-black text-white font-mono">
      {/* LEFT PANE: FORM / DATA INGRESS */}
      <div className="w-full lg:w-1/3 border-r border-slate-900 p-8 bg-slate-950/20">
        <header className="mb-8">
          <h2 className="text-[#4A90E2] text-sm font-black tracking-widest uppercase">
            INITIALIZING_NEW_NODE // {table}
          </h2>
        </header>

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="table_name" value={table} />
          {schema.map((field) => (
            <div key={field.name} className="flex flex-col gap-2">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  placeholder={field.placeholder}
                  className="bg-slate-900 border border-slate-800 p-3 text-xs focus:border-[#4A90E2] outline-none transition-colors min-h-[100px]"
                />
              ) : field.type === 'select' ? (
                <select name={field.name} className="bg-slate-900 border border-slate-800 p-3 text-xs focus:border-[#4A90E2] outline-none">
                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  className="bg-slate-900 border border-slate-800 p-3 text-xs focus:border-[#4A90E2] outline-none transition-colors"
                />
              )}
            </div>
          ))}

          <button className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-black font-black py-4 text-[10px] uppercase tracking-[0.2em] transition-all">
            COMMIT_{table.toUpperCase()}_TO_LEDGER
          </button>
          
          {/* Safe Type Check for Error Display */}
          {formState && !formState.success && (
            <p className="text-red-500 text-xs mt-2">
              {('error' in formState ? formState.error : "Critical_Failure: Database rejection.")}
            </p>
          )}
          {formState && formState.success && (
            <p className="text-green-500 text-xs mt-2">Record committed successfully.</p>
          )}
        </form>
      </div>

      {/* RIGHT PANE: LIVE MANIFEST */}
      <div className="flex-1 p-8 bg-black">
        <div className="flex justify-between items-center mb-10 border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter text-white uppercase">{title}</h1>
            <p className="text-[10px] text-emerald-500 uppercase mt-1 font-bold tracking-[0.2em]">
              Node_Status: Online // Live_Manifest
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-700 animate-pulse text-xs uppercase">Syncing_Records...</p>
          ) : records.map((record) => (
            <div key={record.id} className="group border border-slate-900 bg-slate-950/40 p-6 flex justify-between items-center hover:border-[#4A90E2]/40 transition-all">
              <div>
                <h3 className="text-white font-bold text-sm uppercase tracking-tight">
                  {record.title || record.name || record.full_name || `Record #${record.id}`}
                </h3>
                <p className="text-[9px] text-slate-500 uppercase mt-1">{record.status || 'Verified'}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 border border-slate-800 hover:bg-[#4A90E2]/10 hover:border-[#4A90E2] transition-colors">
                  <Edit3 size={14} className="text-[#4A90E2]" />
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Confirm deletion?")) {
                      // Corrected: Passing 'table' and 'record.id' as two separate arguments
                      const result = await deleteRecord(table, record.id);
                      if (result.success) {
                        window.location.reload(); 
                      } else {
                        alert("Purge_Failed: Database rejected request.");
                      }
                    }
                  }}
                  className="p-2 border border-slate-800 hover:bg-red-500/10 hover:border-red-500 transition-colors"
                >
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
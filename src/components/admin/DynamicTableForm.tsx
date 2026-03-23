"use client";
import React, { useState, useEffect } from 'react';
import { TABLE_SCHEMAS } from '@/lib/schemas';

// --- STRICT INTERFACES ---
interface SchemaField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'relation' | 'date';
  placeholder?: string;
  table?: string;
}

interface RelationData {
  id: number | string;
  name?: string;
  full_name?: string;
  title?: string;
  code_number?: string;
}

interface DynamicFormProps {
  tableName: string;
  onSave: (formData: Record<string, unknown>) => void;
  initialData?: Record<string, unknown> | null;
}

export default function DynamicIngressForm({ tableName, onSave, initialData }: DynamicFormProps) {
  // --- STATE ---
  // We initialize state DIRECTLY from props. 
  // The 'key' in the parent component (TableManager) handles the resetting.
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData || {});
  const [relations, setRelations] = useState<Record<string, RelationData[]>>({});

  // --- EFFECT: LOAD DROP-DOWN RELATIONS ---
  useEffect(() => {
    const schema = (TABLE_SCHEMAS as Record<string, SchemaField[]>)[tableName];
    if (!schema) return;

    const relationFields = schema.filter(f => f.type === 'relation' && f.table);

    relationFields.forEach(async (field) => {
      if (!field.table) return;
      try {
        const response = await fetch(`/api/db/${field.table}`);
        const data: RelationData[] = await response.json();
        if (Array.isArray(data)) {
          setRelations(prev => ({ ...prev, [field.table!]: data }));
        }
      } catch (err) {
        console.error(`RELATION_FETCH_ERROR_${field.table}:`, err);
      }
    });
  }, [tableName]);

  const schema = (TABLE_SCHEMAS as Record<string, SchemaField[]>)[tableName];
  if (!schema) return <div className="text-red-500 font-mono p-4 uppercase">Schema_Not_Defined</div>;

  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
      {schema.map((field) => (
        <div key={field.name} className="flex flex-col">
          <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest">
            {field.label}
          </label>
          
          {field.type === 'relation' ? (
            <select 
              className="bg-black border border-slate-700 p-3 text-sm w-full focus:border-[#4A90E2] outline-none text-white"
              value={(formData[field.name] as string | number) || ""}
              onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
            >
              <option value="">Select {field.table}...</option>
              {field.table && relations[field.table]?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name || item.full_name || item.title || item.code_number || `ID: ${item.id}`}
                </option>
              ))}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea 
              className="bg-black border border-slate-700 p-3 text-sm h-32 focus:border-[#4A90E2] outline-none text-white font-mono"
              value={(formData[field.name] as string) || ""}
              onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
            />
          ) : (
            <input 
              type={field.type} 
              placeholder={field.placeholder}
              className="bg-black border border-slate-700 p-3 text-sm focus:border-[#4A90E2] outline-none text-white"
              value={(formData[field.name] as string | number) || ""}
              onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
            />
          )}
        </div>
      ))}

      <button 
        type="button" 
        onClick={() => onSave(formData)}
        className="md:col-span-2 bg-[#4A90E2] hover:bg-[#357ABD] text-black py-4 font-black uppercase tracking-[0.3em] mt-4 transition-all text-xs"
      >
        {initialData ? `UPDATE_${tableName.toUpperCase()}` : `COMMIT_NEW_${tableName.toUpperCase()}`}
      </button>
    </form>
  );
}
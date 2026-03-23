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
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData || {});
  const [relations, setRelations] = useState<Record<string, RelationData[]>>({});
  const [relatedData, setRelatedData] = useState<Record<string, RelationData[]>>({});

  // --- EFFECT: LOAD DROP-DOWN RELATIONS (schema-based) ---
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

  // --- EFFECT: FETCH RELATED DATA FOR _id FIELDS ---
  useEffect(() => {
    const fetchRelations = async () => {
      const schema = (TABLE_SCHEMAS as Record<string, SchemaField[]>)[tableName];
      if (!schema) return;
      
      const relFields = schema.filter(col => col.name.endsWith('_id') && col.name !== 'id');
      const data: Record<string, RelationData[]> = {};
      
      for (const field of relFields) {
        const tableNameRel = field.name.replace('_id', 's'); // e.g. sector_id -> sectors
        try {
          const response = await fetch(`/api/db/${tableNameRel}`); 
          const result = await response.json();
          if (Array.isArray(result)) {
            data[field.name] = result;
          }
        } catch (err) {
          console.error(`FETCH_ERROR_${field.name}:`, err);
        }
      }
      setRelatedData(data);
    };
    
    fetchRelations();
  }, [tableName]);

  // --- HELPER: RENDER FIELD BASED ON TYPE ---
  const renderField = (field: SchemaField) => {
    // Dropdown logic for fields ending in _id (auto-fetched relations)
    if (field.name.endsWith('_id') && field.name !== 'id') {
      return (
        <select
          value={(formData[field.name] as string | number) || ''}
          onChange={(e) => setFormData({ ...formData, [field.name]: parseInt(e.target.value) })}
          className="bg-black border border-slate-700 p-3 text-sm w-full focus:border-[#4A90E2] outline-none text-white"
        >
          <option value="">-- Select {field.label} --</option>
          {relatedData[field.name]?.map((item: RelationData) => (
            <option key={item.id} value={item.id}>
              {item.name || item.title || item.full_name || item.code_number || `ID: ${item.id}`}
            </option>
          ))}
        </select>
      );
    }

    // Existing schema-based rendering for other field types
    if (field.type === 'relation') {
      return (
        <select 
          className="bg-black border border-slate-700 p-3 text-sm w-full focus:border-[#4A90E2] outline-none text-white"
          value={(formData[field.name] as string | number) || ""}
          onChange={(e) => {
  const val = e.target.value;
  setFormData({ 
    ...formData, 
    [field.name]: val === "" ? null : parseInt(val, 10) 
  });
}}
        >
          <option value="">Select {field.table}...</option>
          {field.table && relations[field.table]?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name || item.full_name || item.title || item.code_number || `ID: ${item.id}`}
            </option>
          ))}
        </select>
      );
    }
    
    if (field.type === 'textarea') {
      return (
        <textarea 
          className="bg-black border border-slate-700 p-3 text-sm h-32 focus:border-[#4A90E2] outline-none text-white font-mono"
          value={(formData[field.name] as string) || ""}
          onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
        />
      );
    }

    // Default: text/date input
    return (
      <input 
        type={field.type} 
        placeholder={field.placeholder}
        className="bg-black border border-slate-700 p-3 text-sm focus:border-[#4A90E2] outline-none text-white"
        value={(formData[field.name] as string | number) || ""}
        onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
      />
    );
  };

  const schema = (TABLE_SCHEMAS as Record<string, SchemaField[]>)[tableName];
  if (!schema) return <div className="text-red-500 font-mono p-4 uppercase">Schema_Not_Defined</div>;

  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
      {schema.map((field) => {
        // Skip system fields
        if (field.name === 'id' || field.name === 'created_at') return null;
        
        return (
          <div key={field.name} className="flex flex-col">
            <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest">
              {field.label}
            </label>
            {renderField(field)}
          </div>
        );
      })}

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
// File: src/components/admin/DynamicForm.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { TABLE_SCHEMAS, SchemaField } from "@/lib/schemas";

interface RelationOption {
  id: number;
  name: string;
  [key: string]: string | number | boolean | undefined | null; 
}

interface Props {
  table: keyof typeof TABLE_SCHEMAS;
  initialData?: Record<string, string | number | null> | null;
  relations?: Record<string, RelationOption[]>;
  onSave: (data: Record<string, unknown>) => void;
}

export default function DynamicForm({ table, initialData, relations = {}, onSave }: Props) {
  const schema = TABLE_SCHEMAS[table];

  const buildInitialState = useCallback(() => {
    const obj: Record<string, string | number | null> = {};
    schema.forEach((field: SchemaField) => {
      obj[field.name] = initialData?.[field.name] ?? "";
    });
    return obj;
  }, [schema, initialData]);

  const [formData, setFormData] = useState<Record<string, string | number | null>>(buildInitialState());

  useEffect(() => {
    setFormData(buildInitialState());
  }, [buildInitialState]);

  const inputClass = "w-full bg-black border border-slate-800 p-2 text-xs text-white font-mono focus:border-blue-500 outline-none";
  const labelClass = "block text-[9px] text-slate-500 uppercase mb-1 font-bold tracking-widest";

  const renderField = (field: SchemaField) => {
    const value = formData[field.name] ?? "";

    switch (field.type) {
      case "text":
      case "number":
        return (
          <input
            type={field.type}
            value={String(value)}
            placeholder={field.placeholder}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            className={inputClass}
          />
        );

      case "textarea":
        return (
          <textarea
            value={String(value)}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            className={`${inputClass} h-24`}
          />
        );

      case "select":
        return (
          <select
            value={String(value)}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            className={inputClass}
          >
            {field.options?.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case "relation":
        let options = relations[field.table || ""] || [];
        
        // FIX: Handle Dependent Filtering properly using strict Number casting
        if (field.dependsOn) {
          const parentVal = formData[field.dependsOn];
          options = options.filter((opt: RelationOption) => 
            Number(opt[field.dependsOn!]) === Number(parentVal)
          );
        }

        return (
          <select
            value={String(value)}
            onChange={(e) => setFormData({ ...formData, [field.name]: Number(e.target.value) })}
            className={inputClass}
          >
            <option value="">{field.dependsOn && !formData[field.dependsOn] ? `-- Select ${field.dependsOn} First --` : "-- Select --"}</option>
            {options.map((o: RelationOption) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }}
      className="space-y-4"
    >
      {schema.map((field: SchemaField) => (
        <div key={field.name}>
          <label className={labelClass}>{field.label}</label>
          {renderField(field)}
        </div>
      ))}

      <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 text-[10px] font-black uppercase tracking-[0.3em] transition-colors">
        Save_Record
      </button>
    </form>
  );
}
"use client";

import React, { useState } from "react";
import { slugify } from "@/lib/stringutils";

export interface Entity {
  id?: number;
  name: string;
  sector_id: number;
  description: string;
  slug: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface EntityFormProps {
  initialData?: Entity | null;
  sectors: { id: number; name: string }[];
  onSave: (data: Entity) => void;
}

export default function EntityForm({ initialData, sectors, onSave }: EntityFormProps) {
  // 1. Define the base/empty state
  const emptyState: Entity = {
    name: "",
    sector_id: 0,
    description: "",
    slug: "",
    seo_description: "",
    seo_keywords: ""
  };

  // 2. Initialize state directly (Fixes ESLint cascading render error)
  const [formData, setFormData] = useState<Entity>(initialData || emptyState);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // Automatically generate slug using stringutils
    const slug = slugify(name); 
    setFormData(prev => ({ ...prev, name, slug }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Data Integrity Check: Ensure a sector is assigned
    if (Number(formData.sector_id) === 0) {
      alert("CRITICAL_ERROR: Sector_Assignment_Required");
      return;
    }
    
    onSave(formData);
  };

  const inputClass = "w-full bg-black border border-slate-800 p-2 text-xs text-white focus:border-blue-500 outline-none transition-all font-mono";
  const labelClass = "block text-[9px] text-slate-500 uppercase mb-1 font-bold tracking-widest";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Organization_Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          className={inputClass}
          required
          placeholder="e.g. Redford Township"
        />
      </div>

      <div>
        <label className={labelClass}>Sector_Assignment</label>
        <select
          value={formData.sector_id}
          onChange={(e) => setFormData({ ...formData, sector_id: Number(e.target.value) })}
          className={inputClass}
          required
        >
          <option value="0">-- SELECT_SECTOR --</option>
          {sectors.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>URL_Slug (Auto-Generated)</label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className={`${inputClass} text-blue-400 border-dashed`}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Entity_Summary</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={`${inputClass} h-24 resize-none`}
        />
      </div>

      <div className="border-t border-slate-900 pt-4">
        <label className={`${labelClass} text-emerald-500`}>SEO_Description</label>
        <textarea
          value={formData.seo_description || ""}
          onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
          className={`${inputClass} h-16 resize-none`}
        />
      </div>

      <div>
        <label className={`${labelClass} text-emerald-500`}>SEO_Keywords</label>
        <input
          type="text"
          value={formData.seo_keywords || ""}
          onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
          className={inputClass}
        />
      </div>

      <button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 text-[10px] uppercase tracking-[0.3em]"
      >
        Commit_to_Database
      </button>
    </form>
  );
}